export const MOCK_TESTS_DATA: Record<string, any> = {
  electricity: {
    title: "Electricity Concept Test",
    subject: "science",
    timeLimit: 600,
    questions: [
      { id: "q1", type: "mcq", question: "An electric bulb is connected to a 220V generator. The current is 0.50A. What is the power of the bulb?", options: ["110 W", "220 W", "55 W", "440 W"], correctAnswer: 0, explanation: "P = V × I = 220 × 0.50 = 110 W." },
      { id: "q2", type: "mcq", question: "If the length of a wire is doubled and area is halved, its resistance becomes:", options: ["Double", "Halved", "Four times", "Unchanged"], correctAnswer: 2, explanation: "R = ρL/A. New R = ρ(2L)/(A/2) = 4R." },
      { id: "q3", type: "assertion-reason", question: "Assertion (A): Alloys are used in heating devices.\nReason (R): Alloys have higher resistivity and don't oxidize easily at high temperatures.", options: ["Both A and R are true and R explains A", "Both A and R are true but R doesn't explain A", "A is true but R is false", "A is false but R is true"], correctAnswer: 0, explanation: "Both are true. R correctly explains A." },
      { id: "q4", type: "mcq", question: "Work done moving 2 Coulombs across 12 Volts potential difference?", options: ["6 J", "24 J", "12 J", "0.16 J"], correctAnswer: 1, explanation: "W = Q × V = 2 × 12 = 24 J." },
    ]
  },
  "quadratic-eq": {
    title: "Quadratic Equations Diagnostic",
    subject: "mathematics",
    timeLimit: 600,
    questions: [
      { id: "q1", type: "mcq", question: "For what value of k will 2x² + kx + 3 = 0 have two equal real roots?", options: ["± 2√6", "± √6", "± 4", "± 2√3"], correctAnswer: 0, explanation: "For equal roots, D = 0. k² - 4(2)(3) = 0 → k = ±2√6." },
      { id: "q2", type: "mcq", question: "If x = 2 is a root of 2x² + kx - 6 = 0, value of k is:", options: ["1", "-1", "2", "-2"], correctAnswer: 1, explanation: "Substituting x=2: 8 + 2k - 6 = 0 → k = -1." },
      { id: "q3", type: "mcq", question: "Discriminant of x² - 4x + 4 = 0:", options: ["8", "16", "0", "-8"], correctAnswer: 2, explanation: "D = b² - 4ac = 16 - 16 = 0." },
    ]
  }
};
