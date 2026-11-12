
import { useState } from "react";
import CityScene from "./game/CityScene";
import "./index.css";

export default function App() {
  const [movement, setMovement] = useState({ x: 0, z: 0 });
  const [paused, setPaused] = useState(false);

  const controls = [
    { label: "▲", x: 0, z: -1, className: "up" },
    { label: "◀", x: -1, z: 0, className: "left" },
    { label: "▼", x: 0, z: 1, className: "down" },
    { label: "▶", x: 1, z: 0, className: "right" },
  ];

  const startMovement = (x, z) => {
    setMovement({ x, z });
  };

  const stopMovement = () => {
    setMovement({ x: 0, z: 0 });
  };

  return (
    <main className="game-container">
      <div className="city-canvas">
        {!paused && <CityScene movement={movement} />}

        {paused && (
          <div className="pause-screen">
            <h1>FACES OF MADRAS</h1>
            <p>Your city. Your people. Your stories.</p>
            <button onClick={() => setPaused(false)}>
              RESUME EXPLORING
            </button>
          </div>
        )}
      </div>

      {/* Top navigation */}
      <header className="game-header">
        <div className="location-card">
          <span>CHENNAI</span>
          <strong>MYLAPORE</strong>
          <small>HERITAGE DISTRICT</small>
        </div>

        <button
          className="find-button"
          onClick={() => alert("Find Someone – Coming in Sprint 6")}
        >
          <span>⌕</span> FIND SOMEONE
        </button>

        <button
          className="pause-button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      </header>

      {/* Branding */}
      <div className="brand-mark">
        <span>EXPLORE</span>
        <strong>FACES OF MADRAS</strong>
      </div>

      {/* Movement controls */}
      {!paused && (
        <div className="movement-controls">
          {controls.map((control) => (
            <button
              key={control.className}
              className={`direction-button ${control.className}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                startMovement(control.x, control.z);
              }}
              onPointerUp={stopMovement}
              onPointerCancel={stopMovement}
              onLostPointerCapture={stopMovement}
              aria-label={`Move ${control.className}`}
            >
              {control.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom action bar */}
      <footer className="game-footer">
        <button
          className="visible-button"
          onClick={() => alert("Profile visibility – Coming soon")}
        >
          BECOME VISIBLE
        </button>

        <button
          className="signin-button"
          onClick={() => alert("Sign in – Coming soon")}
        >
          SIGN IN
        </button>
      </footer>

      <div className="desktop-help">
        MOVE: W A S D / ARROW KEYS | RUN: SHIFT
      </div>
    </main>
  );
}