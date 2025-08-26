import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export default function CurriculumRouter() {
  const { curriculumId } = useParams();
  const [curriculum, setCurriculum] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [newSemester, setNewSemester] = useState({
    yearLevel: "",
    semesterNumber: "",
    description: "",
  });
  const [subjects, setSubjects] = useState({});
  const [newSubject, setNewSubject] = useState({});
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // Fetch curriculum details
  useEffect(() => {
    axios.get(`${API_BASE}/curriculums/${curriculumId}`)
      .then(res => setCurriculum(res.data))
      .catch(() => setCurriculum(null));
  }, [curriculumId]);

  // Fetch semesters for this curriculum
  useEffect(() => {
    axios.get(`${API_BASE}/semesters?curriculumId=${curriculumId}`)
      .then(res => setSemesters(res.data))
      .catch(() => setSemesters([]));
  }, [curriculumId]);

  // Fetch subjects for a semester
  const fetchSubjects = (semesterId) => {
    axios.get(`${API_BASE}/subjects?semesterId=${semesterId}`)
      .then(res => setSubjects(prev => ({ ...prev, [semesterId]: res.data })))
      .catch(() => setSubjects(prev => ({ ...prev, [semesterId]: [] })));
  };

  // Add semester
  const handleAddSemester = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/semesters`, {
      ...newSemester,
      curriculum: { id: Number(curriculumId) }
    }).then(res => {
      setSemesters([...semesters, res.data]);
      setNewSemester({ yearLevel: "", semesterNumber: "", description: "" });
    }).catch(() => alert("Error adding semester"));
  };

  // Add subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/subjects`, {
      ...newSubject,
      semester: { id: selectedSemesterId }
    }).then(res => {
      setSubjects(prev => ({
        ...prev,
        [selectedSemesterId]: [...(prev[selectedSemesterId] || []), res.data]
      }));
      setNewSubject({});
    }).catch(() => alert("Error adding subject"));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>
        Manage Curriculum {curriculum ? curriculum.programName : ""}
      </h2>
      <h3>Semesters</h3>
      <form onSubmit={handleAddSemester} style={{ marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Year Level"
          value={newSemester.yearLevel}
          onChange={e => setNewSemester({ ...newSemester, yearLevel: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Semester Number"
          value={newSemester.semesterNumber}
          onChange={e => setNewSemester({ ...newSemester, semesterNumber: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newSemester.description}
          onChange={e => setNewSemester({ ...newSemester, description: e.target.value })}
        />
        <button type="submit">Add Semester</button>
      </form>
      <ul>
        {semesters.map(s => (
          <li key={s.id}>
            <div>
              <strong>Year {s.yearLevel}, Sem {s.semesterNumber}</strong> - {s.description}
              <button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setSelectedSemesterId(s.id);
                  fetchSubjects(s.id);
                }}
              >
                View Subjects
              </button>
            </div>
            {selectedSemesterId === s.id && (
              <div style={{ marginTop: 8, marginBottom: 16 }}>
                <h4>Subjects</h4>
                <form onSubmit={handleAddSubject} style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Subject Code"
                    value={newSubject.subjectCode || ""}
                    onChange={e => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Descriptive Title"
                    value={newSubject.descriptiveTitle || ""}
                    onChange={e => setNewSubject({ ...newSubject, descriptiveTitle: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Lec Hours"
                    value={newSubject.lecHours || ""}
                    onChange={e => setNewSubject({ ...newSubject, lecHours: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Lab Hours"
                    value={newSubject.labHours || ""}
                    onChange={e => setNewSubject({ ...newSubject, labHours: e.target.value })}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Units"
                    value={newSubject.units || ""}
                    onChange={e => setNewSubject({ ...newSubject, units: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newSubject.description || ""}
                    onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Prerequisites"
                    value={newSubject.prerequisites || ""}
                    onChange={e => setNewSubject({ ...newSubject, prerequisites: e.target.value })}
                  />
                  <button type="submit">Add Subject</button>
                </form>
                <ul>
                  {(subjects[s.id] || []).map(sub => (
                    <li key={sub.id}>
                      <strong>{sub.subjectCode}</strong>: {sub.descriptiveTitle} ({sub.units} units)
                      <br />
                      Lec: {sub.lecHours}, Lab: {sub.labHours}
                      <br />
                      {sub.description}
                      <br />
                      Prerequisites: {sub.prerequisites}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
