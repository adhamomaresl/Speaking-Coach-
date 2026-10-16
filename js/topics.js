/**
 * topics.js - Curated speaking topics and questions with pedagogical metadata
 */
const SPEAKING_TOPICS = [
  {
    id: "tech-ai-education",
    category: "Technology & Society",
    icon: "brain-circuit",
    title: "AI in the Modern Classroom",
    difficulty: "Intermediate to Advanced",
    question: "Do you believe artificial intelligence tools like ChatGPT enhance student critical thinking, or do they undermine authentic learning? Explain your stance with real-world examples.",
    guidance: "Structure your response with a clear thesis, at least one counterargument, and a practical proposal for how schools should adapt.",
    keyVocabulary: ["pedagogical", "cognitive offloading", "rote memorization", "academic integrity", "critical inquiry"],
    ideaStarters: [
      "AI as a personalized tutor vs. a shortcut for essays",
      "Shift from memorization to prompt engineering and verification",
      "The digital divide between students who have premium AI tools and those who don't"
    ]
  },
  {
    id: "work-remote-culture",
    category: "Workplace & Leadership",
    icon: "briefcase",
    title: "The Future of Remote & Hybrid Work",
    difficulty: "Intermediate",
    question: "Some business leaders argue that full-time office presence is essential for corporate culture, while employees demand flexibility. How should organizations reconcile these conflicting priorities?",
    guidance: "Highlight the advantages and drawbacks for both employers and employees, and suggest a balanced compromise.",
    keyVocabulary: ["autonomy", "synchronous collaboration", "watercooler serendipity", "geographic flexibility", "burnout"],
    ideaStarters: [
      "Productivity metrics vs. mere physical presence",
      "Onboarding junior staff without spontaneous mentorship",
      "Impact on urban commercial real estate and commuting pollution"
    ]
  },
  {
    id: "env-fast-fashion",
    category: "Environment & Sustainability",
    icon: "leaf",
    title: "Fast Fashion & Consumer Responsibility",
    difficulty: "Advanced",
    question: "Fast fashion allows affordable access to trending apparel, but carries severe ecological and labor consequences. Should the burden of reform rest on individual consumers, or should governments enforce strict manufacturing regulations?",
    guidance: "Examine economic incentives, regulatory mechanisms, and cultural shifts in consumer habits.",
    keyVocabulary: ["circular economy", "textile waste", "supply chain transparency", "greenwashing", "microplastics"],
    ideaStarters: [
      "Consumer boycott fatigue vs. legislative quotas on synthetic fibers",
      "Economic privilege involved in buying ethical, sustainable garments",
      "Incentivizing garment recycling and longevity guarantees"
    ]
  },
  {
    id: "psych-failure-growth",
    category: "Personal Psychology & Habits",
    icon: "compass",
    title: "Reframing Failure and Resilience",
    difficulty: "All Levels",
    question: "Society often celebrates success while stigmatizing failure. Describe an experience where a setback proved more valuable than immediate success, and explain how people can cultivate a healthier relationship with mistakes.",
    guidance: "Use the STAR method (Situation, Task, Action, Result) to narrate a personal or observational anecdote, then extract a broader psychological principle.",
    keyVocabulary: ["growth mindset", "adversity quotient", "iterative improvement", "imposter syndrome", "fortitude"],
    ideaStarters: [
      "Distinguishing productive failure from careless negligence",
      "How institutional fear of mistakes stifles risk-taking",
      "Psychological safety in educational and team environments"
    ]
  },
  {
    id: "culture-language-loss",
    category: "Culture & Global Perspectives",
    icon: "globe",
    title: "Preserving Endangered Languages",
    difficulty: "Advanced",
    question: "A language disappears approximately every two weeks globally. In a hyper-connected world dominated by global lingua francas like English, why does the preservation of minority and indigenous languages matter?",
    guidance: "Connect linguistic diversity to indigenous knowledge, cultural identity, and unique conceptual frameworks.",
    keyVocabulary: ["linguistic relativity", "indigenous heritage", "cultural homogenization", "oral tradition", "epistemology"],
    ideaStarters: [
      "Languages carry unique botanical and medical ecological knowledge",
      "Language loss as a severance of generational storytelling",
      "Role of digital archives, apps, and community immersion schools"
    ]
  },
  {
    id: "ethics-social-media",
    category: "Technology & Society",
    icon: "smartphone",
    title: "Algorithmic Feeds & Public Discourse",
    difficulty: "Advanced",
    question: "Social media platforms are optimized for engagement, frequently prioritizing outrage and sensationalism over balanced discourse. What are the long-term societal consequences, and how can digital literacy counteract this?",
    guidance: "Evaluate the psychological hook of algorithmic feeds and propose educational or regulatory solutions.",
    keyVocabulary: ["echo chamber", "algorithmic polarization", "dopamine loops", "media literacy", "civic fragmentation"],
    ideaStarters: [
      "The breakdown of shared objective factual reality",
      "Attention economy vs. deep cognitive contemplation",
      "Teaching digital skepticism and bias awareness in secondary schools"
    ]
  },
  {
    id: "urban-transit-cities",
    category: "Environment & Sustainability",
    icon: "car",
    title: "Car-Free City Centers",
    difficulty: "Intermediate",
    question: "Several major European cities are banning private cars from their urban cores. Do you support car-free zones in your city, and what infrastructural changes are required to make this successful?",
    guidance: "Consider mobility equity, public health, local retail commerce, and public transit reliability.",
    keyVocabulary: ["walkability", "last-mile transit", "urban densification", "emission reduction", "micromobility"],
    ideaStarters: [
      "Commercial benefits for foot-traffic retail vs. delivery logistics",
      "Accessibility for elderly citizens and persons with disabilities",
      "Integration of light rail, bike-sharing, and park-and-ride facilities"
    ]
  },
  {
    id: "society-decision-making",
    category: "Personal Psychology & Habits",
    icon: "scale",
    title: "Analysis Paralysis in the Age of Abundance",
    difficulty: "Intermediate to Advanced",
    question: "Modern consumers have access to virtually unlimited options for entertainment, careers, and lifestyle. Does this abundance increase human happiness, or does it lead to decision paralysis and chronic regret?",
    guidance: "Contrast the 'Paradox of Choice' concept with the freedom of modern autonomy.",
    keyVocabulary: ["paradox of choice", "satisficing vs. maximizing", "opportunity cost", "decision fatigue", "hedonic treadmill"],
    ideaStarters: [
      "Barry Schwartz's thesis on choice overload",
      "Constant social comparison fueled by digital abundance",
      "Strategies like intentional constraints and default routines"
    ]
  }
];

// Helper to retrieve topic by ID
function getTopicById(id) {
  return SPEAKING_TOPICS.find(t => t.id === id) || SPEAKING_TOPICS[0];
}

// Group topics by category
function getTopicsByCategory() {
  const grouped = {};
  SPEAKING_TOPICS.forEach(topic => {
    if (!grouped[topic.category]) {
      grouped[topic.category] = [];
    }
    grouped[topic.category].push(topic);
  });
  return grouped;
}
