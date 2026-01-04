const ResultCard = ({ result, preview }) => {
  if (!result) return null;

  return (
    <article className="z-20 mt-8 w-full max-w-md bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
      <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-black rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden border border-white/5 shadow-inner">
        {preview && <img src={preview} alt="Song Artwork" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />}
        <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] animate-spin-slow">
          <div className="w-12 h-12 bg-black rounded-full border-2 border-gray-800"></div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight">{result.song}</h2>
          <p className="text-gray-400 font-medium">{result.artist}</p>
        </div>
        <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-green-500/30">99% Match</div>
      </div>

      <div className="w-full bg-gray-700 h-1.5 rounded-full mt-4 mb-1 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 w-2/3 h-full rounded-full"></div>
      </div>
      
      <div className="bg-white/5 rounded-xl p-4 mb-6 border-l-2 border-pink-500">
        <p className="text-gray-300 text-sm italic leading-relaxed">"{result.reason}"</p>
      </div>

      <a 
        href={`https://www.youtube.com/results?search_query=${result.song}+${result.artist}`} 
        target="_blank" 
        rel="noreferrer"
        className="w-full block text-center bg-[#FF0000] hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-900/50 flex items-center justify-center gap-2 group"
      >
        Listen on YouTube
      </a>
    </article>
  );
};

export default ResultCard;