import { useState, useEffect } from "react";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [newTask, setNewTask] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Čuva darkMode u localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Čuva taskove u localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // **KLJUČNO: menja klasu na body i html za dark mode**
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === "") return;
    setTasks([...tasks, { text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (idx) => {
    const newTasks = tasks.map((task, i) =>
      i === idx ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
  };

  const deleteTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTasks(items);
  };

  return (
    <div className={`main-container${darkMode ? " dark" : ""}`}>
      <div className="todo-box">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="toggle-mode"
        >
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
        <h1>To-Do Lista</h1>
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Unesi novi zadatak..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit">Dodaj</button>
        </form>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks-droppable">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.length === 0 ? (
                  <li className="empty-list-text">Nema zadataka još uvek.</li>
                ) : (
                  tasks.map((task, idx) => (
                    <Draggable key={idx} draggableId={String(idx)} index={idx}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={
                            `${editIdx === idx ? "editing" : ""} ` +
                            `${snapshot.isDragging ? "dragging" : ""}`
                          }
                        >
                          {editIdx === idx ? (
                            <input
                              type="text"
                              className="edit-input"
                              value={editText}
                              autoFocus
                              onChange={(e) => setEditText(e.target.value)}
                              onBlur={() => setEditIdx(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const updated = [...tasks];
                                  updated[idx].text =
                                    editText.trim() || task.text;
                                  setTasks(updated);
                                  setEditIdx(null);
                                } else if (e.key === "Escape") {
                                  setEditIdx(null);
                                }
                              }}
                            />
                          ) : (
                            <>
                              <span
                                className={`task-text${
                                  task.completed ? " completed" : ""
                                }`}
                                onClick={() => toggleTask(idx)}
                                onDoubleClick={() => {
                                  setEditIdx(idx);
                                  setEditText(task.text);
                                }}
                              >
                                {task.text}
                              </span>
                              <button
                                className="edit-btn"
                                onClick={() => {
                                  setEditIdx(idx);
                                  setEditText(task.text);
                                }}
                                title="Izmeni"
                              >
                                ✏️
                              </button>
                            </>
                          )}
                          <button
                            className="delete-btn"
                            onClick={() => deleteTask(idx)}
                          >
                            Obriši
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
