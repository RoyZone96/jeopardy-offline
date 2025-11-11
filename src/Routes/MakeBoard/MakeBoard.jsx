import React, { useState, useEffect } from "react";
import { useLocalBoards, getBoards } from "../../services/localStorage";
import "./MakeBoard.css";
import Board from "../../Components/Board/Board.jsx";
import { useLocation, useNavigate } from "react-router-dom";

export default function MakeBoard() {
  const { add, update } = useLocalBoards();
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [board, setBoard] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    if (editId) {
      // load existing board
      const existing = getBoards().find((b) => b.id === editId);
      if (existing) {
        setEditingId(editId);
        setBoard(existing);
        setTitle(existing.title || "");
      }
    }
  }, [location.search]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a board title");
      return;
    }
    // if editing an existing saved board
    if (editingId && board) {
      // re-read the latest saved board from storage to avoid overwriting concurrent changes
      const latest = getBoards().find((b) => b.id === editingId) || board;
      const updated = { ...latest, ...board, title: title.trim() };
      console.log("MakeBoard.handleSave: updating board (merged latest)", {
        latest,
        board,
        updated,
      });
      update(editingId, updated);
      setBoard(updated);
      alert("Board updated locally");
      navigate("/myboards");
      return;
    }

    // if user has been editing the preview board (unsaved), prefer to persist that
    if (board && !board.id) {
      const toSave = { ...board, title: title.trim(), createdAt: Date.now() };
      add(toSave);
      setBoard(null);
      setTitle("");
      alert("Board saved locally");
      navigate("/myboards");
      return;
    }

    // fallback: no edits were made in preview, create an empty board
    const newBoard = {
      title: title.trim(),
      createdAt: Date.now(),
      categories: [],
    };
    add(newBoard);
    setTitle("");
    alert("Board saved locally");
    navigate("/myboards");
  };

  return (
    <div className="makeboard-root">
      <h2>{editingId ? "Edit Board" : "Make Board"}</h2>

      <div className="makeboard-controls">
        <label className="makeboard-label">
          Title
          <input
            className="makeboard-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="makeboard-actions">
          <button onClick={handleSave} className="makeboard-save">
            {editingId ? "Update Board" : "Save Board (local)"}
          </button>
        </div>
      </div>

      <div className="makeboard-preview">
        <Board
          mode="build"
          board={board || { title, categories: [] }}
          onChange={setBoard}
        />
      </div>
    </div>
  );
}
