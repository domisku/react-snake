import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";

const gameSize = 400;
const helperArr = Array.from(Array(gameSize).keys());
let score = 0;
const snake = [0, 1, 2];
let food = Math.floor(Math.random() * (gameSize - 1 - 3 + 1) + 3);
const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function App() {
  const [, setPositionChanged] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const timer = useRef<NodeJS.Timer | null>(null);

  const generateFood = useCallback(() => {
    food = Math.floor(Math.random() * (gameSize - 1));
    if (snake.includes(food)) generateFood();
  }, []);

  function snakeAteFood() {
    if (snake[snake.length - 1] === food) return true;
    else return false;
  }

  function addTail() {
    snake.unshift(snake[0] - 1);
  }

  function isGameOver(direction: number) {
    console.log(snake);
    if (snake.slice(0, snake.length - 1).includes(snake[snake.length - 1]))
      setGameOver(true);
    else if (
      direction === -20 &&
      Array.from(Array(20).keys()).includes(snake[snake.length - 1])
    )
      setGameOver(true);
    else if (
      direction === 20 &&
      Array.from(Array(20).keys())
        .map((num) => 380 + num)
        .includes(snake[snake.length - 1])
    )
      setGameOver(true);
    else if (
      direction === 1 &&
      Array.from(Array(20).keys())
        .map((num) => parseInt(num * 2 + "9") + 10)
        .includes(snake[snake.length - 1])
    )
      setGameOver(true);
    else if (
      direction === -1 &&
      Array.from(Array(20).keys())
        .map((num) => parseInt(num * 2 + "0"))
        .includes(snake[snake.length - 1])
    )
      setGameOver(true);
  }

  function isDirectionOpposite(key: string) {
    let snakeHead = snake[snake.length - 1];
    let snakeNeck = snake[snake.length - 2];

    if (key === "ArrowLeft" && snakeNeck + 1 === snakeHead) return true;
    else if (key === "ArrowRight" && snakeNeck - 1 === snakeHead) return true;
    else if (key === "ArrowUp" && snakeNeck + 20 === snakeHead) return true;
    else if (key === "ArrowDown" && snakeNeck - 20 === snakeHead) return true;
    else return false;
  }

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (validKeys.includes(e.key) && hasGameStarted) {
        if (isDirectionOpposite(e.key)) return;
        if (timer.current) clearInterval(timer.current);

        let operation: number | undefined;

        const callback = (operation: number) => {
          if (snakeAteFood()) {
            addTail();
            generateFood();
            score++;
          }
          isGameOver(operation);
          snake.push(snake[snake.length - 1] + operation);
          snake.shift();
          setPositionChanged((prev) => !prev);
        };

        switch (e.key) {
          case "ArrowUp":
            operation = -20;
            break;
          case "ArrowDown":
            operation = 20;
            break;
          case "ArrowLeft":
            operation = -1;
            break;
          case "ArrowRight":
            operation = 1;
        }

        if (operation) {
          callback(operation);
          timer.current = setInterval(
            () => (operation ? callback(operation) : null),
            120
          );
        }
      }
    });
  }, [generateFood, hasGameStarted]);

  function startGameHandler() {
    setHasGameStarted(true);

    const callback = () => {
      if (snakeAteFood()) {
        addTail();
        generateFood();
        score++;
      }
      isGameOver(1);
      snake.push(snake[snake.length - 1] + 1);
      snake.shift();
      setPositionChanged((prev) => !prev);
    };

    timer.current = setInterval(() => callback(), 120);
  }

  if (gameOver) {
    const resetSnake = () => {
      if (timer.current) clearInterval(timer.current);
      snake.length = 0;
      snake.push(0, 1, 2);
      food = Math.floor(Math.random() * (gameSize - 1 - 3 + 1) + 3);
    };
    resetSnake();

    return (
      <div id="game-over-modal">
        <p>Game Over!</p>
        <p>Your score: {score}</p>
        <button
          onClick={() => {
            setGameOver(false);
            score = 0;
            startGameHandler();
          }}
        >
          Play Again?
        </button>
      </div>
    );
  } else {
    return (
      <div id="gameboard">
        <div id="score">Score: {score}</div>
        {helperArr.map((_, index) => (
          <div
            key={index}
            className={`gamesquare ${snake.includes(index) ? "snake" : ""} ${
              food === index ? "food" : ""
            }`}
          ></div>
        ))}
        {!hasGameStarted && (
          <button id="btn-start-game" onClick={startGameHandler}>
            Start game
          </button>
        )}
      </div>
    );
  }
}

export default App;
