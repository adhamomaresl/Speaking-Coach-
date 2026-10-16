# Vocalis AI - Speaking Coach & Idea Development Platform

Vocalis AI is an interactive, live-coaching spoken English application. Designed to mentor students beyond traditional standardized testing (such as IELTS or TOEFL), it evaluates:
1. **Grammatical Range & Accuracy** (with explicit side-by-side corrections and rules)
2. **Pronunciation & Delivery** (phonetic IPA guides, pacing, and filler word detection)
3. **Content Relevance & Lexical Upgrades** (academic and professional collocations)
4. **Idea Development & Thought Expansion** (deepening arguments, counter-angles, and real-world examples)
5. **Adaptive Follow-Up Challenges** (conversational progression)

---

## Architecture & Integrations

- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism luxury dark aesthetic), and Modern JavaScript (ES6+).
- **Audio & Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + Web Audio API (`AudioContext`, `AnalyserNode`) with dynamic neon visualizer.
- **AI Intelligence**: Direct support for Google Gemini, OpenAI, Groq, Ollama, and a built-in offline smart heuristic engine.
- **Database (Supabase)**: Real-time cloud synchronization for speaking sessions, transcripts, rubric scores, and custom topics.
- **Hosting & CI/CD (Vercel)**: Zero-config edge deployment with automated deployments on every `git push`.

---

## 🚀 Setup & Linking Guide

### 1. Link to GitHub

1. Create a new empty repository on your [GitHub](https://github.com/new) account (e.g. `speaking-coach`).
2. Run the following command in PowerShell in this directory:
   ```powershell
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/speaking-coach.git
   git push -u origin main
   ```
*(Every future update can now be pushed with `git push origin main`)*.

---

### 2. Link to Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project (e.g. `vocalis-speaking-coach`).
2. In the Supabase sidebar, open **SQL Editor**, click **New Query**, and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). Click **Run**.
3. Go to **Project Settings** > **API**, and copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key** (`eyJhbGciOi...`)
4. Open the web app, click the **Settings (gear icon)** in the top right, scroll to **Supabase Cloud Database**, paste your URL and Anon Key, and click **Test Supabase Connection**.
5. Click **Save Preferences**. All future sessions and custom topics will automatically sync to your cloud database!

---

### 3. Link to Vercel (Live Instant Deployment)

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** > **Project**.
3. Under **Import Git Repository**, select your GitHub repository (`speaking-coach`).
4. Keep the Framework Preset as **Other** (it will automatically detect static HTML/CSS/JS and use [`vercel.json`](vercel.json)).
5. Click **Deploy**.
6. Within 15 seconds, your app is live on a global CDN URL (e.g. `https://vocalis-speaking-coach.vercel.app`) with free automatic SSL and continuous deployment on every Git push!
