import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function BoardNav({ board, onDelete }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/play/${board.id}`);
        }}
      >
        Play
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/makeboard?edit=${board.id}`);
        }}
      >
        Edit
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onDelete?.(board.id);
        }}
      >
        Delete
      </a>
    </div>
  );
}

BoardNav.propTypes = {
  board: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
};
