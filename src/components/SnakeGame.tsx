import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 24;
const CELL_SIZE = 26;
const INITIAL_SPEED = 150;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE; // 624px

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type FoodType = {
  name: string;
  emoji: string;
  points: number;
  color: string;
  glow: string;
  bg: string;
};

const FOOD_TYPES: FoodType[] = [
  { name: "Apple",   emoji: "🍎", points: 10, color: "#ef4444", glow: "rgba(239,68,68,0.6)",   bg: "bg-red-500"    },
  { name: "Star",    emoji: "⭐", points: 25, color: "#facc15", glow: "rgba(250,204,21,0.6)",   bg: "bg-yellow-400" },
  { name: "Diamond", emoji: "💎", points: 50, color: "#a855f7", glow: "rgba(168,85,247,0.7)",   bg: "bg-purple-500" },
];

type Food = { position: Position; type: FoodType };

function getRandomPosition(): Position {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function getRandomFoodType(): FoodType {
  const roll = Math.random();
  if (roll < 0.1) return FOOD_TYPES[2];
  if (roll < 0.3) return FOOD_TYPES[1];
  return FOOD_TYPES[0];
}

function spawnFood(snake: Position[]): Food {
  let position: Position;
  do {
    position = getRandomPosition();
  } while (snake.some((s) => s.x === position.x && s.y === position.y));
  return { position, type: getRandomFoodType() };
}

function getSpeed(score: number): number {
  const level = Math.floor(score / 50);
  return Math.max(60, INITIAL_SPEED - level * 10);
}

function getLevel(score: number): number {
  return Math.floor(score / 50) + 1;
}

function SnakeGame() {
  const initialSnake: Position[] = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 },
  ];

  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Food>({ position: { x: 18, y: 12 }, type: FOOD_TYPES[0] });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wallWrap, setWallWrap] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("snakeHighScore") || "0", 10);
  });
  const [pulse, setPulse] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;
  const wallWrapRef = useRef(wallWrap);
  wallWrapRef.current = wallWrap;
  const foodRef = useRef(food);
  foodRef.current = food;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const resetGame = useCallback(() => {
    const startSnake: Position[] = [
      { x: 12, y: 12 },
      { x: 11, y: 12 },
      { x: 10, y: 12 },
    ];
    setSnake(startSnake);
    setFood(spawnFood(startSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setGameOver(false);
    setScore(0);
    setIsRunning(true);
  }, []);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case "UP":    head.y -= 1; break;
        case "DOWN":  head.y += 1; break;
        case "LEFT":  head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (wallWrapRef.current) {
          head.x = ((head.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
          head.y = ((head.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
        } else {
          setGameOver(true);
          setIsRunning(false);
          const finalScore = scoreRef.current;
          setHighScore((prev) => {
            const next = Math.max(prev, finalScore);
            localStorage.setItem("snakeHighScore", String(next));
            return next;
          });
          return prevSnake;
        }
      }

      if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true);
        setIsRunning(false);
        const finalScore = scoreRef.current;
        setHighScore((prev) => {
          const next = Math.max(prev, finalScore);
          localStorage.setItem("snakeHighScore", String(next));
          return next;
        });
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === foodRef.current.position.x && head.y === foodRef.current.position.y) {
        const pts = foodRef.current.type.points;
        setScore((s) => s + pts);
        setPulse(true);
        setTimeout(() => setPulse(false), 300);
        setFood(spawnFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const speed = getSpeed(score);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isRunning, moveSnake, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          e.preventDefault();
          if (!isRunning && !gameOver) resetGame();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, gameOver, resetGame]);

  const handleDpad = (dir: Direction) => {
    const opposites: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (directionRef.current !== opposites[dir]) setDirection(dir);
  };

  const level = getLevel(score);
  const speed = getSpeed(score);
  const speedPct = Math.round(((INITIAL_SPEED - speed) / (INITIAL_SPEED - 60)) * 100);

  // Snake head direction indicator (offset for "eyes")
  const headDir = directionRef.current;
  const eyeOffsets: Record<Direction, [number, number, number, number][]> = {
    RIGHT: [[16, 5], [16, 15]],
    LEFT:  [[4, 5],  [4, 15]],
    UP:    [[5, 4],  [15, 4]],
    DOWN:  [[5, 16], [15, 16]],
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl mx-auto px-4">
      {/* Stats panel */}
      <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-44 shrink-0">
        {/* Score */}
        <div className={`flex-1 lg:flex-none rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-all duration-150 ${pulse ? "ring-2 ring-green-400/60 scale-105" : ""}`}>
          <p className="text-xs font-semibold tracking-widest text-green-400/70 uppercase mb-1">Score</p>
          <p className="text-3xl font-black text-white tabular-nums">{score}</p>
        </div>

        {/* High Score */}
        <div className="flex-1 lg:flex-none rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold tracking-widest text-yellow-400/70 uppercase mb-1">Best</p>
          <p className="text-3xl font-black text-yellow-300 tabular-nums">{highScore}</p>
        </div>

        {/* Level */}
        <div className="flex-1 lg:flex-none rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold tracking-widest text-purple-400/70 uppercase mb-1">Level</p>
          <p className="text-3xl font-black text-purple-300 tabular-nums">{level}</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${Math.min(speedPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Snake length */}
        <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold tracking-widest text-cyan-400/70 uppercase mb-1">Length</p>
          <p className="text-3xl font-black text-cyan-300 tabular-nums">{snake.length}</p>
        </div>
      </div>

      {/* Game area */}
      <div className="flex flex-col items-center gap-5">
        {/* Board */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            background: "linear-gradient(135deg, #0a0a1a 0%, #0d1117 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(74,222,128,0.08), inset 0 0 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Grid lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            style={{ opacity: 0.04 }}
          >
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <g key={i}>
                <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={BOARD_SIZE} stroke="#fff" strokeWidth="1" />
                <line x1={0} y1={i * CELL_SIZE} x2={BOARD_SIZE} y2={i * CELL_SIZE} stroke="#fff" strokeWidth="1" />
              </g>
            ))}
          </svg>

          {/* Snake body */}
          {snake.slice(1).map((segment, i) => {
            const ratio = 1 - (i + 1) / snake.length;
            const greenVal = Math.round(160 + ratio * 80);
            return (
              <div
                key={i + 1}
                className="absolute rounded-sm"
                style={{
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 3,
                  height: CELL_SIZE - 3,
                  background: `rgb(34, ${greenVal}, 80)`,
                  boxShadow: i < 4 ? `0 0 6px rgba(34,197,94,${0.3 * ratio})` : undefined,
                }}
              />
            );
          })}

          {/* Snake head */}
          {snake.length > 0 && (() => {
            const head = snake[0];
            const eyes = eyeOffsets[headDir];
            return (
              <div
                className="absolute rounded-md"
                style={{
                  left: head.x * CELL_SIZE + 1,
                  top: head.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 3,
                  height: CELL_SIZE - 3,
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  boxShadow: "0 0 12px rgba(74,222,128,0.8), 0 0 4px rgba(74,222,128,1)",
                  position: "absolute",
                }}
              >
                {/* Eyes */}
                {eyes.map(([ex, ey], idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-full bg-gray-900"
                    style={{ left: ex - 3, top: ey - 3, width: 5, height: 5 }}
                  />
                ))}
              </div>
            );
          })()}

          {/* Food */}
          <div
            className="absolute flex items-center justify-center text-sm select-none"
            style={{
              left: food.position.x * CELL_SIZE,
              top: food.position.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              filter: `drop-shadow(0 0 8px ${food.type.glow})`,
              animation: "foodPulse 1.4s ease-in-out infinite",
            }}
          >
            {food.type.emoji}
          </div>

          {/* Game Over overlay */}
          {gameOver && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}
            >
              <div className="text-center">
                <p className="text-5xl mb-2">💀</p>
                <p className="text-red-400 text-3xl font-black tracking-tight mb-1">Game Over</p>
                <p className="text-white/60 text-sm mb-4">
                  {score >= highScore && score > 0 ? "🏆 New High Score!" : `Score: ${score}`}
                </p>
              </div>
              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  boxShadow: "0 4px 24px rgba(22,163,74,0.4)",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.boxShadow = "0 4px 32px rgba(22,163,74,0.7)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.boxShadow = "0 4px 24px rgba(22,163,74,0.4)"; }}
              >
                Play Again
              </button>
            </div>
          )}

          {/* Start screen */}
          {!isRunning && !gameOver && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            >
              <p className="text-5xl">🐍</p>
              <p className="text-green-400 text-2xl font-bold tracking-tight">Ready to play?</p>
              <p className="text-white/40 text-sm">Arrow keys or WASD to move</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide text-white mt-2 transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  boxShadow: "0 4px 24px rgba(22,163,74,0.4)",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.boxShadow = "0 4px 32px rgba(22,163,74,0.7)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.boxShadow = "0 4px 24px rgba(22,163,74,0.4)"; }}
              >
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between w-full px-1">
          {/* Wall wrap toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div
              onClick={() => setWallWrap((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${wallWrap ? "bg-green-500" : "bg-white/10"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${wallWrap ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">Wall wrap</span>
          </label>

          {/* Keyboard hint */}
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">↑↓←→</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">WASD</kbd>
          </div>
        </div>

        {/* D-pad for mobile */}
        <div className="flex flex-col items-center gap-1 lg:hidden">
          <button
            onTouchStart={() => handleDpad("UP")} onMouseDown={() => handleDpad("UP")}
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
          >▲</button>
          <div className="flex gap-1">
            <button
              onTouchStart={() => handleDpad("LEFT")} onMouseDown={() => handleDpad("LEFT")}
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
            >◀</button>
            <div className="w-12 h-12 rounded-xl bg-white/5" />
            <button
              onTouchStart={() => handleDpad("RIGHT")} onMouseDown={() => handleDpad("RIGHT")}
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
            >▶</button>
          </div>
          <button
            onTouchStart={() => handleDpad("DOWN")} onMouseDown={() => handleDpad("DOWN")}
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
          >▼</button>
        </div>

        {/* Food legend */}
        <div className="flex gap-5 text-xs text-white/40">
          {FOOD_TYPES.map((ft) => (
            <div key={ft.name} className="flex items-center gap-1.5">
              <span className="text-sm">{ft.emoji}</span>
              <span>{ft.name}</span>
              <span className="font-bold text-white/60">{ft.points}pt</span>
            </div>
          ))}
        </div>
      </div>

      {/* Food pulse animation */}
      <style>{`
        @keyframes foodPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default SnakeGame;
