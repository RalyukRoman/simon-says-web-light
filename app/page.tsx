"use client";

import { useState, useEffect } from "react";
import Modal from "./modal";

const colors = ["red", "khaki", "green", "blue", "gray"];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function GamePage() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentBulb, setCurrentBulb] = useState<number>(-1);
  const [userBulb, setUserBulb] = useState<number>(-1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [repeating, setRepeating] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(0);

  const [levelStats, setLevelStats] = useState<{
    burning: number;
    count: number;
  }>({ burning: 3.0, count: 1 });

  const [hintStats, setHintStats] = useState<{ show: boolean; count: number }>({
    show: false,
    count: 3,
  });

  const restartGame = () => {
    setSequence([]);
    setUserBulb(-1);
    setLevelStats({ burning: 3.0, count: 1 });
    setHintStats({ show: false, count: 3 });
    setRepeating(true);
    setScore(0);
    setTime(0);
    setGameOver(false);
  };

  const createSequence = (stats: { burning: number; count: number }) => {
    setRepeating(true);
    const newSequence = [];

    for (let i = 0; i < stats.count; i++) {
      const rand = Math.floor(Math.random() * colors.length);
      newSequence.push(rand);
    }

    setSequence(newSequence);
    repeatSequence(newSequence, stats);
  };

  const repeatSequence = async (
    selSequence: number[],
    stats: { burning: number; count: number }
  ) => {
    for (let i = 0; i < stats.count; i++) {
      await delay(1000);
      setCurrentBulb(selSequence[i]);
      await delay(1000 * stats.burning);
      setCurrentBulb(-1);
    }

    setRepeating(false);
  };

  const checkBulb = (bulbId: number) => {
    if (repeating || gameOver) return;

    setUserBulb(bulbId);

    if (sequence[0] === bulbId) {
      if (sequence.length === 1) nextSequence();
      else setSequence(sequence.slice(1));
    } else {
      setGameOver(true);
    }

    if (hintStats.show)
      setHintStats((prev) => {
        const newValue = { show: false, count: prev.count };
        return newValue;
      });
  };

  const nextSequence = () => {
    setScore((prev) => prev + 1);

    setLevelStats((prev) => {
      const next = {
        burning: prev.burning * 0.9,
        count: prev.count + 1,
      };

      createSequence(next);
      return next;
    });
  };

  useEffect(() => {
    if (gameOver) return;

    const id = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    createSequence(levelStats);
    return () => clearInterval(id);
  }, [gameOver]);

  useEffect(() => {
    if (userBulb === -1) return;
    const id = setTimeout(() => setUserBulb(-1), 1000);
    return () => clearTimeout(id);
  }, [userBulb]);

  return (
    <div className="game--container">
      <div className="game--stats">
        <p>Score: {score}</p>
        <p>
          Time: {String(Math.floor(time / 60)).padStart(2, "0")}:
          {String(time % 60).padStart(2, "0")}
        </p>
      </div>

      <button
        className="game--button__hint"
        onClick={() => {
          if (hintStats.count > 0)
            setHintStats((prev) => {
              let newValue = { show: true, count: prev.count - 1 };
              return newValue;
            });
        }}
        disabled={hintStats.show || repeating || gameOver}
      >
        <b>{hintStats.count}</b> ❔ Hint
      </button>

      <div className="game--row">
        {colors.map((item, id) => (
          <div
            key={id}
            className="game--bulb"
            style={{
              backgroundColor: item,
              opacity: currentBulb === id ? 1 : 0.3,
            }}
          ></div>
        ))}
      </div>

      <h3>{gameOver ? "Game Over" : repeating ? "Wait" : "Play"}</h3>
      <div className="game--row" style={{ marginBottom: "20px" }}>
        {colors.map((item, id) => (
          <button
            key={id}
            className="game--button"
            style={{
              backgroundColor: item,
              opacity: userBulb === id ? 1 : 0.3,
            }}
            onClick={() => checkBulb(id)}
            disabled={repeating || gameOver}
          ></button>
        ))}
      </div>

      <div className="game--row">
        {colors.map((item, id) => (
          <p
            key={id}
            className="game--hint"
            style={{
              color: item,
              opacity: hintStats.show && sequence[0] === id ? 1 : 0,
            }}
          >
            ▲
          </p>
        ))}
      </div>

      {gameOver && (
        <Modal>
          <h3 className="modal--label">Game Over</h3>
          <p>Score: {score}</p>
          <p>
            Time: {String(Math.floor(time / 60)).padStart(2, "0")}:
            {String(time % 60).padStart(2, "0")}
          </p>
          <div className="modal--list">
            <button className="modal--button" onClick={restartGame}>
              Restart
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
