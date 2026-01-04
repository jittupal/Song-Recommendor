const TrainForm = ({ songName, setSongName, artistName, setArtistName, handleTrain, loading }) => {
  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="text-xs font-bold text-white ml-1 uppercase">Song Title</label>
        <input 
          type="text" 
          placeholder="e.g. Blinding Lights" 
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
        />
      </div>
      
      <div>
        <label className="text-xs font-bold text-white ml-1 uppercase">Artist Name</label>
        <input 
          type="text" 
          placeholder="e.g. The Weeknd" 
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
        />
      </div>

      <button 
        onClick={handleTrain} 
        disabled={loading}
        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Processing..." : "Save to Memory 💾"}
      </button>
    </section>
  );
};

export default TrainForm;