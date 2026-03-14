import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type FoodType = {
  name: string;
  points: number;
  color: string;
  glowColor: string;
};

const FOOD_TYPES: FoodType[] = [
  { name: "Normal", points: 10, color: "bg-red-500", glowColor: "shadow-red-500/50" },
  { name: "Bonus", points: 25, color: "bg-yellow-400", glowColor: "shadow-yellow-400/50" },
  { name: "Super", points: 50, color: "bg-purple-500", glowColor: "shadow-purple-500/50" },
];

type Food = {
  position: Position;
  type: FoodType;
};

function getRandomPosition(): Position {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function getRandomFoodType(): FoodType {
  const roll = Math.random();
  if (roll < 0.1) return FOOD_TYPES[2];  // 10% chance: Super (50 pts)
  if (roll < 0.3) return FOOD_TYPES[1];  // 20% chance: Bonus (25 pts)
  return FOOD_TYPES[0];                   // 70% chance: Normal (10 pts)
}

function spawnFood(): Food {
  return { position: getRandomPosition(), type: getRandomFoodType() };
}

function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Food>({
    position: { x: 15, y: 15 },
    type: FOOD_TYPES[0],
  });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wallWrap, setWallWrap] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;
  const wallWrapRef = useRef(wallWrap);
  wallWrapRef.current = wallWrap;

  const resetGame = useCallback(() => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setFood(spawnFood());
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setIsRunning(true);
  }, []);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Wall collision / wrap
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        if (wallWrapRef.current) {
          head.x = ((head.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
          head.y = ((head.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
        } else {
          setGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }
      }

      // Self collision
      if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true);
        setIsRunning(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Food collision
      if (head.x === food.position.x && head.y === food.position.y) {
        setScore((s) => s + food.type.points);
        setFood(spawnFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [isRunning, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-xl">Score: {score}</div>

      <div
        className="relative bg-gray-800 border-2 border-green-500"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`absolute rounded-sm ${
              i === 0 ? "bg-green-400" : "bg-green-600"
            }`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
            }}
          />
        ))}

        {/* Food */}
        <div
          className={`absolute ${food.type.color} rounded-full shadow-lg ${food.type.glowColor}`}
          style={{
            left: food.position.x * CELL_SIZE,
            top: food.position.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
          }}
        />

        {/* Game Over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <p className="text-red-500 text-3xl font-bold mb-4">Game Over!</p>
            <p className="text-white text-lg mb-4">Score: {score}</p>
          </div>
        )}

        {/* Start screen */}
        {!isRunning && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-green-400 text-xl">
              Press Start to play
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {(!isRunning || gameOver) && (
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
          >
            {gameOver ? "Play Again" : "Start"}
          </button>
        )}
        <label className="flex items-center gap-2 text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={wallWrap}
            onChange={(e) => setWallWrap(e.target.checked)}
            className="w-4 h-4 accent-green-500"
          />
          Wall Wrap
        </label>
      </div>

      <p className="text-gray-500 text-sm mt-2">
        Use arrow keys to control the snake
      </p>

      <div className="flex gap-4 text-sm text-gray-400 mt-1">
        {FOOD_TYPES.map((ft) => (
          <div key={ft.name} className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-full ${ft.color}`} />
            <span>{ft.name}: {ft.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SnakeGame;
