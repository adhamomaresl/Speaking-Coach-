/**
 * supabaseClient.js - Cloud synchronization for practice sessions and custom topics
 * Connects to the user's Supabase project using the official @supabase/supabase-js library.
 */
class SupabaseService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  initClient() {
    const prefs = StorageManager.getPreferences();
    if (prefs.supabaseUrl && prefs.supabaseKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(prefs.supabaseUrl.trim(), prefs.supabaseKey.trim());
      } catch (err) {
        console.warn("Failed to initialize Supabase client:", err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    return this.client !== null;
  }

  async testConnection(url, key) {
    if (!window.supabase) {
      throw new Error("Supabase JS SDK not loaded. Check internet connection.");
    }
    try {
      const testClient = window.supabase.createClient(url.trim(), key.trim());
      const { data, error } = await testClient.from("practice_sessions").select("id").limit(1);
      if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async syncSession(session) {
    if (!this.client) return null;

    try {
      const turnCount = session.turns ? session.turns.length : 0;
      const lastTurn = session.turns && session.turns[session.turns.length - 1];
      const avgBand = lastTurn?.evaluation?.overallBand || null;

      // 1. Upsert Practice Session Header
      const { error: sessionError } = await this.client
        .from("practice_sessions")
        .upsert({
          id: session.id,
          topic_id: session.topic?.id || "custom",
          topic_title: session.topic?.title || "Speaking Practice",
          topic_category: session.topic?.category || "General",
          average_band: avgBand,
          total_turns: turnCount,
          created_at: session.startTime || new Date().toISOString()
        });

      if (sessionError) {
        console.error("Error syncing session header to Supabase:", sessionError);
        return;
      }

      // 2. Insert turns if any exist
      if (session.turns && session.turns.length > 0) {
        for (const turn of session.turns) {
          const evalData = turn.evaluation || {};
          await this.client
            .from("speaking_turns")
            .upsert({
              session_id: session.id,
              turn_index: turn.turnIndex || 0,
              question: turn.question || "",
              student_transcript: turn.transcript || "",
              overall_band: evalData.overallBand || null,
              grammar_score: evalData.grammarAnalysis?.score || null,
              grammar_mistakes: evalData.grammarAnalysis?.mistakes || [],
              pronunciation_score: evalData.pronunciationAndDelivery?.score || null,
              pronunciation_feedback: evalData.pronunciationAndDelivery || {},
              content_score: evalData.contentAndStructure?.score || null,
              vocabulary_upgrades: evalData.contentAndStructure?.betterVocabulary || [],
              idea_score: evalData.ideaDevelopment?.score || null,
              idea_development: evalData.ideaDevelopment || {},
              follow_up_question: evalData.followUpQuestion || "",
              spoken_coach_response: evalData.spokenCoachResponse || ""
            }, { onConflict: "session_id,turn_index" });
        }
      }

      return true;
    } catch (err) {
      console.warn("Supabase session sync error:", err);
      return false;
    }
  }

  async syncCustomTopic(topic) {
    if (!this.client) return null;

    try {
      const { error } = await this.client
        .from("custom_topics")
        .upsert({
          id: topic.id,
          title: topic.title,
          category: topic.category,
          question: topic.question,
          key_vocabulary: topic.keyVocabulary || [],
          idea_starters: topic.ideaStarters || []
        });

      if (error) console.error("Error syncing custom topic to Supabase:", error);
    } catch (err) {
      console.warn("Supabase custom topic sync error:", err);
    }
  }

  async fetchRemoteSessions() {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from("practice_sessions")
        .select(`
          id,
          created_at,
          topic_title,
          topic_category,
          average_band,
          total_turns,
          speaking_turns (*)
        `)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.warn("Error fetching remote sessions:", error);
        return [];
      }
      return data;
    } catch (err) {
      return [];
    }
  }
}

// Global instance
window.supabaseServiceInstance = new SupabaseService();
