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
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h2 style={{ marginBottom: 24, color: '#1976d2', fontWeight: 700 }}>Curriculum Management</h2>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e0e0', padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16, color: '#333' }}>Add New Curriculum</h3>
        <form onSubmit={handleAddCurriculum} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Program Name"
            value={newCurriculum.programName}
            onChange={e => setNewCurriculum({ ...newCurriculum, programName: e.target.value })}
            required
            style={{ flex: 1, minWidth: 180, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Year Started"
            value={newCurriculum.yearStarted}
            onChange={e => setNewCurriculum({ ...newCurriculum, yearStarted: e.target.value })}
            required
            style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newCurriculum.description}
            onChange={e => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
            style={{ flex: 2, minWidth: 200, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            Active:
            <input
              type="checkbox"
              checked={newCurriculum.isActive}
              onChange={e => setNewCurriculum({ ...newCurriculum, isActive: e.target.checked })}
              style={{ marginLeft: 4 }}
            />
          </label>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>
            Add Curriculum
          </button>
        </form>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e0e0', padding: 24 }}>
        <h3 style={{ marginBottom: 16, color: '#333' }}>Curriculums</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Program Name</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Year Started</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Description</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Status</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>
          <tbody>
            {curriculums.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 24 }}>No curriculums found.</td>
              </tr>
            )}
            {curriculums.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{c.programName}</td>
                <td style={{ padding: 10 }}>{c.yearStarted}</td>
                <td style={{ padding: 10 }}>{c.description}</td>
                <td style={{ padding: 10 }}>
                  <span style={{ color: c.isActive ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    style={{
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                    onClick={() => navigate(`/admin/curriculum/${c.id}`)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
