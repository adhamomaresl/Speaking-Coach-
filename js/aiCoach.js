/**
 * aiCoach.js - Multi-provider AI evaluator and coaching intelligence
 * Supports Google Gemini, OpenAI, Groq, Ollama, and Built-in Heuristic Evaluator
 */
class AICoach {
  constructor(preferences = {}) {
    this.preferences = preferences;
  }

  updatePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }

  /**
   * Main evaluation entry point
   * @param {Object} context - { topic, studentTranscript, conversationHistory }
   */
  async evaluateResponse(context) {
    const provider = this.preferences.provider || "builtin";

    try {
      if (provider === "gemini" && this.preferences.geminiKey) {
        return await this.evaluateWithGemini(context);
      } else if (provider === "openai" && this.preferences.openaiKey) {
        return await this.evaluateWithOpenAI(context);
      } else if (provider === "groq" && this.preferences.groqKey) {
        return await this.evaluateWithGroq(context);
      } else if (provider === "ollama") {
        return await this.evaluateWithOllama(context);
      } else {
        // Fallback to built-in intelligent coach evaluator
        return this.evaluateWithBuiltinCoach(context);
      }
    } catch (err) {
      console.error(`AI evaluation with ${provider} failed, falling back to built-in coach:`, err);
      const fallbackResult = this.evaluateWithBuiltinCoach(context);
      fallbackResult.fallbackNotice = `Note: Cloud AI request encountered an issue (${err.message}). Evaluated using Built-in Expert Engine.`;
      return fallbackResult;
    }
  }

  getSystemPrompt(context) {
    const persona = this.preferences.coachPersona || "constructive";
    const level = this.preferences.proficiencyLevel || "b2-c1";

    let personaStyle = "supportive, clear, and encouraging";
    if (persona === "academic") personaStyle = "academically rigorous, analytical, emphasizing precision and intellectual depth";
    if (persona === "executive") personaStyle = "concise, punchy, focused on executive presence, brevity, and persuasive impact";
    if (persona === "socratic") personaStyle = "philosophical and probing, continually challenging premises and assumptions";

    return `You are an elite, world-class Speaking Coach AI specializing in spoken English mastery, confidence building, and idea development.
Your persona is: ${personaStyle}.
Target student proficiency level: ${level.toUpperCase()}.

Unlike a standardized exam simulator (like IELTS or TOEFL) which only gives static grades, you act as an interactive live mentor. Your mission is to:
1. Pinpoint exact grammar mistakes in the student's spoken utterance, providing crystal-clear corrections and the underlying rule.
2. Provide pronunciation & delivery guidance (flag tricky words, phonetic guides, pacing, and filler word consciousness).
3. Evaluate content relevance and elevate the student's vocabulary with sophisticated collocations.
4. CRITICAL: Provide IDEA DEVELOPMENT & THOUGHT EXPANSION. Suggest 2-3 novel angles, concrete examples, or counterarguments the student can use to make their response much deeper and more compelling.
5. Provide a natural spoken response summary (what the AI coach would say out loud in 2-3 sentences to the student) followed by an engaging follow-up question to keep the conversation flowing.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with pure, valid JSON (no markdown fence, no backticks, no explanatory text outside the JSON) matching this exact schema:
{
  "overallBand": 7.5,
  "summaryComment": "Brief encouraging summary of their spoken delivery.",
  "grammarAnalysis": {
    "score": 7.0,
    "mistakes": [
      {
        "original": "exact snippet where error occurred",
        "corrected": "clean grammatical replacement",
        "rule": "concise explanation of the grammar rule"
      }
    ]
  },
  "pronunciationAndDelivery": {
    "score": 8.0,
    "paceEvaluation": "Feedback on pace, pauses, or flow",
    "fillerWordsDetected": ["list", "of", "detected", "fillers"],
    "phoneticTips": [
      {
        "word": "wordName",
        "phonetic": "/IPA/",
        "tip": "How to position tongue/stress syllables"
      }
    ],
    "intonationAdvice": "Specific suggestion on vocal pitch and conviction."
  },
  "contentAndStructure": {
    "score": 7.5,
    "relevance": "How well did the student answer the question?",
    "betterVocabulary": [
      {
        "basic": "simple word student used or could upgrade",
        "advanced": "rich academic or idiomatic alternative",
        "contextSentence": "Example sentence using the advanced term"
      }
    ]
  },
  "ideaDevelopment": {
    "score": 7.0,
    "depthCritique": "Critique on the depth and logic of their arguments.",
    "addedIdeas": [
      "Novel perspective or counterargument 1",
      "Concrete real-world example or impact angle 2"
    ],
    "sampleExpandedResponse": "A refined, C2-level model answer (2-3 sentences) showing how their thought can be beautifully expressed."
  },
  "followUpQuestion": "An engaging, thoughtful follow-up question directly building on what they just said.",
  "spokenCoachResponse": "Warm, natural spoken feedback to be read aloud by TTS. Keep it to 2-3 conversational sentences highlighting their strength, 1 key correction, and the follow-up question."
}`;
  }

  async transcribeAudio(audioBlob) {
    // 1. Try Groq Whisper if Groq key exists
    if (this.preferences.groqKey) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.webm");
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "json");

        const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${this.preferences.groqKey.trim()}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text) return data.text.trim();
        }
      } catch (e) {
        console.warn("Groq Whisper transcription failed:", e);
      }
    }

    // 2. Try OpenAI Whisper if OpenAI key exists
    if (this.preferences.openaiKey) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.webm");
        formData.append("model", "whisper-1");

        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${this.preferences.openaiKey.trim()}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text) return data.text.trim();
        }
      } catch (e) {
        console.warn("OpenAI Whisper transcription failed:", e);
      }
    }

    return null;
  }

  // --- Gemini API ---
  async evaluateWithGemini(context) {
    const key = this.preferences.geminiKey.trim();
    const systemPrompt = this.getSystemPrompt(context);
    const userPrompt = `Topic Question: "${context.topic.question}"\nTopic Category: ${context.topic.category}\nStudent's Spoken Answer:\n"${context.studentTranscript || "Please listen to the attached audio"}"\n\nAnalyze and coach this student according to the JSON schema.`;

    const parts = [{ text: `${systemPrompt}\n\n${userPrompt}` }];

    if (context.audioBase64) {
      parts.push({
        inlineData: {
          mimeType: context.audioMimeType || "audio/webm",
          data: context.audioBase64
        }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    return this.cleanAndParseJSON(rawText);
  }

  // --- OpenAI API ---
  async evaluateWithOpenAI(context) {
    const key = this.preferences.openaiKey.trim();
    const systemPrompt = this.getSystemPrompt(context);
    const userPrompt = `Topic Question: "${context.topic.question}"\nTopic Category: ${context.topic.category}\nStudent's Spoken Answer:\n"${context.studentTranscript}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    return this.cleanAndParseJSON(rawText);
  }

  // --- Groq API ---
  async evaluateWithGroq(context) {
    const key = this.preferences.groqKey.trim();
    const systemPrompt = this.getSystemPrompt(context);
    const userPrompt = `Topic Question: "${context.topic.question}"\nTopic Category: ${context.topic.category}\nStudent's Spoken Answer:\n"${context.studentTranscript}"`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    return this.cleanAndParseJSON(rawText);
  }

  // --- Ollama Local API ---
  async evaluateWithOllama(context) {
    const endpoint = this.preferences.ollamaEndpoint || "http://localhost:11434/api/generate";
    const systemPrompt = this.getSystemPrompt(context);
    const prompt = `${systemPrompt}\n\nTopic Question: "${context.topic.question}"\nStudent Answer: "${context.studentTranscript}"\nRespond ONLY in valid JSON.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return this.cleanAndParseJSON(data.response);
  }

  cleanAndParseJSON(rawText) {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleaned);
  }

  /**
   * Built-in Heuristic Evaluator
   * Provides immediate, rich coaching feedback without requiring an external API key.
   */
  evaluateWithBuiltinCoach(context) {
    const text = context.studentTranscript.trim();
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect common grammar mistakes
    const mistakes = [];
    const grammarPatterns = [
      { regex: /\b(he|she|it)\s+don't\b/i, original: "he/she/it don't", corrected: "doesn't", rule: "Third-person singular pronouns take 'doesn't', not 'don't'." },
      { regex: /\bmore\s+(better|faster|harder|easier)\b/i, original: "more + comparative", corrected: "remove 'more'", rule: "Double comparatives: do not use 'more' before an adjective already ending in '-er'." },
      { regex: /\b(explain|said)\s+me\b/i, original: "explain me", corrected: "explain to me", rule: "The verb 'explain' requires the preposition 'to' before an indirect object." },
      { regex: /\bi\s+am\s+agree\b/i, original: "I am agree", corrected: "I agree", rule: "'Agree' is a verb on its own. Use 'I agree', not 'I am agree'." },
      { regex: /\bmuch\s+(people|students|things|problems)\b/i, original: "much with countable nouns", corrected: "many / a lot of", rule: "Use 'many' or 'a number of' with plural countable nouns; 'much' is reserved for uncountable quantities." },
      { regex: /\bless\s+(people|students|things|problems)\b/i, original: "less with countable nouns", corrected: "fewer", rule: "Traditional grammar prescribes 'fewer' for countable items and 'less' for bulk quantities." },
      { regex: /\bthe\s+reason\s+is\s+because\b/i, original: "the reason is because", corrected: "the reason is that", rule: "'The reason is because' is redundant; prefer 'the reason is that'." },
      { regex: /\bin\s+my\s+point\s+of\s+view\b/i, original: "in my point of view", corrected: "from my point of view / in my view", rule: "The standard idioms are 'from my point of view' or 'in my view'." }
    ];

    grammarPatterns.forEach(pattern => {
      const match = text.match(pattern.regex);
      if (match) {
        mistakes.push({
          original: match[0],
          corrected: pattern.corrected,
          rule: pattern.rule
        });
      }
    });

    // Detect filler words
    const fillerCandidates = ["um", "uh", "er", "like", "you know", "basically", "actually", "sort of", "kind of"];
    const detectedFillers = [];
    fillerCandidates.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        detectedFillers.push(`${filler} (${matches.length}x)`);
      }
    });

    // Calculate lexical variety
    const uniqueWords = new Set(words);
    const lexicalDiversity = wordCount > 0 ? (uniqueWords.size / wordCount) : 0;

    // Advanced vocabulary suggestions
    const betterVocabulary = [];
    const vocabUpgrades = [
      { target: "good", advanced: "commendable / exemplary", context: "This approach delivers commendable results in productivity." },
      { target: "bad", advanced: "detrimental / adverse", context: "Excessive screen time produces adverse cognitive effects." },
      { target: "big", advanced: "substantial / paramount", context: "A paramount factor in educational equity is resource allocation." },
      { target: "important", advanced: "crucial / indispensable", context: "Digital literacy is indispensable in contemporary discourse." },
      { target: "think", advanced: "contend / posit", context: "Many sociologists contend that rapid urban shifts alter community bonds." },
      { target: "a lot of", advanced: "a plethora of / an abundance of", context: "Modern students navigate a plethora of contradictory information sources." },
      { target: "problem", advanced: "predicament / bottleneck", context: "Supply chain disruptions created a severe bottleneck for sustainable manufacturers." }
    ];

    vocabUpgrades.forEach(u => {
      if (text.toLowerCase().includes(u.target) && betterVocabulary.length < 3) {
        betterVocabulary.push({
          basic: u.target,
          advanced: u.advanced,
          contextSentence: u.context
        });
      }
    });

    if (betterVocabulary.length === 0) {
      betterVocabulary.push({
        basic: "help",
        advanced: "facilitate / bolster",
        contextSentence: "Proactive mentorship can bolster long-term learner retention."
      });
    }

    // Phonetic & Pronunciation tips for words used or relevant to topic
    const phoneticTips = [];
    const candidatePhonetics = [
      { word: "pedagogical", phonetic: "/ˌped.əˈɡɑː.dʒɪ.kəl/", tip: "Primary stress falls on the third syllable: ped-a-GAW-ji-kal." },
      { word: "technology", phonetic: "/tekˈnɑː.lə.dʒi/", tip: "Notice the stress on the second syllable: tek-NAW-luh-jee." },
      { word: "development", phonetic: "/dɪˈvel.əp.mənt/", tip: "Avoid stressing 'dev-'; place the main emphasis on '-vel-'." },
      { word: "consequences", phonetic: "/ˈkɑːn.sə.kwen.səz/", tip: "Crisp first syllable stress: CON-suh-kwen-sez." },
      { word: "environment", phonetic: "/ɪnˈvaɪ.rən.mənt/", tip: "Don't skip the 'n' in '-vi-ron-': en-VY-run-ment." }
    ];

    candidatePhonetics.forEach(p => {
      if (text.toLowerCase().includes(p.word) || (context.topic.keyVocabulary && context.topic.keyVocabulary.includes(p.word))) {
        if (phoneticTips.length < 2) phoneticTips.push(p);
      }
    });

    if (phoneticTips.length === 0) {
      phoneticTips.push(candidatePhonetics[0]);
    }

    // Calculate score heuristics
    let grammarScore = 8.0 - (mistakes.length * 0.8);
    if (grammarScore < 5.0) grammarScore = 5.0;

    let pronunciationScore = 8.0 - (detectedFillers.length * 0.3);
    if (pronunciationScore < 5.5) pronunciationScore = 5.5;

    let contentScore = wordCount > 70 ? 8.0 : wordCount > 35 ? 7.0 : 6.0;
    let ideaScore = lexicalDiversity > 0.65 ? 8.0 : 7.0;

    const overallBand = parseFloat(((grammarScore + pronunciationScore + contentScore + ideaScore) / 4).toFixed(1));

    // Idea development expansion
    const topicIdeaStarters = context.topic.ideaStarters || [
      "Consider the long-term societal implications rather than just immediate effects.",
      "Explore the economic incentives driving both sides of this argument.",
      "Ground your observation with an empirical or personal case study."
    ];

    const addedIdeas = [
      `Deepen the perspective: ${topicIdeaStarters[0]}`,
      `Counterargument angle: Consider how an opposing stakeholder would respond to your claim.`
    ];

    if (topicIdeaStarters[1]) {
      addedIdeas.push(`Structural expansion: ${topicIdeaStarters[1]}`);
    }

    const followUpQuestions = [
      "How would you address critics who argue that this approach is economically impractical?",
      "Can you illustrate that point with a concrete real-world example you have observed?",
      "If you had to formulate a nationwide policy regarding this, what would be your first legislative priority?"
    ];
    const followUp = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];

    const spokenFeedback = mistakes.length > 0
      ? `Well done! Your response was clear. Keep an eye on phrasing: instead of saying "${mistakes[0].original}", remember to use "${mistakes[0].corrected}". To take your idea further, consider how opposing stakeholders would view this. Now, ${followUp}`
      : `Outstanding work! You expressed your thoughts with confidence and good flow. To elevate your depth even further, consider the broader systemic implications. Now, ${followUp}`;

    return {
      overallBand: overallBand,
      summaryComment: `Coherent, responsive delivery with an estimated ${wordCount} spoken words. Good conversational spontaneity.`,
      grammarAnalysis: {
        score: parseFloat(grammarScore.toFixed(1)),
        mistakes: mistakes.length > 0 ? mistakes : [
          {
            original: "No critical structural errors found",
            corrected: "Natural sentence construction",
            rule: "Maintain this clean syntactic cadence while testing more complex compound-complex clauses."
          }
        ]
      },
      pronunciationAndDelivery: {
        score: parseFloat(pronunciationScore.toFixed(1)),
        paceEvaluation: wordCount > 60 ? "Balanced speaking rate with natural thought groupings." : "Slightly brief; encourage longer sustained elaboration.",
        fillerWordsDetected: detectedFillers.length > 0 ? detectedFillers : ["None detected! Outstanding fluency."],
        phoneticTips: phoneticTips,
        intonationAdvice: "Keep downward pitch for decisive final points and slight upward inflection when introducing open alternatives."
      },
      contentAndStructure: {
        score: parseFloat(contentScore.toFixed(1)),
        relevance: `Directly engages with the topic: "${context.topic.title}".`,
        betterVocabulary: betterVocabulary
      },
      ideaDevelopment: {
        score: parseFloat(ideaScore.toFixed(1)),
        depthCritique: "You introduced a clear position. Elevating your thought with structured justification (Claim + Evidence + Counter-balance) will make your response significantly more persuasive.",
        addedIdeas: addedIdeas,
        sampleExpandedResponse: `While one might initially assume that ${context.topic.title.toLowerCase()} presents straightforward dilemmas, a closer inspection reveals nuanced socio-economic trade-offs that demand calibrated, evidence-based policy solutions.`
      },
      followUpQuestion: followUp,
      spokenCoachResponse: spokenFeedback
    };
  }
}
