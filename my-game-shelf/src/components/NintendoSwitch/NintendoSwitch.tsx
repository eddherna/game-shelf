// src/components/NintendoSwitch.tsx
import React from 'react';
import './NintendoSwitch.css';

interface NintendoSwitchProps {
  game: { title: string; image: string } | null;
}

const NintendoSwitch: React.FC<NintendoSwitchProps> = ({ game }) => {
  return (
    <div className="ns-panel">
      <div className="ns-console">

        {/* ── Left Joy-Con 2 ── */}
        <div className="ns-joycon ns-joycon-left">
          {/* Top stick */}
          <div className="ns-stick ns-stick-left"></div>
          {/* D-pad: 4 independent buttons with arrows (clockwise) */}
          <div className="ns-dpad">
            <div className="ns-dpad-btn ns-dpad-up">▲</div>
            <div className="ns-dpad-btn ns-dpad-right">►</div>
            <div className="ns-dpad-btn ns-dpad-down">▼</div>
            <div className="ns-dpad-btn ns-dpad-left">◄</div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ns-body">
          <div className="ns-screen">
            {game ? (
              <div className="ns-screen-idle">
                <div className="ns-idle-logo ns-idle-logo--game">
                  <span className="ns-idle-n ns-idle-title">{game.title}</span>

                </div>
              </div>
            ) : (
              <div className="ns-screen-idle">
                <div className="ns-idle-logo">
                  <span className="ns-idle-n">Nintendo</span>
                  <span className="ns-idle-s">Switch</span>
                  <span className="ns-idle-2">2</span>
                </div>
              </div>
            ) }
          </div>
        </div>

        {/* ── Right Joy-Con 2 ── */}
        <div className="ns-joycon ns-joycon-right">
          {/* ABXY */}
          <div className="ns-abxy">
            <div className="ns-btn-abxy ns-btn-x">X</div>
            <div className="ns-btn-abxy ns-btn-a">A</div>
            <div className="ns-btn-abxy ns-btn-b">B</div>
            <div className="ns-btn-abxy ns-btn-y">Y</div>
          </div>
          {/* Bottom stick */}
          <div className="ns-stick ns-stick-right"></div>
        </div>
      </div>
    </div>
  );
};

export default NintendoSwitch;
