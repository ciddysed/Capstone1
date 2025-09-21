import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export default function CurriculumRouter() {
  const { curriculumId } = useParams();
  const [curriculum, setCurriculum] = useState(null);
  const [newSemester, setNewSemester] = useState({
    yearLevel: "",
    semesterNumber: "",
    description: "",
  });
  const [newSubject, setNewSubject] = useState({});
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // Fetch curriculum details (with semesters and subjects organized correctly)
  useEffect(() => {
    axios.get(`${API_BASE}/curriculums/${curriculumId}`)
      .then(res => setCurriculum(res.data))
      .catch(() => setCurriculum(null));
  }, [curriculumId]);

  // Add semester
  const handleAddSemester = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/semesters`, {
      ...newSemester,
      curriculum: { id: Number(curriculumId) }
    }).then(res => {
      setCurriculum(prev => ({
        ...prev,
        semesters: [...(prev.semesters || []), { ...res.data, subjects: [] }]
      }));
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
      setCurriculum(prev => ({
        ...prev,
        semesters: prev.semesters.map(sem =>
          sem.id === selectedSemesterId
            ? { ...sem, subjects: [...(sem.subjects || []), res.data] }
            : sem
        )
      }));
      setNewSubject({});
    }).catch(() => alert("Error adding subject"));
  };

  return (
    <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <h2 style={{ marginBottom: 24, color: '#1976d2', fontWeight: 700 }}>
        Manage Curriculum {curriculum ? `- ${curriculum.programName}` : ''}
      </h2>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e0e0', padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16, color: '#333' }}>Add New Semester</h3>
        <form onSubmit={handleAddSemester} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 0 }}>
          <input
            type="number"
            placeholder="Year Level"
            value={newSemester.yearLevel}
            onChange={e => setNewSemester({ ...newSemester, yearLevel: e.target.value })}
            required
            style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Semester Number"
            value={newSemester.semesterNumber}
            onChange={e => setNewSemester({ ...newSemester, semesterNumber: e.target.value })}
            required
            style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newSemester.description}
            onChange={e => setNewSemester({ ...newSemester, description: e.target.value })}
            style={{ flex: 2, minWidth: 200, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>
            Add Semester
          </button>
        </form>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e0e0', padding: 24 }}>
        <h3 style={{ marginBottom: 16, color: '#333' }}>Semesters</h3>
        {(!curriculum || !curriculum.semesters || curriculum.semesters.length === 0) && (
          <div style={{ color: '#888', padding: 24, textAlign: 'center' }}>No semesters found.</div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Year Level</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Semester</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1976d2' }}>Description</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>
          <tbody>
            {curriculum && curriculum.semesters && curriculum.semesters.map(s => (
              <React.Fragment key={s.id}>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 10 }}>{s.yearLevel}</td>
                  <td style={{ padding: 10 }}>{s.semesterNumber}</td>
                  <td style={{ padding: 10 }}>{s.description}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      style={{
                        background: selectedSemesterId === s.id ? '#388e3c' : '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                      onClick={() => setSelectedSemesterId(selectedSemesterId === s.id ? null : s.id)}
                    >
                      {selectedSemesterId === s.id ? 'Hide Subjects' : 'View Subjects'}
                    </button>
                  </td>
                </tr>
                {selectedSemesterId === s.id && (
                  <tr>
                    <td colSpan={4} style={{ background: '#f9f9f9', padding: 16 }}>
                      <div style={{ marginBottom: 12 }}>
                        <h4 style={{ margin: 0, color: '#1976d2' }}>Subjects</h4>
                        <form onSubmit={handleAddSubject} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', margin: '12px 0' }}>
                          <input
                            type="text"
                            placeholder="Subject Code"
                            value={newSubject.subjectCode || ""}
                            onChange={e => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                            required
                            style={{ flex: 1, minWidth: 100, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="text"
                            placeholder="Descriptive Title"
                            value={newSubject.descriptiveTitle || ""}
                            onChange={e => setNewSubject({ ...newSubject, descriptiveTitle: e.target.value })}
                            required
                            style={{ flex: 2, minWidth: 160, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="number"
                            placeholder="Lec Hours"
                            value={newSubject.lecHours || ""}
                            onChange={e => setNewSubject({ ...newSubject, lecHours: e.target.value })}
                            style={{ flex: 1, minWidth: 80, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="number"
                            placeholder="Lab Hours"
                            value={newSubject.labHours || ""}
                            onChange={e => setNewSubject({ ...newSubject, labHours: e.target.value })}
                            style={{ flex: 1, minWidth: 80, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Units"
                            value={newSubject.units || ""}
                            onChange={e => setNewSubject({ ...newSubject, units: e.target.value })}
                            style={{ flex: 1, minWidth: 80, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={newSubject.description || ""}
                            onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                            style={{ flex: 2, minWidth: 140, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <input
                            type="text"
                            placeholder="Prerequisites"
                            value={newSubject.prerequisites || ""}
                            onChange={e => setNewSubject({ ...newSubject, prerequisites: e.target.value })}
                            style={{ flex: 2, minWidth: 120, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                          />
                          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>
                            Add Subject
                          </button>
                        </form>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Code</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Title</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Lec</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Lab</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Units</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Description</th>
                            <th style={{ padding: 8, textAlign: 'left', color: '#1976d2' }}>Prerequisites</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.subjects || []).length === 0 && (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No subjects found.</td>
                            </tr>
                          )}
                          {(s.subjects || []).map(sub => (
                            <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: 8 }}>{sub.subjectCode}</td>
                              <td style={{ padding: 8 }}>{sub.descriptiveTitle}</td>
                              <td style={{ padding: 8 }}>{sub.lecHours}</td>
                              <td style={{ padding: 8 }}>{sub.labHours}</td>
                              <td style={{ padding: 8 }}>{sub.units}</td>
                              <td style={{ padding: 8 }}>{sub.description}</td>
                              <td style={{ padding: 8 }}>{sub.prerequisites}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
                    