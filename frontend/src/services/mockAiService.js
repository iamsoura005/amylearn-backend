const KNOWLEDGE = [
  {
    match: /photosynth|chlorophyll|plant/i,
    title: 'Photosynthesis',
    body: `**Photosynthesis** converts light energy into chemical energy.

1. **Light reactions** (thylakoid membrane) split water, release O₂ and produce ATP + NADPH.
2. **Calvin cycle** (stroma) uses ATP + NADPH to fix CO₂ into glucose.

**Remember:** 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.`
  },
  {
    match: /derivative|calculus|differenti/i,
    title: 'Derivatives',
    body: `A **derivative** measures instantaneous rate of change.

- Power rule: d/dx(xⁿ) = n·xⁿ⁻¹
- Product rule: (uv)' = u'v + uv'
- Chain rule: d/dx f(g(x)) = f'(g(x))·g'(x)

**Try this:** What is the slope of y = x² at x = 3? Start by finding dy/dx, then substitute.`
  },
  {
    match: /normaliza|dbms|database|sql|functional depend/i,
    title: 'Database normalisation',
    body: `**Normalisation** removes redundancy and update anomalies.

| Form | Removes |
| --- | --- |
| 1NF | multi-valued attributes |
| 2NF | partial dependencies |
| 3NF | transitive dependencies |
| BCNF | every determinant is a candidate key |

**Check yourself:** if A → B and B → C, which normal form is violated?`
  },
  {
    match: /deadlock|operating system|scheduler|process/i,
    title: 'Deadlocks in operating systems',
    body: `A **deadlock** needs four conditions at once: mutual exclusion, hold-and-wait, no pre-emption and circular wait.

**Prevention:** order resource requests, use timeouts, or require all resources up-front. **Avoidance:** Banker's algorithm. **Detection:** wait-for graph cycle.`
  },
  {
    match: /optics|refraction|lens|snell/i,
    title: 'Refraction and lenses',
    body: `**Snell's law:** n₁ sin θ₁ = n₂ sin θ₂.

For a thin lens: **1/f = 1/v − 1/u**. A convex lens has positive focal length; a concave lens is negative.

**Quick intuition:** light bends toward the normal when entering a denser medium.`
  },
  {
    match: /algorithm|complexity|big o|sorting|data structure/i,
    title: 'Algorithms & complexity',
    body: `**Big-O** describes how runtime scales.

- Binary search: O(log n)
- Merge sort: O(n log n), stable
- Quick sort: average O(n log n), worst O(n²)
- Hash map lookup: average O(1)

**Rule of thumb:** divide-and-conquer usually adds a log factor.`
  },
  {
    match: /exam|revision|study plan|focus|timetable/i,
    title: 'A calmer revision plan',
    body: `Use **45/10 focus blocks**:

1. 45 minutes on one topic with active recall.
2. 10 minutes away from screens.
3. End each block by writing 3 questions you still cannot answer.

Spaced repetition: revisit today's topic tomorrow, in 3 days, then in 7 days.`
  },
  {
    match: /entropy|thermodynamic|heat|physics/i,
    title: 'Thermodynamics',
    body: `**First law:** ΔU = Q − W. **Second law:** entropy of an isolated system never decreases.

For an isothermal reversible process, W = nRT ln(V₂/V₁). Watch the sign convention: work done *by* the gas is positive here.`
  }
];

const MINDMAPS = {
  default: `graph TD
  A[Study topic] --> B[Core concepts]
  A --> C[Definitions]
  A --> D[Worked examples]
  B --> B1[Key formula]
  B --> B2[Assumptions]
  C --> C1[Term 1]
  C --> C2[Term 2]
  D --> D1[Practice set]
  D --> D2[Common mistakes]`,
  photosynthesis: `graph TD
  A[Photosynthesis] --> B[Light reactions]
  A --> C[Calvin cycle]
  B --> B1[Water splitting]
  B --> B2[ATP + NADPH]
  B --> B3[Oxygen released]
  C --> C1[CO₂ fixation]
  C --> C2[RuBisCO]
  C --> C3[Glucose]`,
  database: `graph TD
  A[Normalisation] --> B[1NF]
  A --> C[2NF]
  A --> D[3NF]
  A --> E[BCNF]
  B --> B1[Atomic values]
  C --> C1[No partial dependency]
  D --> D1[No transitive dependency]
  E --> E1[Candidate key determinants]`
};

const detectTopic = (message = '') => {
  const text = String(message).toLowerCase();
  for (const entry of KNOWLEDGE) if (entry.match.test(text)) return entry;
  return null;
};

const pickMindmap = (message = '') => {
  const text = String(message).toLowerCase();
  if (/photosynth|plant/.test(text)) return MINDMAPS.photosynthesis;
  if (/database|normal|dbms/.test(text)) return MINDMAPS.database;
  return MINDMAPS.default;
};

const socraticHint = (topic) =>
  `Let's take this one step at a time.

1. What is the **goal** of the concept in your own words?
2. Which quantities or definitions are given?
3. Which principle connects them?

You try the first step — I'll check your reasoning and nudge you if needed.`;

export const STARTER_PROMPTS = [
  'Explain photosynthesis like I have an exam tomorrow',
  'Quiz me on database normalisation',
  'Make a mind map for operating system deadlocks',
  'Give me a 3-day revision plan for calculus'
];

export const generateMockAiResponse = (message = '', mode = 'study', studentName = 'there') => {
  const topic = detectTopic(message);

  if (mode === 'mindmap') {
    return { reply: `:::MERMAID_Start:::${pickMindmap(message)}:::MERMAID_End:::`, offline: true };
  }

  if (mode === 'tutor') {
    const subject = topic?.title || 'this topic';
    return {
      reply: `Good question, ${studentName}. Let's work through **${subject}** together.

${socraticHint(subject)}

**Hint:** start by naming the principle involved before doing any calculation. What's your first thought?`,
      offline: true
    };
  }

  if (!topic) {
    return {
      reply: `Hi ${studentName} — I'm your AmyLearn study companion. I can explain a concept, quiz you, generate a mind map, or break down a lecture.

**Pick a starting point:**
- “Explain the chain rule with an example”
- “Quiz me on DBMS normalisation”
- “Make a mind map for deadlocks”
- “Summarise this PDF” — upload it in the panel above.`,
      offline: true
    };
  }

  return {
    reply: `Here's a clear walkthrough of **${topic.title}**, ${studentName}.

${topic.body}

**Next step:** close this panel and write the idea in your own words. If you can explain it to a friend without notes, you're exam-ready.`,
    offline: true
  };
};

export const MOCK_FILE_SUMMARY = {
  summarize: `:::MOCK_SUMMARY:::

**Document overview**

This note set covers the core examinable ideas with worked examples and common traps. The highest-yield sections are the definitions table and the two step-by-step derivations.

**Five key takeaways**
1. Start from the governing principle, not the formula.
2. State assumptions before substituting values.
3. Track units at every step.
4. The worked example mirrors the most common exam pattern.
5. Review the “common mistakes” box before attempting the practice set.`,
  solve: `:::MOCK_SOLUTION:::

**Step-by-step solution**

1. Identify the given quantities and the target.
2. Choose the governing relation.
3. Substitute, keeping units consistent.
4. Simplify and sanity-check the magnitude.

**Final answer:** provided in the worked example above — verify the sign and units before submitting.`,
  exam_quiz: `**Practice quiz**

1. Define the main principle in one sentence.
2. Apply it to the worked example — show every step.
3. Explain what changes if one assumption is removed.
4. Predict the result when a key variable doubles.
5. Identify the most common mistake in this topic.

Answers are available in the panel below.`,
  mindmap: `:::MERMAID_Start:::${MINDMAPS.default}:::MERMAID_End:::`
};

export const mockTutorReply = generateMockAiResponse;

export default generateMockAiResponse;
