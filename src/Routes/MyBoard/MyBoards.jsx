import React from "react";
import { useLocalBoards } from "../../services/localStorage";
import BoardNav from "../../Components/BoardNav";

export default function MyBoards() {
  const { boards, remove, clear } = useLocalBoards();

  return (
    <div style={{ padding: 16 }}>
      <h2>My Boards</h2>

      {boards.length === 0 ? (
        <p>No saved boards yet. Create one in Make Board.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {boards.map((b) => (
            <li
              key={b.id}
              style={{ marginBottom: 12, border: "1px solid #ddd", padding: 8 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{b.title || "Untitled"}</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>id: {b.id}</div>
                </div>
                <div>
                  <BoardNav board={b} onDelete={remove} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={clear}>Clear all saved boards</button>
      </div>
    </div>
  );
}
