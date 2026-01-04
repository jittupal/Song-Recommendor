import { useState, useEffect } from 'react';
import axios from 'axios';

// Import Components
// import SEOHead from './components/SEOHead';
import Header from './components/Header';
import Background from './components/Background';
import Navigation from './components/Navigation';
import ImageUpload from './components/ImageUpload';
import TrainForm from './components/TrainForm';
import ResultCard from './components/ResultCard';

function App() {
  const [view, setView] = useState("home"); 
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // --- REMOVED: Language State ---

  // --- User ID State (For Private Memory) ---
  const [userId, setUserId] = useState("");

  // Input States
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState(""); 

  // UI States
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  // CONFIG
  const API_BASE = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://YOUR-BACKEND-URL.com"; 

  // --- Generate/Retrieve User ID on Load ---
  useEffect(() => {
    let storedId = localStorage.getItem("vibe_user_id");
    if (!storedId) {
      // Create a random ID (e.g., user_x8k29a)
      storedId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("vibe_user_id", storedId);
    }
    setUserId(storedId);
    console.log("Logged in as:", storedId);
  }, []);

  // Handlers
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setStatus("");
    }
  };

  const handleTrain = async () => {
    if (!image || !songName || !artistName) return alert("Please upload photo, song name, AND artist name!");
    
    setLoading(true);
    setStatus("🧠 Memorizing your visual taste...");
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('song', songName);
    formData.append('artist', artistName); 
    formData.append('userId', userId); // <--- Sending User ID

    try {
      const res = await axios.post(`${API_BASE}/api/train`, formData);
      setStatus(res.data.message);
      setSongName("");
      setArtistName("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: Could not connect to backend.");
    }
    setLoading(false);
  };

  const handleRecommend = async () => {
    if (!image) return alert("Please upload a photo first!");
    
    setLoading(true);
    setStatus("👁️ Analyzing micro-expressions & vibe...");
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId); // <--- Sending User ID
    // --- REMOVED: Language append ---

    try {
      const res = await axios.post(`${API_BASE}/api/recommend`, formData);
      setResult(res.data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: AI Brain is offline.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black text-white font-sans flex flex-col items-center py-12 px-4 selection:bg-pink-500 selection:text-white">
      
      {/* 1. SEO & Metadata */}
      {/* <SEOHead /> */}
      
      {/* 2. Visual Background */}
      <Background />

      {/* 3. Header Title */}
      <Header />

      {/* 4. Navigation Tabs */}
      <Navigation 
        view={view} 
        setView={setView} 
        setStatus={setStatus} 
        setResult={setResult} 
      />

      {/* 5. Main Content Card */}
      <main className="z-10 w-full max-w-lg bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        
        {/* Border Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine"></div>

        {/* Upload Widget */}
        <ImageUpload preview={preview} handleFile={handleFile} />

        {/* Dynamic Forms based on View */}
        {view === 'train' ? (
          <TrainForm 
            songName={songName}
            setSongName={setSongName}
            artistName={artistName}
            setArtistName={setArtistName}
            handleTrain={handleTrain}
            loading={loading}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- REMOVED: Language Selector Dropdown --- */}

            <button 
              onClick={handleRecommend} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Analyzing Vibe..." : "Get Vibe Match 🎵"}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {status && (
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-sm font-medium text-cyan-300 animate-pulse">{status}</p>
          </div>
        )}
      </main>

      {/* 6. Result Section */}
      <ResultCard result={result} preview={preview} />

    </div>
  );
}

export default App;