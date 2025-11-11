import React from "react";
import { useParams } from "react-router-dom";
import Board from "../Components/Board/Board";
import Scoreboard from "../Components/Scoreboard/Scoreboard";

export default function PlayBoard() {
  const { id } = useParams();
  return (
    <div style={{ padding: 16 }}>
      <h2>Play Board</h2>
      <Scoreboard />
      <Board mode="play" boardId={id} />
    </div>
  );
}
