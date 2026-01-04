const Navigation = ({ view, setView, setStatus, setResult }) => {
  const handleSwitch = (newView) => {
    setView(newView);
    setStatus("");
    setResult(null);
  };

  return (
    <nav className="z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl mb-8 flex shadow-2xl relative">
      <button 
        onClick={() => handleSwitch("home")} 
        className={`px-8 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-500 ${view === 'home' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        🎧 PLAY
      </button>
      <button 
        onClick={() => handleSwitch("train")} 
        className={`px-8 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-500 ${view === 'train' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        🧠 TRAIN
      </button>
    </nav>
  );
};

export default Navigation;