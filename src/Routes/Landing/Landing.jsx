import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <main>
            <section >
                <h1 >Jeopardy!</h1>
                <p >
                    Classic quiz show vibes — build boards, add categories & questions, and run a game.
                    Boards are stored locally on this machine.
                </p>

                <div className="actions">
                    <button
                        className="button primary"
                        onClick={() => navigate("/makeboard")}
                        aria-label="Make a new board"
                    >
                        Make a Board
                    </button>

                    <button
                        className="button secondary"
                        onClick={() => navigate("/myboards")}
                        aria-label="View saved boards"
                    >
                        My Boards
                    </button>
                </div>

                <p className="small">Tip: you can export/import boards later to move them between machines.</p>
            </section>
        </main>
    );
}