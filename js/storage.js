/**
 * storage.js - Local storage management for user preferences, API keys, and session records
 */
const STORAGE_KEYS = {
  PREFERENCES: "speaking_coach_prefs_v1",
  SESSIONS: "speaking_coach_sessions_v1",
  CURRENT_SESSION: "speaking_coach_active_session_v1",
  CUSTOM_TOPICS: "speaking_coach_custom_topics_v1"
};

const DEFAULT_PREFERENCES = {
  provider: "builtin", // "builtin", "gemini", "openai", "groq", "ollama"
  geminiKey: "",
  openaiKey: "",
  groqKey: "",
  ollamaEndpoint: "http://localhost:11434/api/generate",
  coachPersona: "constructive", // "constructive", "academic", "executive", "socratic"
  proficiencyLevel: "b2-c1", // "b1-b2", "b2-c1", "c1-c2"
  speechVoice: "",
  speechPitch: 1.0,
  speechRate: 1.0,
  autoReadFeedback: true,
  autoListenAfterPrompt: false,
  timerSeconds: 120,
  supabaseUrl: "https://opmgoslhzbcusytodxiv.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbWdvc2xoemJjdXN5dG9keGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTU4MzgsImV4cCI6MjEwNzczMTgzOH0.Dt3Q4H0yvuB_kAYsDEty9F3_tJu_GVSd3BSw0qOHvrQ"
};

class StorageManager {
  static getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : { ...DEFAULT_PREFERENCES };
    } catch (e) {
      console.warn("Error loading preferences from localStorage", e);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static savePreferences(prefs) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Error saving preferences", e);
      return null;
    }
  }

  static getSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Error reading sessions", e);
      return [];
    }
  }

  static saveSession(session) {
    try {
      const sessions = this.getSessions();
      // Prepend to show latest first
      sessions.unshift(session);
      // Keep up to 50 recent sessions
      if (sessions.length > 50) sessions.length = 50;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      return sessions;
    } catch (e) {
      console.error("Error saving session", e);
      return [];
    }
  }

  static deleteSession(sessionId) {
    try {
      let sessions = this.getSessions();
      sessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      return sessions;
    } catch (e) {
      console.error("Error deleting session", e);
      return [];
    }
  }

  static clearAllSessions() {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  static getCustomTopics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOPICS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveCustomTopic(topic) {
    try {
      const topics = this.getCustomTopics();
      topics.unshift(topic);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(topics));
      return topics;
    } catch (e) {
      console.error("Error saving custom topic", e);
      return [];
    }
  }
}
