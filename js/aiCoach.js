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
    const examTrack = context.topic?.examTrack || context.examTrack || "oxford";

    let examInstructions = "";
    if (examTrack === "oxford") {
      examInstructions = `You are Teacher-Examiner AD (Adham), evaluating an international student for the OxfordAQA International GCSE English as a Second Language (9280) Speaking Paper (9280/S).
The OxfordAQA exam is marked out of 40 marks total:
- Part 1: Photo Card (15 marks) - 3 card questions + 2 unseen questions.
- Part 2: General Conversation (25 marks) - across the official syllabus themes.
Assessment Criteria to evaluate:
1. Communication (Level 1–5): Did the candidate answer all prompts, provide extended responses, justify opinions with reasons, and interact spontaneously?
2. Knowledge and Use of Language (Level 1–5): Range of vocabulary and accurate use of complex sentence structures (subordinate clauses, conditionals, passive voice, discourse markers).
3. Pronunciation & Intonation (Level 1–5): Intelligibility, accurate stress, natural cadence.
In your JSON, include "oxfordExamDetails": {
  "totalMark": 34,
  "maxMarks": 40,
  "partMark": "13 / 15",
  "predictedGrade": "Grade 8",
  "communicationLevel": "Level 4 (Clear opinions justified with reasons)",
  "languageLevel": "Level 4 (Good range of complex subordinate clauses)",
  "complexStructuresIdentified": ["list of complex structures used like subordinate clauses with 'although', conditionals, etc."]
}`;
    } else if (examTrack === "cambridge") {
      examInstructions = `You are evaluating a student for Cambridge IGCSE ESL (0510 / 0511) Speaking Component (Total 30 Marks).
Assess across Structure (10 marks), Vocabulary (10 marks), and Fluency (10 marks).`;
    } else if (examTrack === "ielts") {
      examInstructions = `You are an official IELTS Speaking Examiner. Evaluate across Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation (Bands 1.0 to 9.0).`;
    } else if (examTrack === "toefl") {
      examInstructions = `You are a certified TOEFL iBT Speaking Rater. Evaluate across Delivery, Language Use, and Topic Development (Total 0–30 scaled score).`;
    }

    let personaStyle = "supportive, clear, and academically rigorous";
    if (persona === "academic") personaStyle = "academically rigorous, analytical, emphasizing precision and intellectual depth";
    if (persona === "executive") personaStyle = "concise, punchy, focused on executive presence, brevity, and persuasive impact";
    if (persona === "socratic") personaStyle = "philosophical and probing, continually challenging premises and assumptions";

    return `You are Teacher-Examiner AD (Adham), an elite international speaking examiner and coach.
Your persona is: ${personaStyle}.
Target proficiency level: ${level.toUpperCase()}.
Current Exam Track: ${examTrack.toUpperCase()}.

${examInstructions}

Your mission:
1. Pinpoint exact grammar mistakes in the student's spoken utterance, providing crystal-clear corrections and the underlying rule.
2. Provide pronunciation & delivery guidance (flag tricky words, phonetic guides, pacing, and filler word consciousness).
3. Evaluate content relevance and elevate the student's vocabulary with sophisticated collocations.
4. CRITICAL FOR OXFORDAQA / EXAMS: Evaluate IDEA DEVELOPMENT & OPINION JUSTIFICATION. Show the student how to justify opinions and add subordinate clauses.
5. Provide a natural spoken response summary from Teacher-Examiner AD followed by an engaging follow-up question.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with pure, valid JSON (no markdown fence, no backticks, no explanatory text outside the JSON) matching this exact schema:
{
  "overallBand": 7.5,
  "oxfordGrade": "Grade 8 (33/40 Marks)",
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
    "depthCritique": "Critique on the depth, opinion justification, and logic of their arguments.",
    "addedIdeas": [
      "Novel perspective or counterargument 1",
      "Concrete real-world example or impact angle 2"
    ],
    "sampleExpandedResponse": "A refined model answer (2-3 sentences) showing how their thought can be beautifully expressed with subordinate clauses."
  },
  "followUpQuestion": "An engaging follow-up question directly building on what they said.",
  "spokenCoachResponse": "Warm, natural spoken feedback from Teacher-Examiner AD. Keep it to 2-3 conversational sentences highlighting their strength, 1 key correction, and the next question."
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

    // OxfordAQA Level and Mark Calculations
    const subordinateConjunctions = ["although", "because", "since", "while", "whereas", "if", "unless", "so that", "in order to", "even though"];
    const foundSubordinates = subordinateConjunctions.filter(w => text.toLowerCase().includes(w));

    let oxfordCommLevel = wordCount > 70 ? 5 : wordCount > 40 ? 4 : wordCount > 20 ? 3 : 2;
    let oxfordLangLevel = foundSubordinates.length >= 2 ? 5 : foundSubordinates.length >= 1 ? 4 : mistakes.length <= 1 ? 3 : 2;
    let oxfordPronLevel = detectedFillers.length === 0 ? 5 : detectedFillers.length <= 2 ? 4 : 3;

    const isPart1 = context.topic.part === "part1";
    let part1Mark = Math.min(15, Math.round((oxfordCommLevel * 2) + oxfordLangLevel));
    let part2Mark = Math.min(25, Math.round((oxfordCommLevel * 2) + (oxfordLangLevel * 2) + oxfordPronLevel));
    let totalOxfordMark = isPart1 ? Math.min(40, Math.round(part1Mark * 2.66)) : Math.min(40, Math.round(part2Mark * 1.6));

    let predictedGrade = "Grade 9";
    if (totalOxfordMark < 16) predictedGrade = "Grade 4";
    else if (totalOxfordMark < 20) predictedGrade = "Grade 5";
    else if (totalOxfordMark < 24) predictedGrade = "Grade 6";
    else if (totalOxfordMark < 28) predictedGrade = "Grade 7";
    else if (totalOxfordMark < 33) predictedGrade = "Grade 8";
    else predictedGrade = "Grade 9";

    const isOxford = (context.topic.examTrack === "oxford" || !context.topic.examTrack);

    return {
      overallBand: overallBand,
      oxfordGrade: `${predictedGrade} (${isPart1 ? part1Mark + '/15 marks' : part2Mark + '/25 marks'} • ${totalOxfordMark}/40 Total)`,
      oxfordAssessment: {
        totalMarks: totalOxfordMark,
        partMarks: isPart1 ? `${part1Mark} / 15` : `${part2Mark} / 25`,
        predictedGrade: predictedGrade,
        communicationLevel: `Level ${oxfordCommLevel}`,
        languageLevel: `Level ${oxfordLangLevel}`,
        subordinatesFound: foundSubordinates.length > 0 ? foundSubordinates : ["None detected. Add 'although', 'whereas', or 'because' to achieve Level 5."]
      },
      summaryComment: isOxford 
        ? `OxfordAQA 9280 Spoken Response: Predicted ${predictedGrade}. Coherent delivery with ${wordCount} words and ${foundSubordinates.length} complex subordinate structures.`
        : `Coherent, responsive delivery with an estimated ${wordCount} spoken words. Good conversational spontaneity.`,
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
        relevance: `Directly engages with the OxfordAQA topic: "${context.topic.title}".`,
        betterVocabulary: betterVocabulary
      },
      ideaDevelopment: {
        score: parseFloat(ideaScore.toFixed(1)),
        depthCritique: isOxford 
          ? "OxfordAQA Examiner Tip: To secure Level 5 in Communication, always back every claim with a concrete reason ('because of this...') and justify contrasting perspectives."
          : "You introduced a clear position. Elevating your thought with structured justification (Claim + Evidence + Counter-balance) will make your response significantly more persuasive.",
        addedIdeas: addedIdeas,
        sampleExpandedResponse: `While one might initially assume that ${context.topic.title.toLowerCase()} presents straightforward dilemmas, a closer inspection reveals nuanced socio-economic trade-offs that demand calibrated, evidence-based policy solutions.`
      },
      followUpQuestion: followUp,
      spokenCoachResponse: spokenFeedback
    };
  }
}
