export type InterviewQuestion = {
  text: string;
  hint: string;
  idealKeywords: string[];
  sampleFeedback: string;
};

export type Track = {
  id: string;
  label: string;
  description: string;
  questions: InterviewQuestion[];
};

export const tracks: Track[] = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Tell me about a time… questions that probe teamwork, conflict and leadership.',
    questions: [
      {
        text: 'Tell me about a time you faced a conflict with a coworker and how you resolved it.',
        hint: 'Use the STAR method: Situation, Task, Action, Result. Keep the result measurable.',
        idealKeywords: ['situation', 'task', 'action', 'result', 'communication', 'resolved', 'team'],
        sampleFeedback:
          'Strong STAR structure. Quantify the result and focus more on your specific actions than the team\'s.',
      },
      {
        text: 'Describe a project that did not go as planned. What did you learn?',
        hint: 'Show ownership, not blame. Emphasize the lesson and how you applied it later.',
        idealKeywords: ['learned', 'ownership', 'adjusted', 'feedback', 'mistake', 'improved'],
        sampleFeedback:
          'Good reflection. Name the specific change you made afterward to prove the lesson stuck.',
      },
      {
        text: 'Tell me about a time you had to influence a decision without authority.',
        hint: 'Highlight how you built consensus with data and stakeholder empathy.',
        idealKeywords: ['data', 'stakeholder', 'persuaded', 'consensus', 'influence', 'alignment'],
        sampleFeedback:
          'Solid stakeholder awareness. Add the concrete data point that swayed the decision.',
      },
      {
        text: 'Give an example of when you had to deliver difficult feedback to someone.',
        hint: 'Show empathy plus directness. Describe the outcome for the relationship.',
        idealKeywords: ['empathy', 'direct', 'specific', 'growth', 'feedback', 'improvement'],
        sampleFeedback:
          'Nice balance of empathy and directness. Mention how the recipient grew afterward.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'System design and problem-solving questions for engineering roles.',
    questions: [
      {
        text: 'How would you design a URL shortening service that handles 100M requests per day?',
        hint: 'Cover load estimation, encoding scheme, database choice, caching and edge cases.',
        idealKeywords: ['cache', 'database', 'hash', 'encoding', 'latency', 'scale', 'redis', 'partition'],
        sampleFeedback:
          'Good coverage of caching and encoding. Discuss write vs read ratio and collision handling.',
      },
      {
        text: 'Explain how you would debug a production incident with elevated error rates.',
        hint: 'Walk through triage: metrics, logs, recent deploys, rollback, then root cause.',
        idealKeywords: ['logs', 'metrics', 'rollback', 'deploy', 'root cause', 'alerting', 'triage'],
        sampleFeedback:
          'Clear triage flow. Add how you communicate status to stakeholders during the incident.',
      },
      {
        text: 'Describe a time you had to choose between two technical approaches. How did you decide?',
        hint: 'Weigh tradeoffs: cost, complexity, team familiarity, future scalability.',
        idealKeywords: ['tradeoff', 'complexity', 'scalability', 'cost', 'maintainability', 'decision'],
        sampleFeedback:
          'Good tradeoff framing. Explicitly state the criteria and weights you used to decide.',
      },
      {
        text: 'How do you ensure code quality across a team of ten engineers?',
        hint: 'Think about review process, CI, standards, testing and mentorship.',
        idealKeywords: ['review', 'ci', 'testing', 'standards', 'mentorship', 'linting', 'coverage'],
        sampleFeedback:
          'Strong process answer. Mention how you onboard new engineers to those standards.',
      },
    ],
  },
  {
    id: 'product',
    label: 'Product',
    description: 'Product sense, prioritization and metrics questions for PM roles.',
    questions: [
      {
        text: 'How would you improve retention for a mobile app that has plateaued?',
        hint: 'Diagnose the funnel, segment users, propose experiments, and define success metrics.',
        idealKeywords: ['funnel', 'segment', 'experiment', 'retention', 'metric', 'hypothesis', 'cohort'],
        sampleFeedback:
          'Good experiment framing. Tie each hypothesis to a specific user segment and metric.',
      },
      {
        text: 'Walk me through how you would prioritize a roadmap with ten competing features.',
        hint: 'Use a framework like RICE or ICE and justify the weights you assign.',
        idealKeywords: ['rice', 'impact', 'effort', 'priority', 'stakeholder', 'tradeoff', 'roadmap'],
        sampleFeedback:
          'Clear framework choice. Explain how you handle features that are urgent but low impact.',
      },
      {
        text: 'What metric would you use to measure the success of a checkout flow change?',
        hint: 'Primary metric plus guardrail metrics to avoid gaming the primary one.',
        idealKeywords: ['conversion', 'revenue', 'guardrail', 'funnel', 'a/b test', 'metric', 'drop-off'],
        sampleFeedback:
          'Nice guardrail thinking. Name the counter-metric that prevents false wins.',
      },
    ],
  },
];

export const roles = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Product Manager',
  'Data Scientist',
  'Engineering Manager',
  'UX Designer',
];
