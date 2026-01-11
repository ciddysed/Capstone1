import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, Badge } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import ChatDrawer from "../../../pages/applicants/ApplicationTrack/components/ChatDrawer";
import axios from "axios";
import { BACKEND_URL } from "../../../config";

const ProgramAdminChat = ({ programAdminId, colors }) => {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat list for program admin (use chat-list endpoint for correct structure)
  const fetchChatList = useCallback(async () => {
    if (!programAdminId) return;
    setInboxLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/messages/inbox/admin/chat-list?adminId=${programAdminId}`);
      setChatList(response.data || []);
    } catch (error) {
      setChatList([]);
      console.error("Failed to fetch chat list:", error);
    } finally {
      setInboxLoading(false);
    }
  }, [programAdminId]);

  // Fetch conversation
  const fetchConversation = useCallback(async (participantId, participantRole) => {
    if (!programAdminId || !participantId) return;
    setConversationLoading(true);
    let endpoint = "";
    try {
      console.log("[DEBUG] fetchConversation called with:", { participantId, participantRole, programAdminId });
      if (participantRole === "APPLICANT") {
        // Use applicant-admin endpoint with applicantId and adminId
        endpoint = `${BACKEND_URL}/api/messages/conversation/applicant-admin?applicantId=${participantId}&adminId=${programAdminId}`;
      } else if (participantRole === "EVALUATOR") {
        // Use evaluator-admin endpoint with evaluatorId and adminId
        endpoint = `${BACKEND_URL}/api/messages/conversation/evaluator-admin?evaluatorId=${participantId}&adminId=${programAdminId}`;
      } else {
        // Unknown role, do not fetch
        console.error("[DEBUG] Unknown participantRole for conversation fetch:", participantRole);
        setConversationMessages([]);
        setConversationLoading(false);
        return;
      }
      console.log("[DEBUG] Fetching conversation from endpoint:", endpoint);
      const response = await axios.get(endpoint);
      console.log("[DEBUG] Backend response for conversation:", response.data);
      setConversationMessages(response.data || []);
    } catch (error) {
      let errorMsg = "Failed to fetch conversation.";
      if (error.response?.data) {
        errorMsg += `\nBackend: ${JSON.stringify(error.response?.data)}`;
      } else if (error.message) {
        errorMsg += `\n${error.message}`;
      }
      alert(errorMsg);
      console.error("[DEBUG] Fetch conversation error:", error);
      console.error("[DEBUG] Endpoint used:", endpoint);
      if (error.response) {
        console.error("[DEBUG] Error response data:", error.response.data);
        console.error("[DEBUG] Error response status:", error.response.status);
        console.error("[DEBUG] Error response headers:", error.response.headers);
      }
      setConversationMessages([]);
    } finally {
      setConversationLoading(false);
    }
  }, [programAdminId]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !programAdminId) return;
    // Validate recipient exists in chatList
    const validRecipient = chatList.some(
      (c) =>
        c.participantId === selectedConversation.participantId &&
        c.participantRole === selectedConversation.participantRole
    );
    if (!validRecipient) {
      alert("Cannot send message: recipient does not exist or is not valid.");
      return;
    }
    // Validate participantId is a valid number
    const participantIdNum = Number(selectedConversation.participantId);
    if (
      selectedConversation.participantRole === "APPLICANT" && Number.isNaN(participantIdNum)
    ) {
      alert("Invalid applicant selected. Please try again.");
      return;
    }
    setSendingMessage(true);
    try {
      const payload = {
        senderType: "PROGRAM_ADMIN",
        senderAdmin: { adminId: Number(programAdminId) },
        content: newMessage.trim(),
      };
      if (selectedConversation.participantRole === "APPLICANT") {
        payload.recipientType = "APPLICANT";
        payload.recipientApplicant = { applicantId: participantIdNum };
      } else if (selectedConversation.participantRole === "EVALUATOR") {
        payload.recipientType = "EVALUATOR";
        payload.recipientEvaluator = { evaluatorId: Number(selectedConversation.participantId) };
      }
      // Only send minimal user objects with IDs, not full objects
      console.log("Sending message payload:", payload);
      await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      setNewMessage("");
      await fetchConversation(selectedConversation.participantId, selectedConversation.participantRole);
    } catch (error) {
      let errorMsg = "Failed to send message.";
      if (error.response?.data) {
        errorMsg += `\nBackend: ${JSON.stringify(error.response?.data)}`;
      } else if (error.message) {
        errorMsg += `\n${error.message}`;
      }
      alert(errorMsg);
      console.error("Send message error:", error);
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, selectedConversation, programAdminId, fetchConversation, chatList]);

  // Open conversation
  const openConversation = useCallback((chat) => {
    if (!chat) return;
    setSelectedConversation({
      participantId: chat.participantId,
      participantName: chat.participantName,
      participantRole: chat.participantRole,
    });
  }, []);

  // Fetch chat list when inbox opens
  useEffect(() => {
    if (inboxOpen) fetchChatList();
  }, [inboxOpen, fetchChatList]);

  // Fetch conversation when selectedConversation changes
  useEffect(() => {
    if (selectedConversation?.participantId && selectedConversation?.participantRole) {
      fetchConversation(selectedConversation?.participantId, selectedConversation?.participantRole);
    }
  }, [selectedConversation, fetchConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && conversationMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationMessages]);

  // Count unread messages
  const unreadCount = chatList.filter((c) => c.unread).length;

  return (
    <>
      <Tooltip title="Messages">
        <IconButton onClick={() => setInboxOpen(true)}>
          <Badge badgeContent={unreadCount} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <ChatDrawer
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        chatList={chatList}
        loading={inboxLoading}
        selectedConversation={selectedConversation}
        onSelectConversation={openConversation}
        onCloseConversation={() => setSelectedConversation(null)}
        conversationMessages={conversationMessages}
        conversationLoading={conversationLoading}
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={sendMessage}
        sendingMessage={sendingMessage}
        messagesEndRef={messagesEndRef}
        formatMessageTime={(ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
        colors={colors || { primary: { main: "#6A0000" }, secondary: { main: "#FFC72C" }, accent: { info: "#0288d1" }, neutral: { 200: "#e8e4df", 100: "#f5f3f0" } }}
      />
    </>
  );
};


ProgramAdminChat.propTypes = {
  programAdminId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.object,
};

export default ProgramAdminChat;
