/**
 * app.js - Main Application Orchestrator for AI Speaking Coach
 */
document.addEventListener("DOMContentLoaded", () => {
  // --- State Initialization ---
  let preferences = StorageManager.getPreferences();
  let currentTopic = SPEAKING_TOPICS[0];
  let currentTurnIndex = 0;
  let activeSession = {
    id: "sess_" + Date.now(),
    startTime: new Date().toISOString(),
    topic: currentTopic,
    turns: []
  };

  let timerInterval = null;
  let timerRemaining = preferences.timerSeconds || 120;
  let isTimerRunning = false;
  let currentTranscript = { final: "", interim: "" };
  let lastRecordedAudio = null;

  // --- Core Services ---
  const speechService = new SpeechService({
    onTranscriptUpdate: ({ final, interim }) => {
      currentTranscript = { final, interim };
      updateTranscriptUI();
    },
    onListeningStateChange: (listening) => {
      updateListeningStateUI(listening);
    },
    onSpeakingStateChange: (speaking) => {
      updateSpeakingStateUI(speaking);
    },
    onAudioRecorded: async ({ blob, url, base64, mimeType }) => {
      lastRecordedAudio = { blob, url, base64, mimeType };
      elements.audioPlaybackPlayer.src = url;
      elements.audioPlaybackContainer.classList.remove("hidden");

      // Auto-transcribe if transcript was empty due to browser network restriction
      const currentText = (currentTranscript.final + " " + currentTranscript.interim).trim();
      if (!currentText && (preferences.groqKey || preferences.openaiKey)) {
        showToast("Transcribing recorded voice using AI...", "info");
        elements.coachOrb.className = "coach-orb analyzing";
        elements.coachStatusText.textContent = "Transcribing spoken audio with AI Whisper...";
        const transcribed = await aiCoach.transcribeAudio(blob);
        if (transcribed) {
          currentTranscript.final = transcribed;
          updateTranscriptUI();
          showToast("Voice transcribed successfully!", "success");
        }
        elements.coachOrb.className = "coach-orb idle";
        elements.coachStatusText.textContent = "Audio recorded & transcribed. Ready to evaluate.";
      } else if (!currentText) {
        showToast("Voice recorded! Listen to playback or type in your response to evaluate.", "info");
        elements.textInputContainer.classList.remove("hidden");
      }
    },
    onError: (msg) => {
      showToast(msg, "warning");
    }
  });

  const aiCoach = new AICoach(preferences);

  // --- DOM Elements ---
  const elements = {
    // Nav & Tabs
    tabPractice: document.getElementById("tab-practice"),
    tabTopics: document.getElementById("tab-topics"),
    tabHistory: document.getElementById("tab-history"),
    btnOpenSettings: document.getElementById("btn-open-settings"),
    viewPractice: document.getElementById("view-practice"),
    viewTopics: document.getElementById("view-topics"),
    viewHistory: document.getElementById("view-history"),

    // Topic Header in Practice View
    topicBadge: document.getElementById("current-topic-category"),
    topicTitle: document.getElementById("current-topic-title"),
    topicQuestion: document.getElementById("current-topic-question"),
    topicGuidance: document.getElementById("current-topic-guidance"),
    topicVocabList: document.getElementById("current-topic-vocab"),
    btnSpeakQuestion: document.getElementById("btn-speak-question"),
    btnChangeTopic: document.getElementById("btn-change-topic"),

    // Coach Visualizer & State
    coachOrb: document.getElementById("coach-orb"),
    coachStatusText: document.getElementById("coach-status-text"),
    audioCanvas: document.getElementById("audio-visualizer-canvas"),

    // Live Speaking Controls
    transcriptDisplay: document.getElementById("live-transcript-box"),
    wordCountBadge: document.getElementById("word-count-badge"),
    timerDisplay: document.getElementById("timer-display"),
    btnToggleMic: document.getElementById("btn-toggle-mic"),
    btnSubmitAnswer: document.getElementById("btn-submit-answer"),
    btnClearTranscript: document.getElementById("btn-clear-transcript"),
    textInputFallback: document.getElementById("text-input-fallback"),
    btnToggleTextInput: document.getElementById("btn-toggle-text-input"),
    textInputContainer: document.getElementById("text-input-container"),
    audioPlaybackContainer: document.getElementById("audio-playback-container"),
    audioPlaybackPlayer: document.getElementById("audio-playback-player"),

    // Feedback Container
    feedbackSection: document.getElementById("feedback-section"),
    feedbackPlaceholder: document.getElementById("feedback-placeholder"),
    feedbackContent: document.getElementById("feedback-content"),
    overallBandBadge: document.getElementById("overall-band-badge"),
    summaryComment: document.getElementById("summary-comment"),
    grammarMistakesList: document.getElementById("grammar-mistakes-list"),
    pronunciationContent: document.getElementById("pronunciation-content"),
    vocabularyContent: document.getElementById("vocabulary-content"),
    ideaDevelopmentList: document.getElementById("idea-development-list"),
    modelResponseText: document.getElementById("model-response-text"),
    followUpCard: document.getElementById("follow-up-card"),
    followUpQuestionText: document.getElementById("follow-up-question-text"),
    btnAnswerFollowUp: document.getElementById("btn-answer-follow-up"),
    btnNextTopic: document.getElementById("btn-next-topic"),
    btnReplayFeedback: document.getElementById("btn-replay-feedback"),

    // Topics View
    topicsGrid: document.getElementById("topics-grid"),
    categoryFilter: document.getElementById("category-filter"),
    btnCustomTopicModal: document.getElementById("btn-open-custom-topic"),

    // History View
    historyList: document.getElementById("history-sessions-list"),
    btnClearHistory: document.getElementById("btn-clear-history"),
    btnExportReport: document.getElementById("btn-export-report"),

    // Settings Modal
    settingsModal: document.getElementById("settings-modal"),
    btnCloseSettings: document.getElementById("btn-close-settings"),
    btnSaveSettings: document.getElementById("btn-save-settings"),
    selectProvider: document.getElementById("select-provider"),
    inputGeminiKey: document.getElementById("input-gemini-key"),
    inputOpenaiKey: document.getElementById("input-openai-key"),
    inputGroqKey: document.getElementById("input-groq-key"),
    inputOllamaEndpoint: document.getElementById("input-ollama-endpoint"),
    selectPersona: document.getElementById("select-persona"),
    selectProficiency: document.getElementById("select-proficiency"),
    selectVoice: document.getElementById("select-voice"),
    inputSpeechRate: document.getElementById("input-speech-rate"),
    rateValueDisplay: document.getElementById("rate-val-display"),
    checkAutoRead: document.getElementById("check-auto-read"),
    inputSupabaseUrl: document.getElementById("input-supabase-url"),
    inputSupabaseKey: document.getElementById("input-supabase-key"),
    btnTestSupabase: document.getElementById("btn-test-supabase"),
    supabaseStatusBadge: document.getElementById("supabase-status-badge"),

    // Custom Topic Modal
    customTopicModal: document.getElementById("custom-topic-modal"),
    btnCloseCustomTopic: document.getElementById("btn-close-custom-topic"),
    btnSaveCustomTopic: document.getElementById("btn-save-custom-topic"),
    inputCustomTitle: document.getElementById("input-custom-title"),
    inputCustomCategory: document.getElementById("input-custom-category"),
    inputCustomQuestion: document.getElementById("input-custom-question"),
    inputCustomVocab: document.getElementById("input-custom-vocab"),

    // Toast
    toast: document.getElementById("toast")
  };

  // --- Initialization Routine ---
  function init() {
    loadTopic(currentTopic);
    renderTopicsList();
    renderHistoryList();
    populateVoiceSelect();
    applyPreferencesToSettingsUI();
    speechService.drawIdleWaveform();

    bindEvents();
  }

  // --- Topic Management ---
  function loadTopic(topic) {
    currentTopic = topic;
    elements.topicBadge.textContent = topic.category;
    elements.topicTitle.textContent = topic.title;
    elements.topicQuestion.textContent = topic.question;
    elements.topicGuidance.textContent = topic.guidance || "Formulate a well-structured argument with supporting examples.";
    
    // Key vocab chips
    elements.topicVocabList.innerHTML = "";
    if (topic.keyVocabulary && topic.keyVocabulary.length > 0) {
      topic.keyVocabulary.forEach(word => {
        const chip = document.createElement("span");
        chip.className = "vocab-chip";
        chip.textContent = word;
        chip.title = "Click to hear pronunciation";
        chip.addEventListener("click", () => speechService.speak(word));
        elements.topicVocabList.appendChild(chip);
      });
    }

    // Reset coaching feedback view
    elements.feedbackContent.classList.add("hidden");
    elements.feedbackPlaceholder.classList.remove("hidden");
    resetTranscript();
    resetTimer();
  }

  function resetTranscript() {
    currentTranscript = { final: "", interim: "" };
    lastRecordedAudio = null;
    elements.transcriptDisplay.innerHTML = '<span class="text-muted italic">Click "Start Speaking" or use your microphone to begin your answer...</span>';
    elements.wordCountBadge.textContent = "0 words";
    elements.textInputFallback.value = "";
    if (elements.audioPlaybackContainer) {
      elements.audioPlaybackContainer.classList.add("hidden");
    }
    if (elements.audioPlaybackPlayer) {
      elements.audioPlaybackPlayer.src = "";
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerRemaining = preferences.timerSeconds || 120;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    elements.timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();
      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        showToast("Time's up! Evaluating your spoken response...", "info");
        finishAndEvaluate();
      }
    }, 1000);
  }

  // --- Real-Time Speech UI ---
  function updateTranscriptUI() {
    const combined = (currentTranscript.final + " " + currentTranscript.interim).trim();
    if (!combined) {
      elements.transcriptDisplay.innerHTML = '<span class="text-muted italic">Listening... Speak clearly into your microphone.</span>';
      elements.wordCountBadge.textContent = "0 words";
      return;
    }

    // Highlighting interim text
    let html = `<span>${escapeHTML(currentTranscript.final)}</span>`;
    if (currentTranscript.interim) {
      html += ` <span class="interim-text">${escapeHTML(currentTranscript.interim)}</span>`;
    }
    elements.transcriptDisplay.innerHTML = html;

    const words = combined.split(/\s+/).filter(Boolean);
    elements.wordCountBadge.textContent = `${words.length} words`;
    elements.textInputFallback.value = combined;
  }

  function updateListeningStateUI(listening) {
    if (listening) {
      elements.btnToggleMic.classList.add("btn-active-listening");
      elements.btnToggleMic.innerHTML = `
        <svg class="icon-pulse" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
        </svg>
        <span>Stop Speaking</span>
      `;
      elements.coachOrb.className = "coach-orb listening";
      elements.coachStatusText.textContent = "Coach is actively listening to you...";
      startTimer();
    } else {
      elements.btnToggleMic.classList.remove("btn-active-listening");
      elements.btnToggleMic.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <span>Start Speaking</span>
      `;
      elements.coachOrb.className = "coach-orb idle";
      elements.coachStatusText.textContent = "Ready when you are. Press Start Speaking.";
      clearInterval(timerInterval);
      isTimerRunning = false;
    }
  }

  function updateSpeakingStateUI(speaking) {
    if (speaking) {
      elements.coachOrb.className = "coach-orb speaking";
      elements.coachStatusText.textContent = "Coach is speaking...";
    } else if (!speechService.isListening) {
      elements.coachOrb.className = "coach-orb idle";
      elements.coachStatusText.textContent = "Ready for your response.";
    }
  }

  // --- Evaluation Workflow ---
  async function finishAndEvaluate() {
    if (speechService.isListening) {
      speechService.stopListening();
    }

    // Get answer text from speech or fallback textarea
    let answerText = (currentTranscript.final + " " + currentTranscript.interim).trim();
    if (!answerText) {
      answerText = elements.textInputFallback.value.trim();
    }

    // If answerText is empty but audio was recorded, attempt AI transcription
    if (!answerText && lastRecordedAudio?.blob && (preferences.groqKey || preferences.openaiKey)) {
      elements.coachOrb.className = "coach-orb analyzing";
      elements.coachStatusText.textContent = "Transcribing your audio with AI Whisper...";
      elements.btnSubmitAnswer.disabled = true;
      elements.btnSubmitAnswer.innerHTML = `<span class="spinner"></span> Transcribing...`;

      try {
        const transcribed = await aiCoach.transcribeAudio(lastRecordedAudio.blob);
        if (transcribed) {
          answerText = transcribed;
          currentTranscript.final = transcribed;
          updateTranscriptUI();
        }
      } catch (e) {
        console.warn("Audio transcription error:", e);
      }
    }

    // If still no text and no audio
    if (!answerText && !lastRecordedAudio) {
      showToast("Please speak or type a response first before evaluating.", "warning");
      elements.btnSubmitAnswer.disabled = false;
      elements.btnSubmitAnswer.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Evaluate Response</span>
      `;
      return;
    }

    if (!answerText && lastRecordedAudio && preferences.provider !== "gemini") {
      showToast("Audio recorded! Please type a quick note of what you said below to run local evaluation.", "info");
      elements.textInputContainer.classList.remove("hidden");
      elements.textInputFallback.focus();
      elements.btnSubmitAnswer.disabled = false;
      elements.btnSubmitAnswer.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Evaluate Response</span>
      `;
      return;
    }

    // Set UI to analyzing state
    elements.coachOrb.className = "coach-orb analyzing";
    elements.coachStatusText.textContent = "Analyzing grammar, pronunciation, content & expanding ideas...";
    elements.btnSubmitAnswer.disabled = true;
    elements.btnSubmitAnswer.innerHTML = `<span class="spinner"></span> Analyzing...`;

    try {
      const evaluation = await aiCoach.evaluateResponse({
        topic: currentTopic,
        studentTranscript: answerText,
        audioBase64: lastRecordedAudio?.base64 || null,
        audioMimeType: lastRecordedAudio?.mimeType || "audio/webm",
        turnIndex: currentTurnIndex
      });

      renderFeedbackUI(evaluation, answerText);

      // Record to active session
      activeSession.turns.push({
        turnIndex: currentTurnIndex++,
        question: currentTopic.question,
        transcript: answerText,
        evaluation: evaluation,
        timestamp: new Date().toISOString()
      });
      StorageManager.saveSession(activeSession);
      if (window.supabaseServiceInstance && window.supabaseServiceInstance.isConfigured()) {
        window.supabaseServiceInstance.syncSession(activeSession);
      }
      renderHistoryList();

      // Read feedback out loud if enabled
      if (preferences.autoReadFeedback && evaluation.spokenCoachResponse) {
        speechService.speak(evaluation.spokenCoachResponse);
      }

    } catch (err) {
      console.error("Evaluation error:", err);
      showToast("Evaluation failed: " + err.message, "danger");
    } finally {
      elements.btnSubmitAnswer.disabled = false;
      elements.btnSubmitAnswer.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Evaluate Response</span>
      `;
      if (!speechService.isSpeaking) {
        elements.coachOrb.className = "coach-orb idle";
        elements.coachStatusText.textContent = "Coaching evaluation ready below.";
      }
    }
  }

  // --- Render Feedback Details ---
  function renderFeedbackUI(evaluation, studentTranscript) {
    elements.feedbackPlaceholder.classList.add("hidden");
    elements.feedbackContent.classList.remove("hidden");

    // Band score & summary
    elements.overallBandBadge.textContent = `Band ${evaluation.overallBand || 7.0} / 9.0`;
    elements.summaryComment.textContent = evaluation.summaryComment || "Solid spoken response.";

    // 1. Grammar Mistakes
    elements.grammarMistakesList.innerHTML = "";
    const grammar = evaluation.grammarAnalysis;
    if (grammar && grammar.mistakes && grammar.mistakes.length > 0) {
      grammar.mistakes.forEach(m => {
        const card = document.createElement("div");
        card.className = "mistake-card";
        card.innerHTML = `
          <div class="mistake-comparison">
            <div class="mistake-original">
              <span class="badge badge-error">Original</span>
              <code>"${escapeHTML(m.original)}"</code>
            </div>
            <div class="mistake-arrow">→</div>
            <div class="mistake-corrected">
              <span class="badge badge-success">Refined</span>
              <code>"${escapeHTML(m.corrected)}"</code>
            </div>
          </div>
          <p class="mistake-rule"><strong>Rule:</strong> ${escapeHTML(m.rule)}</p>
        `;
        elements.grammarMistakesList.appendChild(card);
      });
    } else {
      elements.grammarMistakesList.innerHTML = `
        <div class="success-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>No critical grammatical errors detected. Strong syntactic control!</span>
        </div>
      `;
    }

    // 2. Pronunciation & Delivery
    const pron = evaluation.pronunciationAndDelivery;
    let pronHTML = "";
    if (pron) {
      pronHTML += `<div class="delivery-metrics">
        <div class="metric-pill">
          <span class="metric-label">Pacing:</span>
          <span class="metric-value">${escapeHTML(pron.paceEvaluation || "Natural cadence")}</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Fillers:</span>
          <span class="metric-value">${pron.fillerWordsDetected ? pron.fillerWordsDetected.join(", ") : "None"}</span>
        </div>
      </div>`;

      if (pron.phoneticTips && pron.phoneticTips.length > 0) {
        pronHTML += `<div class="phonetic-tips-list">`;
        pron.phoneticTips.forEach(tip => {
          pronHTML += `
            <div class="phonetic-tip-item">
              <div class="phonetic-header">
                <span class="word-highlight">${escapeHTML(tip.word)}</span>
                <span class="ipa-code">${escapeHTML(tip.phonetic || "")}</span>
                <button class="btn-icon-tiny" title="Listen to pronunciation" onclick="window.speechServiceInstance.speak('${escapeHTML(tip.word)}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                  Listen
                </button>
              </div>
              <p class="tip-desc">${escapeHTML(tip.tip)}</p>
            </div>
          `;
        });
        pronHTML += `</div>`;
      }

      if (pron.intonationAdvice) {
        pronHTML += `<p class="intonation-advice"><strong>Intonation & Delivery Tip:</strong> ${escapeHTML(pron.intonationAdvice)}</p>`;
      }
    }
    elements.pronunciationContent.innerHTML = pronHTML;

    // 3. Content & Vocabulary Upgrades
    const content = evaluation.contentAndStructure;
    let vocabHTML = "";
    if (content) {
      vocabHTML += `<p class="content-relevance"><strong>Relevance:</strong> ${escapeHTML(content.relevance || "Directly addressed prompt.")}</p>`;
      if (content.betterVocabulary && content.betterVocabulary.length > 0) {
        vocabHTML += `<div class="vocab-upgrade-grid">`;
        content.betterVocabulary.forEach(item => {
          vocabHTML += `
            <div class="vocab-upgrade-card">
              <div class="vocab-comparison">
                <span class="basic-vocab">${escapeHTML(item.basic)}</span>
                <span class="vocab-arrow">➔</span>
                <span class="advanced-vocab">${escapeHTML(item.advanced)}</span>
              </div>
              <p class="vocab-context"><em>"${escapeHTML(item.contextSentence || "")}"</em></p>
            </div>
          `;
        });
        vocabHTML += `</div>`;
      }
    }
    elements.vocabularyContent.innerHTML = vocabHTML;

    // 4. IDEA DEVELOPMENT & THOUGHT EXPANSION (Requested core feature)
    const ideas = evaluation.ideaDevelopment;
    elements.ideaDevelopmentList.innerHTML = "";
    if (ideas && ideas.addedIdeas) {
      ideas.addedIdeas.forEach((ideaText, idx) => {
        const item = document.createElement("li");
        item.className = "idea-expansion-item";
        item.innerHTML = `
          <div class="idea-num-badge">${idx + 1}</div>
          <div class="idea-text">${escapeHTML(ideaText)}</div>
        `;
        elements.ideaDevelopmentList.appendChild(item);
      });
    }

    // Model response sample
    if (ideas && ideas.sampleExpandedResponse) {
      elements.modelResponseText.textContent = `"${ideas.sampleExpandedResponse}"`;
    }

    // 5. Follow-up Question
    if (evaluation.followUpQuestion) {
      elements.followUpQuestionText.textContent = evaluation.followUpQuestion;
      elements.followUpCard.classList.remove("hidden");
    } else {
      elements.followUpCard.classList.add("hidden");
    }

    // Replay spoken button setup
    elements.btnReplayFeedback.onclick = () => {
      if (evaluation.spokenCoachResponse) {
        speechService.speak(evaluation.spokenCoachResponse);
      }
    };

    // Smooth scroll down to feedback section
    elements.feedbackSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --- Voice Selection Setup ---
  function populateVoiceSelect() {
    setTimeout(() => {
      const voices = speechService.getAvailableVoices();
      elements.selectVoice.innerHTML = "";
      voices.forEach(voice => {
        const opt = document.createElement("option");
        opt.value = voice.voiceURI;
        opt.textContent = `${voice.name} (${voice.lang})`;
        if (preferences.speechVoice && voice.voiceURI === preferences.speechVoice) {
          opt.selected = true;
        }
        elements.selectVoice.appendChild(opt);
      });
    }, 600);
  }

  // --- Settings UI Sync ---
  function applyPreferencesToSettingsUI() {
    elements.selectProvider.value = preferences.provider || "builtin";
    elements.inputGeminiKey.value = preferences.geminiKey || "";
    elements.inputOpenaiKey.value = preferences.openaiKey || "";
    elements.inputGroqKey.value = preferences.groqKey || "";
    elements.inputOllamaEndpoint.value = preferences.ollamaEndpoint || "http://localhost:11434/api/generate";
    elements.selectPersona.value = preferences.coachPersona || "constructive";
    elements.selectProficiency.value = preferences.proficiencyLevel || "b2-c1";
    elements.inputSpeechRate.value = preferences.speechRate || 1.0;
    elements.rateValueDisplay.textContent = `${preferences.speechRate || 1.0}x`;
    elements.checkAutoRead.checked = preferences.autoReadFeedback !== false;
    elements.inputSupabaseUrl.value = preferences.supabaseUrl || "";
    elements.inputSupabaseKey.value = preferences.supabaseKey || "";
    updateSupabaseBadge();

    updateProviderFieldVisibility();
  }

  function updateSupabaseBadge() {
    if (preferences.supabaseUrl && preferences.supabaseKey) {
      elements.supabaseStatusBadge.textContent = "Configured";
      elements.supabaseStatusBadge.className = "badge badge-success";
    } else {
      elements.supabaseStatusBadge.textContent = "Not Connected";
      elements.supabaseStatusBadge.className = "badge";
      elements.supabaseStatusBadge.style.background = "rgba(255,255,255,0.06)";
      elements.supabaseStatusBadge.style.color = "var(--text-dim)";
    }
  }

  function updateProviderFieldVisibility() {
    const val = elements.selectProvider.value;
    document.getElementById("group-gemini-key").style.display = val === "gemini" ? "block" : "none";
    document.getElementById("group-openai-key").style.display = val === "openai" ? "block" : "none";
    document.getElementById("group-groq-key").style.display = val === "groq" ? "block" : "none";
    document.getElementById("group-ollama-url").style.display = val === "ollama" ? "block" : "none";
  }

  // --- Render Topics View ---
  function renderTopicsList() {
    const customTopics = StorageManager.getCustomTopics();
    const allTopics = [...SPEAKING_TOPICS, ...customTopics];
    const category = elements.categoryFilter.value;

    elements.topicsGrid.innerHTML = "";
    const filtered = category === "all" ? allTopics : allTopics.filter(t => t.category === category);

    filtered.forEach(topic => {
      const card = document.createElement("div");
      card.className = "topic-card";
      card.innerHTML = `
        <div class="topic-card-header">
          <span class="topic-cat-tag">${escapeHTML(topic.category)}</span>
          <span class="topic-diff-tag">${escapeHTML(topic.difficulty || "All Levels")}</span>
        </div>
        <h3 class="topic-card-title">${escapeHTML(topic.title)}</h3>
        <p class="topic-card-question">"${escapeHTML(topic.question)}"</p>
        <div class="topic-card-footer">
          <button class="btn btn-primary btn-sm btn-practice-topic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Practice This Topic
          </button>
        </div>
      `;

      card.querySelector(".btn-practice-topic").addEventListener("click", () => {
        loadTopic(topic);
        switchTab("practice");
      });

      elements.topicsGrid.appendChild(card);
    });
  }

  // --- Render History View ---
  function renderHistoryList() {
    const sessions = StorageManager.getSessions();
    elements.historyList.innerHTML = "";

    if (sessions.length === 0) {
      elements.historyList.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>No speaking practice sessions recorded yet. Start your first session in the Practice Room!</p>
        </div>
      `;
      return;
    }

    sessions.forEach(sess => {
      const turnCount = sess.turns ? sess.turns.length : 0;
      const lastTurn = sess.turns && sess.turns[sess.turns.length - 1];
      const band = lastTurn?.evaluation?.overallBand || "N/A";

      const card = document.createElement("div");
      card.className = "history-card";
      card.innerHTML = `
        <div class="history-card-header">
          <div>
            <h4 class="history-topic-title">${escapeHTML(sess.topic?.title || "Speaking Session")}</h4>
            <span class="history-date">${new Date(sess.startTime).toLocaleString()}</span>
          </div>
          <span class="badge badge-band">Band ${band}</span>
        </div>
        <p class="history-preview"><strong>Turns Practiced:</strong> ${turnCount} responses</p>
        <div class="history-actions">
          <button class="btn btn-secondary btn-xs btn-review-session">Review Full Session</button>
          <button class="btn btn-outline btn-xs btn-delete-session">Delete</button>
        </div>
        <div class="history-details-container hidden"></div>
      `;

      const detailsContainer = card.querySelector(".history-details-container");
      const btnReview = card.querySelector(".btn-review-session");

      btnReview.addEventListener("click", () => {
        if (detailsContainer.classList.contains("hidden")) {
          detailsContainer.classList.remove("hidden");
          btnReview.textContent = "Hide Details";

          let turnsHTML = `<div class="session-turn-breakdown">`;
          sess.turns.forEach((turn, idx) => {
            turnsHTML += `
              <div class="history-turn-item">
                <h5>Turn ${idx + 1}: ${escapeHTML(turn.question)}</h5>
                <blockquote class="user-quote">"${escapeHTML(turn.transcript)}"</blockquote>
                <div class="turn-eval-summary">
                  <span class="badge badge-success">Score: ${turn.evaluation?.overallBand || "N/A"}</span>
                  <p class="turn-comment">${escapeHTML(turn.evaluation?.summaryComment || "")}</p>
                </div>
              </div>
            `;
          });
          turnsHTML += `</div>`;
          detailsContainer.innerHTML = turnsHTML;
        } else {
          detailsContainer.classList.add("hidden");
          btnReview.textContent = "Review Full Session";
        }
      });

      card.querySelector(".btn-delete-session").addEventListener("click", () => {
        StorageManager.deleteSession(sess.id);
        renderHistoryList();
        showToast("Session removed from history", "info");
      });

      elements.historyList.appendChild(card);
    });
  }

  // --- Export Report ---
  function exportReport() {
    const sessions = StorageManager.getSessions();
    if (sessions.length === 0) {
      showToast("No sessions available to export.", "warning");
      return;
    }

    let markdown = `# AI Speaking Coaching - Student Progress Report\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;

    sessions.forEach((sess, sIdx) => {
      markdown += `## Session ${sIdx + 1}: ${sess.topic?.title || "Speaking Practice"}\n`;
      markdown += `*Date: ${new Date(sess.startTime).toLocaleString()}*\n\n`;

      if (sess.turns) {
        sess.turns.forEach((turn, tIdx) => {
          markdown += `### Question ${tIdx + 1}: ${turn.question}\n`;
          markdown += `**Student's Spoken Answer:**\n> ${turn.transcript}\n\n`;
          if (turn.evaluation) {
            markdown += `**Overall Score:** Band ${turn.evaluation.overallBand || "N/A"}\n\n`;
            markdown += `**Summary:** ${turn.evaluation.summaryComment}\n\n`;
            markdown += `**Grammar Feedback:**\n`;
            if (turn.evaluation.grammarAnalysis?.mistakes) {
              turn.evaluation.grammarAnalysis.mistakes.forEach(m => {
                markdown += `- Said: "${m.original}" ➔ Correct: "${m.corrected}" (${m.rule})\n`;
              });
            }
            markdown += `\n**Idea Development Suggestions:**\n`;
            if (turn.evaluation.ideaDevelopment?.addedIdeas) {
              turn.evaluation.ideaDevelopment.addedIdeas.forEach(idea => {
                markdown += `- ${idea}\n`;
              });
            }
          }
          markdown += `\n---\n\n`;
        });
      }
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Speaking_Coach_Report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Progress report exported successfully!", "success");
  }

  // --- Navigation & Tab Switching ---
  function switchTab(tabId) {
    elements.tabPractice.classList.toggle("active", tabId === "practice");
    elements.tabTopics.classList.toggle("active", tabId === "topics");
    elements.tabHistory.classList.toggle("active", tabId === "history");

    elements.viewPractice.classList.toggle("hidden", tabId !== "practice");
    elements.viewTopics.classList.toggle("hidden", tabId !== "topics");
    elements.viewHistory.classList.toggle("hidden", tabId !== "history");

    if (tabId === "topics") renderTopicsList();
    if (tabId === "history") renderHistoryList();
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Tab switching
    elements.tabPractice.addEventListener("click", () => switchTab("practice"));
    elements.tabTopics.addEventListener("click", () => switchTab("topics"));
    elements.tabHistory.addEventListener("click", () => switchTab("history"));

    // Speak Question
    elements.btnSpeakQuestion.addEventListener("click", () => {
      speechService.speak(currentTopic.question);
    });

    // Change Topic quickly
    elements.btnChangeTopic.addEventListener("click", () => switchTab("topics"));

    // Toggle Mic (Start/Stop Speaking)
    elements.btnToggleMic.addEventListener("click", () => {
      if (speechService.isListening) {
        speechService.stopListening();
      } else {
        speechService.startListening(elements.audioCanvas);
      }
    });

    // Evaluate
    elements.btnSubmitAnswer.addEventListener("click", finishAndEvaluate);

    // Clear transcript
    elements.btnClearTranscript.addEventListener("click", resetTranscript);

    // Toggle Text Input fallback
    elements.btnToggleTextInput.addEventListener("click", () => {
      elements.textInputContainer.classList.toggle("hidden");
    });

    // Textarea sync with transcript
    elements.textInputFallback.addEventListener("input", (e) => {
      const words = e.target.value.trim().split(/\s+/).filter(Boolean);
      elements.wordCountBadge.textContent = `${words.length} words`;
    });

    // Category filter in Topics
    elements.categoryFilter.addEventListener("change", renderTopicsList);

    // Answer Follow-up
    elements.btnAnswerFollowUp.addEventListener("click", () => {
      const followUp = elements.followUpQuestionText.textContent;
      // Set follow-up as the new question for next turn
      currentTopic = {
        ...currentTopic,
        question: followUp,
        title: `Follow-Up: ${currentTopic.title}`
      };
      loadTopic(currentTopic);
      speechService.speak(followUp, {
        onComplete: () => {
          showToast("Now answer the follow-up question!", "info");
        }
      });
    });

    // Next Topic Button in Feedback
    elements.btnNextTopic.addEventListener("click", () => {
      const remaining = SPEAKING_TOPICS.filter(t => t.id !== currentTopic.id);
      const random = remaining[Math.floor(Math.random() * remaining.length)];
      loadTopic(random);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Settings Modal
    elements.btnOpenSettings.addEventListener("click", () => {
      applyPreferencesToSettingsUI();
      elements.settingsModal.classList.remove("hidden");
    });
    elements.btnCloseSettings.addEventListener("click", () => {
      elements.settingsModal.classList.add("hidden");
    });
    elements.selectProvider.addEventListener("change", updateProviderFieldVisibility);
    elements.inputSpeechRate.addEventListener("input", (e) => {
      elements.rateValueDisplay.textContent = `${e.target.value}x`;
    });
    elements.btnSaveSettings.addEventListener("click", () => {
      const updated = {
        provider: elements.selectProvider.value,
        geminiKey: elements.inputGeminiKey.value.trim(),
        openaiKey: elements.inputOpenaiKey.value.trim(),
        groqKey: elements.inputGroqKey.value.trim(),
        ollamaEndpoint: elements.inputOllamaEndpoint.value.trim(),
        coachPersona: elements.selectPersona.value,
        proficiencyLevel: elements.selectProficiency.value,
        speechVoice: elements.selectVoice.value,
        speechRate: parseFloat(elements.inputSpeechRate.value),
        autoReadFeedback: elements.checkAutoRead.checked,
        supabaseUrl: elements.inputSupabaseUrl.value.trim(),
        supabaseKey: elements.inputSupabaseKey.value.trim()
      };
      preferences = StorageManager.savePreferences(updated);
      aiCoach.updatePreferences(preferences);
      speechService.setVoice(preferences.speechVoice);
      if (window.supabaseServiceInstance) {
        window.supabaseServiceInstance.initClient();
      }
      updateSupabaseBadge();
      elements.settingsModal.classList.add("hidden");
      showToast("Coaching preferences saved!", "success");
    });

    // Test Supabase Connection
    elements.btnTestSupabase.addEventListener("click", async () => {
      const url = elements.inputSupabaseUrl.value.trim();
      const key = elements.inputSupabaseKey.value.trim();
      if (!url || !key) {
        showToast("Please enter both Supabase Project URL and Anon Key.", "warning");
        return;
      }
      elements.btnTestSupabase.disabled = true;
      elements.btnTestSupabase.innerHTML = `<span class="spinner"></span> Testing...`;
      try {
        const res = await window.supabaseServiceInstance.testConnection(url, key);
        if (res.success) {
          showToast("Successfully connected to Supabase database!", "success");
          elements.supabaseStatusBadge.textContent = "Connected";
          elements.supabaseStatusBadge.className = "badge badge-success";
        } else {
          showToast("Supabase connection failed: " + res.error, "danger");
        }
      } catch (e) {
        showToast("Connection test error: " + e.message, "danger");
      } finally {
        elements.btnTestSupabase.disabled = false;
        elements.btnTestSupabase.innerHTML = `<span>Test Supabase Connection</span>`;
      }
    });

    // Custom Topic Modal
    elements.btnCustomTopicModal.addEventListener("click", () => {
      elements.customTopicModal.classList.remove("hidden");
    });
    elements.btnCloseCustomTopic.addEventListener("click", () => {
      elements.customTopicModal.classList.add("hidden");
    });
    elements.btnSaveCustomTopic.addEventListener("click", () => {
      const title = elements.inputCustomTitle.value.trim();
      const question = elements.inputCustomQuestion.value.trim();
      const category = elements.inputCustomCategory.value.trim() || "Custom Topic";
      const vocabStr = elements.inputCustomVocab.value.trim();

      if (!title || !question) {
        showToast("Please provide both a topic title and question.", "warning");
        return;
      }

      const newTopic = {
        id: "custom_" + Date.now(),
        title: title,
        category: category,
        question: question,
        difficulty: "Custom",
        keyVocabulary: vocabStr ? vocabStr.split(",").map(s => s.trim()).filter(Boolean) : [],
        ideaStarters: ["Consider the ethical, social, and practical angles."]
      };

      StorageManager.saveCustomTopic(newTopic);
      if (window.supabaseServiceInstance && window.supabaseServiceInstance.isConfigured()) {
        window.supabaseServiceInstance.syncCustomTopic(newTopic);
      }
      elements.customTopicModal.classList.add("hidden");
      elements.inputCustomTitle.value = "";
      elements.inputCustomQuestion.value = "";
      elements.inputCustomVocab.value = "";

      renderTopicsList();
      loadTopic(newTopic);
      switchTab("practice");
      showToast("Custom topic created and ready for practice!", "success");
    });

    // History controls
    elements.btnClearHistory.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire speaking practice history?")) {
        StorageManager.clearAllSessions();
        renderHistoryList();
        showToast("Session history cleared.", "info");
      }
    });
    elements.btnExportReport.addEventListener("click", exportReport);

    // Global keyboard shortcut: Spacebar to toggle mic (when not in textarea/input)
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        elements.btnToggleMic.click();
      }
    });

    // Expose speechService to global window for inline onclick handlers
    window.speechServiceInstance = speechService;
  }

  // --- Utility Toast ---
  function showToast(message, type = "info") {
    elements.toast.textContent = message;
    elements.toast.className = `toast toast-${type} toast-visible`;
    setTimeout(() => {
      elements.toast.className = "toast";
    }, 4000);
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start app
  init();
});
