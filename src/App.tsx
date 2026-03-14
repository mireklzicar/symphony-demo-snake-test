import SnakeGame from "./components/SnakeGame";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-400 mb-6">Snake Game</h1>
      <SnakeGame />
    </div>
  );
}

export default App;
