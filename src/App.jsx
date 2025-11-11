import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./Routes/Landing/Landing";
import MakeBoard from "./Routes/MakeBoard/MakeBoard";
import MyBoards from "./Routes/MyBoard/MyBoards";
import PlayBoard from "./Routes/PlayBoard";
import Footer from "./Components/Footer.jsx";

function App() {
  return (
    <BrowserRouter>
      <div id="root">
        <div className="app-shell">
          <header className="app-header">
            <div className="app-brand">
              <div className="logo" />
              <div>
                <div className="app-title">Jeopardy Generator</div>
                <div className="app-sub">Create and play local boards</div>
              </div>
            </div>

            <nav className="app-nav">
              <Link to="/" className="nav-link">
                Landing
              </Link>
              <Link to="/makeboard" className="nav-link">
                Make Board
              </Link>
              <Link to="/myboards" className="nav-link">
                My Boards
              </Link>
            </nav>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/makeboard" element={<MakeBoard />} />
              <Route path="/play/:id" element={<PlayBoard />} />
              <Route path="/myboards" element={<MyBoards />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
