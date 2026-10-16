/**
 * topics.js - Multi-Track Speaking Exam System
 * Specializing in OxfordAQA International GCSE ESL (9280 / 9280/S),
 * Cambridge IGCSE ESL (0510/0511), IELTS Academic & General, and TOEFL iBT.
 */

const EXAM_TRACKS = {
  oxford: {
    id: "oxford",
    name: "OxfordAQA ESL (9280)",
    shortName: "OxfordAQA 9280",
    fullName: "OxfordAQA International GCSE English as a Second Language",
    subjectCode: "9280 / Paper 4 (9280/S)",
    badge: "Paper 4 Speaking • 40 Marks",
    flag: "🇬🇧",
    totalMarks: 40,
    duration: "Approx. 10 minutes (+10 min preparation)",
    gradingScale: "GCSE 9 to 1 Grading",
    overview: "The OxfordAQA 9280 Speaking test is conducted by a teacher-examiner and evaluated out of 40 marks across two compulsory parts. The assessment focuses heavily on authentic communicative interaction, ability to express and justify opinions, and accurate use of complex language structures.",
    parts: [
      {
        id: "part1",
        title: "Part 1: Photo Card",
        marks: 15,
        duration: "3–4 minutes",
        description: "Candidate receives a photo card based on one theme with 10 minutes of supervised preparation. The teacher-examiner asks 3 prescribed questions from the card followed by 2 unseen questions to test spontaneous response."
      },
      {
        id: "part2",
        title: "Part 2: General Conversation",
        marks: 25,
        duration: "6–7 minutes",
        description: "Natural, interactive conversation covering the two remaining course themes not covered in Part 1. Tests fluency, extended reasoning, and spontaneous conversational flow."
      }
    ],
    themes: [
      {
        name: "Theme 1: Identity and Culture",
        subtopics: ["Family and friends", "Youth culture and lifestyle", "Free-time activities, sports, hobbies", "Customs, celebrations, and traditions"]
      },
      {
        name: "Theme 2: Local, National and Global Areas of Interest",
        subtopics: ["Travel and tourism", "Environmental responsibility and sustainability", "Technology and modern media", "Community and social initiatives"]
      },
      {
        name: "Theme 3: Current and Future Study and Employment",
        subtopics: ["School life and educational experiences", "Future academic plans", "Career ambitions and employment skills", "Impact of technology in the workplace"]
      }
    ],
    criteriaBands: {
      communication: [
        { level: "Level 5", marks: "9–10 marks", desc: "Consistently clear, relevant, and fully developed responses. Expresses and justifies points of view with convincing evidence. Highly spontaneous with active, natural interaction." },
        { level: "Level 4", marks: "7–8 marks", desc: "Clear and relevant responses with good development. Expresses opinions and justifies them effectively. Good spontaneity and engagement with the examiner." },
        { level: "Level 3", marks: "5–6 marks", desc: "Mostly clear communication. Answers questions with reasonable detail. Opinions are expressed and some justification given. Satisfactory interaction." },
        { level: "Level 2", marks: "3–4 marks", desc: "Communication is sometimes hesitant or incomplete. Conveys basic information; limited opinions with little justification. Relies on teacher prompting." },
        { level: "Level 1", marks: "1–2 marks", desc: "Very limited communication. Short, disjointed, or isolated words/phrases. Difficulty conveying meaning even with repeated prompting." }
      ],
      language: [
        { level: "Level 5", marks: "9–10 marks (Part 2) / 5 marks (Part 1)", desc: "Very good range of vocabulary and complex structures (subordinate clauses, conditionals, passive voice). High degree of grammatical accuracy; errors are minor and non-intrusive." },
        { level: "Level 4", marks: "7–8 marks (Part 2) / 4 marks (Part 1)", desc: "Good range of vocabulary and complex sentence structures attempted successfully. Generally accurate with good control of basic and intermediate grammar." },
        { level: "Level 3", marks: "5–6 marks (Part 2) / 3 marks (Part 1)", desc: "Reasonable vocabulary and control of simple sentences with some attempts at compound and subordinate structures. More accurate than inaccurate." },
        { level: "Level 2", marks: "3–4 marks (Part 2) / 2 marks (Part 1)", desc: "Limited vocabulary; basic, repetitive sentence structures. Frequent grammatical inaccuracies that sometimes impede clarity." },
        { level: "Level 1", marks: "1–2 marks (Part 2) / 1 mark (Part 1)", desc: "Very restricted vocabulary and grammar. Persistent errors impede understanding throughout." }
      ],
      pronunciation: [
        { level: "Level 5", marks: "5 marks", desc: "Consistently clear pronunciation, natural stress, and expressive intonation. Exceptionally easy to understand." },
        { level: "Level 4", marks: "4 marks", desc: "Clear pronunciation and intonation. Occasional mother-tongue influence does not impede comprehension." },
        { level: "Level 3", marks: "3 marks", desc: "Generally intelligible. Noticeable foreign accent or hesitation, but rarely hinders communication." },
        { level: "Level 2", marks: "2 marks", desc: "Pronunciation errors sometimes cause ambiguity or require listener effort." },
        { level: "Level 1", marks: "1 mark", desc: "Pronunciation severely impedes understanding throughout." }
      ]
    }
  },

  cambridge: {
    id: "cambridge",
    name: "Cambridge IGCSE ESL",
    shortName: "Cambridge 0510/0511",
    fullName: "Cambridge IGCSE English as a Second Language (0510 / 0511)",
    subjectCode: "0510 / 0511 Component 5",
    badge: "Speaking Assessment • 30 Marks",
    flag: "🎓",
    totalMarks: 30,
    duration: "Approx. 10–15 minutes",
    gradingScale: "Cambridge Grades A* to G / 9 to 1",
    overview: "Candidates participate in a structured four-part interview consisting of a welcome, warm-up, candidate card preparation, and formal speaking topic discussion evaluated across Structure, Vocabulary, and Fluency (each out of 10 marks).",
    criteriaBands: {
      structure: [{ level: "Band 5 (9-10)", desc: "Controlled, varied, and sophisticated sentence structures with high grammatical accuracy." }],
      vocabulary: [{ level: "Band 5 (9-10)", desc: "Wide and precise lexical range, including precise collocations and idiomatic phrasing." }],
      fluency: [{ level: "Band 5 (9-10)", desc: "Spontaneous, natural conversational pacing with clear articulation and intonation." }]
    }
  },

  ielts: {
    id: "ielts",
    name: "IELTS Speaking",
    shortName: "IELTS Speaking",
    fullName: "International English Language Testing System (IELTS)",
    subjectCode: "IELTS Academic & General Training",
    badge: "Standardized Bands 1.0–9.0",
    flag: "🌐",
    totalMarks: 9,
    duration: "11–14 minutes",
    gradingScale: "Bands 1.0 to 9.0",
    overview: "A face-to-face 3-part assessment covering Part 1 (Introduction & Interview), Part 2 (Individual Long Turn / Cue Card with 1-min prep), and Part 3 (Two-way abstract discussion). Assessed across 4 criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.",
    criteriaBands: {
      fc: [{ level: "Band 8-9", desc: "Speaks fluently with only rare repetition or self-correction; develops topics coherently." }],
      lr: [{ level: "Band 8-9", desc: "Uses wide vocabulary resource flexibly and precisely to convey subtle meanings." }],
      gra: [{ level: "Band 8-9", desc: "Uses wide range of complex structures flexibly; produces majority of error-free sentences." }],
      pron: [{ level: "Band 8-9", desc: "Uses wide range of pronunciation features with precision and subtlety." }]
    }
  },

  toefl: {
    id: "toefl",
    name: "TOEFL iBT Speaking",
    shortName: "TOEFL iBT",
    fullName: "Test of English as a Foreign Language (TOEFL iBT)",
    subjectCode: "TOEFL iBT Speaking Section",
    badge: "Score Range 0–30",
    flag: "🇺🇸",
    totalMarks: 30,
    duration: "Approx. 17 minutes (4 Tasks)",
    gradingScale: "Score 0 to 30",
    overview: "Computer-delivered assessment featuring 1 Independent task (personal opinion with 15s prep / 45s response) and 3 Integrated tasks (reading/listening synthesis). Evaluated across Delivery, Language Use, and Topic Development.",
    criteriaBands: {
      delivery: [{ level: "Score 4 (Top)", desc: "Fluid, clear speech with good rhythm and intonation; highly intelligible." }],
      languageUse: [{ level: "Score 4 (Top)", desc: "Effective use of complex syntactic structures and wide, sophisticated vocabulary." }],
      topicDev: [{ level: "Score 4 (Top)", desc: "Answers question fully; details are well-organized, coherent, and fully elaborated." }]
    }
  }
};

const SPEAKING_TOPICS = [
  // =========================================================================
  // OXFORDAQA 9280 TASKS (Part 1 Photo Cards & Part 2 General Conversations)
  // =========================================================================
  {
    id: "oxford-pc-1",
    examTrack: "oxford",
    part: "part1",
    partName: "Part 1: Photo Card A",
    theme: "Theme 1: Identity and Culture",
    category: "Identity & Education",
    title: "Collaborative Study & Digital Learning",
    image: "assets/oxford_photocard_1.jpg",
    difficulty: "OxfordAQA 9280/S Core",
    prepTimeSeconds: 60, // 1 min quick prep or 10 min official
    question: "Question 1: What can you see in this photo?",
    prescribedQuestions: [
      "1. What can you see in this photo?",
      "2. What are the advantages of studying together in a group compared to studying alone?",
      "3. Do you think technology makes schoolwork easier or more challenging for students? Explain your opinion."
    ],
    unseenQuestions: [
      "4. How do you usually balance your academic studies with your free-time activities?",
      "5. Tell me about a school project or task you completed recently that you felt proud of."
    ],
    guidance: "OxfordAQA Examiner Tip: Start with a detailed visual description of the people, setting, and laptops. Then give clear opinions and justify them with reasons using subordinate clauses ('although', 'whereas', 'because').",
    keyVocabulary: ["collaborative learning", "peer interaction", "academic engagement", "digital resources", "information synthesis"],
    ideaStarters: [
      "Active group discussions vs. passive memorization",
      "How digital tablets and laptops streamline joint research",
      "Balancing social camaraderie with academic productivity"
    ]
  },
  {
    id: "oxford-pc-2",
    examTrack: "oxford",
    part: "part1",
    partName: "Part 1: Photo Card B",
    theme: "Theme 2: Local, National and Global Areas of Interest",
    category: "Environment & Community",
    title: "Youth Community Tree-Planting & Green Transit",
    image: "assets/oxford_photocard_2.jpg",
    difficulty: "OxfordAQA 9280/S Core",
    prepTimeSeconds: 60,
    question: "Question 1: Describe what the young people are doing in this photo.",
    prescribedQuestions: [
      "1. Describe what the young people are doing in this photo.",
      "2. Why is it important for young people to participate in environmental activities in their local area?",
      "3. Some people believe that individuals cannot make a significant difference to climate change. What is your view?"
    ],
    unseenQuestions: [
      "4. What environmental initiatives take place in your own school or community?",
      "5. If you were the leader of your city, what green transportation measure would you introduce first?"
    ],
    guidance: "OxfordAQA Examiner Tip: Describe the actions, tools, and background elements (solar panels, e-bikes). Connect local volunteerism to global sustainability, stating your personal stance clearly.",
    keyVocabulary: ["civic responsibility", "environmental stewardship", "reforestation", "renewable energy", "collective efficacy"],
    ideaStarters: [
      "Community tree-planting fostering civic pride and biodiversity",
      "Solar panels and electric bicycles as tangible climate solutions",
      "Individual consumer habits vs. corporate and legislative action"
    ]
  },
  {
    id: "oxford-gc-1",
    examTrack: "oxford",
    part: "part2",
    partName: "Part 2: General Conversation",
    theme: "Theme 1: Identity and Culture",
    category: "Identity & Culture",
    title: "Traditions, Family Bonds & Youth Leisure",
    difficulty: "OxfordAQA 9280/S",
    question: "How have modern technology and social media influenced the way teenagers spend their free time with family and friends today compared to previous generations?",
    guidance: "OxfordAQA Part 2 Tip: Maintain spontaneous interaction with Teacher-Examiner AD. Express multiple viewpoints, develop your arguments with personal anecdotes, and use varied sentence connectors.",
    keyVocabulary: ["generational divide", "digital recreation", "interpersonal bonds", "cultural heritage", "screen time"],
    ideaStarters: [
      "Online multiplayer games replacing traditional board games",
      "Maintaining long-distance friendships through messaging apps",
      "The value of preserving traditional family mealtime conversations"
    ]
  },
  {
    id: "oxford-gc-2",
    examTrack: "oxford",
    part: "part2",
    partName: "Part 2: General Conversation",
    theme: "Theme 3: Current and Future Study and Employment",
    category: "Study & Future Careers",
    title: "University Ambitions & Future Career Skills",
    difficulty: "OxfordAQA 9280/S",
    question: "What skills do you think will be most essential for young graduates entering the workforce in the next decade, and how is your school preparing you for them?",
    guidance: "OxfordAQA Part 2 Tip: Demonstrate range by using conditional tenses ('If students learn...', 'Were universities to adapt...') and modal verbs ('must', 'ought to').",
    keyVocabulary: ["adaptability", "critical analysis", "emotional intelligence", "vocational training", "technological literacy"],
    ideaStarters: [
      "Soft interpersonal skills vs. technical automation resilience",
      "Internships and practical apprenticeships bridging academic theory",
      "Lifelong continuous learning in an evolving job market"
    ]
  },

  // =========================================================================
  // CAMBRIDGE IGCSE ESL (0510 / 0511)
  // =========================================================================
  {
    id: "cambridge-card-a",
    examTrack: "cambridge",
    part: "discussion",
    partName: "Candidate Card A",
    category: "Society & Technology",
    title: "Artificial Intelligence in Everyday Life",
    difficulty: "Cambridge IGCSE ESL 0510/0511",
    question: "Many people now interact with AI systems on a daily basis. Discuss with the examiner how AI influences learning, communication, and decision-making.",
    guidance: "Cambridge 0510/0511 Tip: Focus on grammatical structures (out of 10), vocabulary range (out of 10), and spoken fluency (out of 10). Develop each prompt point smoothly.",
    keyVocabulary: ["ubiquitous", "cognitive assistance", "algorithmic curation", "autonomous", "ethical oversight"],
    ideaStarters: [
      "Convenience of personalized recommendations vs. algorithmic privacy",
      "AI in creative fields like graphic design and songwriting",
      "Preparing youth to evaluate machine-generated information critically"
    ]
  },
  {
    id: "cambridge-card-b",
    examTrack: "cambridge",
    part: "discussion",
    partName: "Candidate Card B",
    category: "Environment & Travel",
    title: "Sustainable Tourism and Local Cultures",
    difficulty: "Cambridge IGCSE ESL 0510/0511",
    question: "Tourism brings economic prosperity to many regions, but it can also damage natural habitats and commercialize local heritage. How can tourism be made truly sustainable?",
    guidance: "Cambridge 0510/0511 Tip: Structure your thoughts with clear transitions ('On the one hand...', 'Furthermore...', 'Consequently...').",
    keyVocabulary: ["eco-tourism", "cultural preservation", "overtourism", "carbon footprint", "indigenous hospitality"],
    ideaStarters: [
      "Limiting visitor caps in fragile ecological zones",
      "Directing tourism revenue directly to native communities",
      "Educating international travelers on respectful cultural etiquette"
    ]
  },

  // =========================================================================
  // IELTS SPEAKING (Parts 1, 2 Cue Card, 3)
  // =========================================================================
  {
    id: "ielts-cue-1",
    examTrack: "ielts",
    part: "part2",
    partName: "IELTS Part 2 (Long Turn)",
    category: "Personal Experience",
    title: "Describe an Unplanned Challenge You Overcame",
    difficulty: "IELTS Band 6.5–9.0",
    question: "Describe a time when you encountered an unexpected problem. You should say: what the situation was, why it was unexpected, what actions you took, and explain what you learned from the experience.",
    guidance: "IELTS Long Turn Tip: Speak continuously for up to 2 minutes. Organize with clear past tenses ('I was faced with...', 'Had I known...', 'Eventually I managed to...').",
    keyVocabulary: ["unforeseen hurdle", "resilience", "improvise", "resourcefulness", "retrospectively"],
    ideaStarters: [
      "Narrating the complication vividly with descriptive adjectives",
      "Highlighting proactive problem-solving steps taken under pressure",
      "Reflecting on personal growth and lessons learned"
    ]
  },
  {
    id: "ielts-part3-1",
    examTrack: "ielts",
    part: "part3",
    partName: "IELTS Part 3 (Abstract Discussion)",
    category: "Society & Psychology",
    title: "Resilience, Failure & Risk-Taking in Modern Society",
    difficulty: "IELTS Band 7.0–9.0",
    question: "Why do some cultures perceive failure as a stigma, while others view it as an essential stepping stone to innovation? How can educational systems foster healthy risk-taking?",
    guidance: "IELTS Part 3 Tip: Avoid personal anecdotes here; generalize to society, compare cultures, and project future societal trends.",
    keyVocabulary: ["cultural paradigm", "psychological safety", "entrepreneurial mindset", "risk aversion", "iterative failure"],
    ideaStarters: [
      "Institutional punishment of mistakes vs. Silicon Valley innovation culture",
      "Classroom environments that reward thoughtful hypotheses over rote answers",
      "Long-term economic vitality driven by fearless experimentation"
    ]
  },

  // =========================================================================
  // TOEFL iBT SPEAKING
  // =========================================================================
  {
    id: "toefl-task1-1",
    examTrack: "toefl",
    part: "task1",
    partName: "TOEFL Task 1 (Independent)",
    category: "Campus & Education",
    title: "Mandatory Lecture Attendance vs. Recorded Lectures",
    difficulty: "TOEFL iBT Score 22–30",
    question: "Some universities require students to attend all lectures in person, while others record lectures and make attendance optional. Which policy do you think is better for student learning? Explain your reasons with specific details.",
    guidance: "TOEFL Task 1 Tip: State your preference immediately in the first sentence. Give two distinct, well-elaborated supporting reasons with concrete examples. Pacing: 45 seconds.",
    keyVocabulary: ["compulsory attendance", "asynchronous learning", "accountability", "self-paced comprehension", "academic autonomy"],
    ideaStarters: [
      "Reason 1: Flexibility for students with jobs or commute constraints",
      "Reason 2: Value of in-person spontaneous question-and-answer interactions",
      "Concluding synthesis: Hybrid models providing best of both worlds"
    ]
  }
];

// Helper to retrieve topics by exam track
function getTopicsByExam(examTrack) {
  return SPEAKING_TOPICS.filter(t => t.examTrack === examTrack);
}

// Helper to retrieve single topic
function getTopicById(id) {
  return SPEAKING_TOPICS.find(t => t.id === id) || SPEAKING_TOPICS[0];
}
