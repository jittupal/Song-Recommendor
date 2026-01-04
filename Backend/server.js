// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONFIGURATION ---
const upload = multer({ dest: 'uploads/' }); // Temp storage for images
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// --- 2. DATABASE MODELS ---
// Training Data: Stores the "Vibe Description" + Song + Artist
const TrainingSchema = new mongoose.Schema({
    userId: { type: String, index: true }, // <--- NEW: Stores User ID for private memory
    visualDescription: String,
    song: String,
    artist: String,
    createdAt: { type: Date, default: Date.now } 
});
const TrainingData = mongoose.model('TrainingData', TrainingSchema);

// History: Stores songs to avoid repeats
const HistorySchema = new mongoose.Schema({ song: String });
const History = mongoose.model('History', HistorySchema);

// --- 3. HELPER FUNCTIONS ---
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString("base64"),
            mimeType
        },
    };
}

// Fallback helper in case you forget to type artist name (Optional)
async function getArtistName(songName) {
    try {
        const result = await model.generateContent(`Who is the main artist for the song "${songName}"? Return ONLY the artist name.`);
        return result.response.text().trim();
    } catch (e) { return "Unknown Artist"; }
}

// --- 4. ROUTES ---

// === ROUTE A: TEACH THE AI (Updated for User Memory) ===
app.post('/api/train', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });
        
        // 1. Get Inputs (Including NEW userId)
        let { song, artist, userId } = req.body; 
        const imagePath = req.file.path;

        // If artist wasn't provided, try to guess it (Fallback)
        if (!artist || artist.trim() === "") {
            artist = await getArtistName(song);
        }

        // 2. Analyze Photo to extract the "Vibe" textually
        const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
        const prompt = `
        You are an elite **Visual Forensic Archivist** for a Music AI.
        Your task is to convert this image into a **"High-Fidelity Psycho-Acoustic Profile"**.
        
        Do not just describe *what* is happening. Describe *how it feels* so we can match the song's energy perfectly later.

        Analyze these 5 Biometric & Environmental Layers:

        1. **Subject Architecture (CRITICAL):**
           - **Gender:** Male or Female? (Crucial for vocal matching).
           - **Style Archetype:** "Streetwear/Hoodie" (Hip-Hop), "Traditional/Kurta" (Desi/Folk), "Formal/Suit" (Classy), "Athletic/Tank" (Gym).

        2. **Biometric Stress Indicators (The "Aggression" Check):**
           - **Jaw & Mouth:** Is the jaw clenched (Aggression)? Is the mouth open shouting (High Energy)? Is there a smirk (Attitude)?
           - **Ocular Analysis:** "Hunter Eyes" (Focused), "Dead Stare" (Sad/Numb), "Soft Gaze" (Romantic).

        3. **Physical Kinetics & Texture:**
           - **Sweat & Vascularity:** Are veins popping? Is there sweat? (If yes -> Tag as "High BPM / Heavy Bass").
           - **Posture:** Slouching (Low Energy) vs. Chest Out/Flexing (High Energy).

        4. **Atmospheric Temperature:**
           - **Color Grade:** Cold/Blue (Melancholic), Red/Black (Danger/Aggro), Golden/Yellow (Happy/Nostalgic).
           - **Lighting Source:** Neon (Club/Drive), Sun (Nature), Harsh Overhead (Gym).

        5. **Vibe Classification:**
           - Assign one "Master Label": [Beast Mode], [Night Rider], [Heartbreak], [Main Character], or [Desi Swag].

        **OUTPUT:** A dense, single-paragraph profile starting with the Gender and Vibe Label.
        *Example Output:* "Male Subject. Vibe: Beast Mode. The subject displays high vascularity and sweat with a clenched jaw and furrowed brows, indicating extreme physical stress. He is wearing a black hoodie in a dark environment with harsh red lighting. The energy is hostile and explosive."
        `;
        
        const aiResult = await model.generateContent([prompt, imagePart]);
        const visualDescription = aiResult.response.text().trim();

        // 3. Save to Database with the SPECIFIC Artist AND User ID
        await TrainingData.create({ 
            userId: userId || "anonymous", // <--- NEW: Saves to this user's memory
            visualDescription, 
            song, 
            artist 
        });

        // Cleanup
        fs.unlinkSync(imagePath);

        res.json({ message: `✅ Learned! When I see "${visualDescription}", I will play "${song}" by "${artist}".` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Training failed." });
    }
});

// === ROUTE B: GET RECOMMENDATION (Updated for User Memory) ===
app.post('/api/recommend', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });
        
        const imagePath = req.file.path;
        const userId = req.body.userId || "anonymous"; // <--- NEW: Get User ID

        // 1. Fetch User's Taste Profile (Filtered by User ID)
        // Sort by newest first so your latest training counts more
        const trainingExamples = await TrainingData.find({ userId: userId }).sort({ createdAt: -1 });
        
        // Update: Now we include the ARTIST in the text sent to Gemini
        const userTaste = trainingExamples.map(t => 
            `- When photo showed: "${t.visualDescription}", User specifically wanted: "${t.song}" by "${t.artist}"`
        ).join("\n");

        // 2. Fetch History (Forbidden List)
        const history = await History.find().limit(50);
        const forbidden = history.map(h => h.song).join(", ");

        // 3. THE MASTER PROMPT
        const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
        const prompt = `
        You are 'VibeTunes AI', the world's most elite Audio-Visual Forensic Analyst. 
        Your Mission: **100% Psycho-Acoustic Accuracy** + **0% Repetition**.

        --- PHASE 1: FORENSIC VISUAL DISSECTION (PIXEL-LEVEL ANALYSIS) ---
        Deep scan the image for these 5 critical layers:

        1. **Subject & Gender Protocol (CRITICAL):**
           - **Gender Identification:** Is the subject Male or Female? 
           - **Vocal Match Rule:** - IF Male Subject + High Energy -> Force **Male Vocals** (Aggressive/Deep).
             - IF Female Subject -> Prioritize **Female Vocals** OR **Soft Male Vocals**.
           - **Social Dynamic:** Solo (Loner anthem), Duo (Romantic/Bro), or Group (Party).

        2. **Micro-Expression & Muscle Tension:**
           - **The Jaw Check:** Is the jaw clenched (Aggression/Focus)? Relaxed (Chill)?
           - **The Eye Check:** "Thousand-yard stare" (Sadness)? "Hunter eyes" (Confidence)? "Soft gaze" (Romance)?
           - **The Smile Check:** Genuine Duchenne smile (Happy) vs. Smirk (Attitude).

        3. **Physical Texture & Kinetics:**
           - **Sweat/Veins:** If present, Energy Score is automatically 9/10 (Needs High BPM).
           - **Clothing Texture:** Hoodie/Streetwear (Urban/Hip-Hop), Kurta/Desi (Folk/Desi Beat), Suit (Classy/Pop).

        4. **Atmospheric Temperature:**
           - **Color Grade:** Cold/Blue (Sad/Lonely), Red/Black (Danger/Aggro), Golden/Yellow (Nostalgic/Happy).
           - **Lighting:** Neon (Club/Drive), Natural (Day), Dim (Introspective).

        5. **Contextual Artifacts:**
           - Steering Wheel, Dumbbells, Hookah, Laptop, Sunset, Rain, Mirror.

        --- PHASE 2: MEMORY RECALL & "SONIC TEXTURE" CLONING ---
        Review User's Training Data:
        ${userTaste}

        *ALGORITHM:* - If the image matches a past memory (e.g., "Gym Selfie"), do **NOT** play the same song.
        - Instead, extract the **"Sonic Texture"**: What was the *Bass Level*, *Tempo*, and *Vocal Fry* of the liked song?
        - Find a **FRESH** song that mathematically matches that texture.

        --- PHASE 3: THE SELECTION MATRIX ---
        Select ONE song based on this precise mapping logic:

        **CASE A: THE "ALPHA / BEAST MODE" (Male + Gym/Anger/Flexing)**
        - *Visual Triggers:* Veins, Sweat, Scowl, Hoodie, Gym.
        - *Audio Output:* **Haryanvi** (Masoom Sharma type) or **Punjabi Drill** (Nseeb type). 
        - *Vibe:* Aggressive, Heavy Bass, War-ready.

        **CASE B: THE "NIGHT RIDER / GEDI" (Male + Car + Smirk)**
        - *Visual Triggers:* Steering wheel, Sunglasses, Night, Neon.
        - *Audio Output:* **Punjabi Trapsoul / R&B** (AP Dhillon, Jerry, Tegi Pannu).
        - *Vibe:* Smooth, Cool, Bass-heavy but slow.

        **CASE C: THE "HEARTBREAK / LONER" (Sad Eyes + Dark/Blue)**
        - *Visual Triggers:* Looking down, Rain, Bed, Blank stare.
        - *Audio Output:* **Melancholic Punjabi** (B Praak) or **Slow Bollywood** (Arijit).
        - *Vibe:* High reverb vocals, Slow tempo, Emotional.

        **CASE D: THE "MAIN CHARACTER" (Walking/Smiling/Bright)**
        - *Visual Triggers:* Day lighting, Fashionable clothes, Confidence.
        - *Audio Output:* **Upbeat Bollywood** or **Commercial Punjabi Pop** (Diljit, Karan Aujla).
        - *Vibe:* Celebratory, Catchy, Danceable.

        **CASE E: THE "DESI SWAG" (Kurta/Rural/Raw)**
        - *Visual Triggers:* Traditional clothes, Farm, Jeep, Moustache.
        - *Audio Output:* **Desi Haryanvi/Punjabi Folk** (Gulzaar Chhaniwala).
        - *Vibe:* Raw, Folk instruments, Proud.

        --- PHASE 4: FINAL CONSTRAINTS ---
        1. **Language:** Hindi, Haryanvi, or Punjabi ONLY.
        2. **Anti-Repeat:** STRICTLY FORBIDDEN: [${forbidden}].
        3. **Identity:** If training had "Sidhu Moose Wala", recommend "Nseeb" or "Prem Dhillon". (Same Energy, New Voice).

        OUTPUT FORMAT (JSON ONLY):
        { 
            "song": "Song Title", 
            "artist": "Artist Name", 
            "reason": "VISUAL AUDIT: Subject is [Male]. Detected [Micro-Expression: Clenched Jaw] and [Texture: Sweat]. Lighting is [Dark/Red]. \n\nANALYSIS: This indicates 'Beast Mode'. \n\nSELECTION: Matched Gender (Male Vocals). Matched Energy (High BPM). Chosen a fresh track with heavy bass similar to your training data but by a new artist." 
        }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(responseText);

        // Cleanup
        fs.unlinkSync(imagePath);
        
        // Save to History
        await History.create({ song: data.song });

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI Analysis Failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));