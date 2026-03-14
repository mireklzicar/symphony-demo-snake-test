import SnakeGame from "./components/SnakeGame";

function App() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.06) 0%, transparent 60%), linear-gradient(180deg, #080810 0%, #0d1117 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="text-5xl font-black tracking-tight mb-1"
          style={{
            background: "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Snake
        </h1>
        <p className="text-white/30 text-sm tracking-widest uppercase font-medium">Classic arcade</p>
      </div>

      <SnakeGame />

      <p className="mt-8 text-white/20 text-xs">
        Built with React + Tailwind
      </p>
    </div>
  );
}

export default App;
