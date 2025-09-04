import React, { useState, useEffect } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/todos")
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = () => {
    if (!task) return;
    fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    })
      .then(res => res.json())
      .then(newTodo => {
        setTodos([...todos, newTodo]);
        setTask("");
      });
  };

  const deleteTodo = (id) => {
    fetch(`http://localhost:5000/todos/${id}`, { method: "DELETE" })
      .then(() => setTodos(todos.filter(t => t.id !== id)));
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
      <h1>📌 To-Do App</h1>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTodo}>Add</button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ margin: "8px 0" }}>
            {t.task}
            <button
              onClick={() => deleteTodo(t.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
