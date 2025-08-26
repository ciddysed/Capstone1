import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

export default function CurriculumManagement() {
  const [curriculums, setCurriculums] = useState([]);
  const [newCurriculum, setNewCurriculum] = useState({
    programName: "",
    yearStarted: "",
    description: "",
    isActive: true,
  });
  const navigate = useNavigate();

  // Fetch curriculums
  useEffect(() => {
    axios.get(`${API_BASE}/curriculums`)
      .then(res => setCurriculums(res.data))
      .catch(err => console.error(err));
  }, []);

  // Add curriculum
  const handleAddCurriculum = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/curriculums`, newCurriculum)
      .then(res => {
        setCurriculums([...curriculums, res.data]);
        setNewCurriculum({
          programName: "",
          yearStarted: "",
          description: "",
          isActive: true,
        });
      })
      .catch(err => alert("Error adding curriculum"));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Curriculum Management</h2>
      <form onSubmit={handleAddCurriculum} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Program Name"
          value={newCurriculum.programName}
          onChange={e => setNewCurriculum({ ...newCurriculum, programName: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Year Started"
          value={newCurriculum.yearStarted}
          onChange={e => setNewCurriculum({ ...newCurriculum, yearStarted: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newCurriculum.description}
          onChange={e => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
        />
        <label>
          Active:
          <input
            type="checkbox"
            checked={newCurriculum.isActive}
            onChange={e => setNewCurriculum({ ...newCurriculum, isActive: e.target.checked })}
          />
        </label>
        <button type="submit">Add Curriculum</button>
      </form>
      <div>
        <h3>Curriculums</h3>
        <ul>
          {curriculums.map(c => (
            <li key={c.id}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit"
                }}
                onClick={() => navigate(`/admin/curriculum/${c.id}`)}
              >
                <strong>{c.programName}</strong> ({c.yearStarted}) - {c.description} [{c.isActive ? "Active" : "Inactive"}]
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* You can expand here to manage semesters and subjects for each curriculum */}
    </div>
  );
}
