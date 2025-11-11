import React from "react";
import "./Scoreboard.css";

export default function Scoreboard() {
  const [players, setPlayers] = React.useState([]);
  const [scores, setScores] = React.useState({});
  // per-player selected amount (100..500)
  const [selectedAmount, setSelectedAmount] = React.useState({});
  // per-player mode: true = add, false = subtract
  const [isAddMode, setIsAddMode] = React.useState({});

  // Placeholder for future scoreboard functionality
  const addPlayer = (name) => {
    setPlayers((p) => [...p, name]);
    setScores((s) => ({ ...s, [name]: 0 }));
    setSelectedAmount((m) => ({ ...m, [name]: 100 }));
    setIsAddMode((m) => ({ ...m, [name]: true }));
  };

  const removePlayer = (name) => {
    setPlayers((p) => p.filter((pl) => pl !== name));
    setScores((s) => {
      const ns = { ...s };
      delete ns[name];
      return ns;
    });
    setSelectedAmount((m) => {
      const nm = { ...m };
      delete nm[name];
      return nm;
    });
    setIsAddMode((m) => {
      const nm = { ...m };
      delete nm[name];
      return nm;
    });
  };

  const updateScore = (name, delta) => {
    setScores((s) => ({ ...s, [name]: (s[name] || 0) + delta }));
  };

  const toggleMode = (name) => {
    setIsAddMode((m) => ({ ...m, [name]: !m[name] }));
  };

  const setAmountFor = (name, amount) => {
    setSelectedAmount((m) => ({ ...m, [name]: amount }));
  };

  const applySelected = (name) => {
    const amt = Number(selectedAmount[name] || 100);
    const add = Boolean(isAddMode[name]);
    updateScore(name, add ? amt : -amt);
  };

  return (
    <div className="scoreboard-root">
      <div className="buttons">
        <button
          onClick={() => {
            if (players.length >= 4) return;
            const name = prompt("Enter player name:");
            if (name) addPlayer(name);
          }}
          disabled={players.length >= 4}
        >
          Add Player
        </button>
        <div className="player-limit-note">
          {players.length >= 4
            ? "Player limit reached (4)"
            : `Players: ${players.length}/4`}
        </div>
      </div>
      <div className="scoreboard">
        {players.map((player) => (
          <div key={player} className="scoreboard-entry player-card">
            <div className="player-header">
              <div className="player-name">
                <strong>{player}</strong>
              </div>
              <div className="player-remove">
                <button
                  className="remove-player"
                  onClick={() => removePlayer(player)}
                  aria-label={`Remove ${player}`}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="player-score">{scores[player] || 0}</div>

            <div className="points-control">
              <label className="points-label">Points</label>
              <select
                value={selectedAmount[player] || 100}
                onChange={(e) => setAmountFor(player, Number(e.target.value))}
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => toggleMode(player)}
                className="toggle-mode"
              >
                {isAddMode[player] ? "+" : "-"}
              </button>
            </div>

            <div>
              <button
                className="apply-button"
                onClick={() => applySelected(player)}
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
