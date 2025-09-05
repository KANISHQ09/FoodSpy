import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const getNotes = async () => {
    const res = await axios.get(API_URL);
    setNotes(res.data);
  };

  useEffect(() => {
    getNotes();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    await axios.post(API_URL, { title, content });
    setTitle("");
    setContent("");
    getNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    getNotes();
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial" }}>
      <h1>Notes App</h1>
      
      <form onSubmit={addNote}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>Add</button>
      </form>

      <ul>
        {notes.map((note) => (
          <li key={note._id} style={{ marginTop: "10px" }}>
            <strong>{note.title}</strong>: {note.content}
            <button
              onClick={() => deleteNote(note._id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
