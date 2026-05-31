// mockData.js - CBSE/ICSE Class 9/10 Curriculum and Simulated AI Responses

export const CBSE_SUBJECTS = {
  science: {
    title: "Class 10 Science (CBSE)",
    icon: "🔬",
    chapters: [
      {
        id: "chem-reactions",
        title: "Chemical Reactions & Equations",
        topics: ["Balanced Chemical Equations", "Combination & Decomposition", "Displacement & Double Displacement", "Oxidation & Reduction", "Corrosion & Rancidity"]
      },
      {
        id: "acids-bases",
        title: "Acids, Bases & Salts",
        topics: ["pH Scale in Daily Life", "Properties of Acids & Bases", "Preparation of Sodium Hydroxide", "Bleaching Powder & Baking Soda", "Plaster of Paris"]
      },
      {
        id: "light",
        title: "Light - Reflection & Refraction",
        topics: ["Spherical Mirrors", "Mirror Formula & Magnification", "Laws of Refraction & Refractive Index", "Lens Formula & Power of Lens", "Image Formation by Lenses"]
      },
      {
        id: "electricity",
        title: "Electricity",
        topics: ["Electric Current & Potential Difference", "Ohm's Law & Resistance", "Factors affecting Resistance", "Resistors in Series & Parallel", "Heating Effect & Electric Power"]
      },
      {
        id: "magnetic-effects",
        title: "Magnetic Effects of Electric Current",
        topics: ["Magnetic Field Lines & Field", "Magnetic Field due to Current Carrying Conductor", "Force on Current Carrying Conductor", "Electric Motor & Electromagnetic Induction", "Domestic Electric Circuits"]
      }
    ]
  },
  mathematics: {
    title: "Class 10 Mathematics (CBSE)",
    icon: "📐",
    chapters: [
      {
        id: "quadratic-eq",
        title: "Quadratic Equations",
        topics: ["Standard Form of Quadratic Equation", "Factorization Method", "Quadratic Formula (Sridharacharya)", "Nature of Roots & Discriminant", "Word Problems on Quadratic Equations"]
      },
      {
        id: "ap",
        title: "Arithmetic Progressions (AP)",
        topics: ["General Term of an AP (nth term)", "Sum of First n Terms of AP", "Real-life Applications of AP"]
      },
      {
        id: "trigo",
        title: "Introduction to Trigonometry",
        topics: ["Trigonometric Ratios", "Trigonometric Ratios of Specific Angles", "Trigonometric Identities", "Heights & Distances (Applications)"]
      }
    ]
  }
};

export const NCERT_CONTENT_REGISTRY = {
  board: "CBSE",
  academicYear: "2026-27",
  tutoringCycle: "2025-26",
  classLabel: "Class 10",
  language: "English",
  rationalisedContentApplied: true,
  lastVerified: "31 May 2026",
  officialTextbookPortal: "https://www.ncert.nic.in/textbook.php",
  rationalisedContentUrl: "https://www.ncert.nic.in/rationalised-content.php?ln=en",
  note: "Class X tutoring currently uses the latest verified official NCERT 2025-26 reprint cycle until a newer Class X cycle is published."
};

export const MOCK_TESTS = {
  electricity: {
    title: "Electricity Concept Test",
    subject: "science",
    timeLimit: 600, // 10 minutes in seconds
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "An electric bulb is connected to a 220V generator. The current is 0.50A. What is the power of the bulb?",
        options: [
          "110 W",
          "220 W",
          "55 W",
          "440 W"
        ],
        correctAnswer: 0,
        explanation: "Power (P) is calculated by the formula P = V * I. Here, V = 220 V and I = 0.50 A. Therefore, P = 220 * 0.50 = 110 W."
      },
      {
        id: "q2",
        type: "mcq",
        question: "If the length of a cylindrical conducting wire is doubled and its area of cross-section is halved, its resistance will become:",
        options: [
          "Double",
          "Halved",
          "Four times",
          "Unchanged"
        ],
        correctAnswer: 2,
        explanation: "Resistance R = ρ * (L / A). If L becomes 2L and A becomes A/2, the new resistance R' = ρ * (2L / (A/2)) = 4 * (ρ * L / A) = 4R. Hence, the resistance becomes four times."
      },
      {
        id: "q3",
        type: "assertion-reason",
        question: "Assertion (A): Alloys are commonly used in electrical heating devices like irons and heaters.\nReason (R): Alloys have higher resistivity than their constituent metals and do not burn (oxidize) easily at high temperatures.",
        options: [
          "Both A and R are true and R is the correct explanation of A",
          "Both A and R are true but R is not the correct explanation of A",
          "A is true but R is false",
          "A is false but R is true"
        ],
        correctAnswer: 0,
        explanation: "Alloys do not oxidize (burn) readily at high temperatures, and they have higher resistivity than pure metals, making them ideal for heating elements. Thus, both A and R are true, and R explains A."
      },
      {
        id: "q4",
        type: "mcq",
        question: "How much work is done in moving a charge of 2 Coulombs across two points having a potential difference of 12 Volts?",
        options: [
          "6 Joules",
          "24 Joules",
          "12 Joules",
          "0.16 Joules"
        ],
        correctAnswer: 1,
        explanation: "Work done (W) = Charge (Q) * Potential Difference (V). W = 2 C * 12 V = 24 Joules."
      }
    ]
  },
  "quadratic-eq": {
    title: "Quadratic Equations Diagnostic",
    subject: "mathematics",
    timeLimit: 600,
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "For what value of k will the quadratic equation 2x² + kx + 3 = 0 have two equal real roots?",
        options: [
          "± 2√6",
          "± √6",
          "± 4",
          "± 2√3"
        ],
        correctAnswer: 0,
        explanation: "For equal roots, the discriminant D = b² - 4ac = 0. Here, a = 2, b = k, and c = 3. So, k² - 4(2)(3) = 0 => k² - 24 = 0 => k = ±√24 = ±2√6."
      },
      {
        id: "q2",
        type: "mcq",
        question: "If one root of the quadratic equation 2x² + kx - 6 = 0 is 2, what is the value of k?",
        options: [
          "1",
          "-1",
          "2",
          "-2"
        ],
        correctAnswer: 1,
        explanation: "Since x = 2 is a root, substituting x = 2 must satisfy the equation: 2(2)² + k(2) - 6 = 0 => 8 + 2k - 6 = 0 => 2 + 2k = 0 => 2k = -2 => k = -1."
      },
      {
        id: "q3",
        type: "mcq",
        question: "What is the discriminant of the quadratic equation x² - 4x + 4 = 0?",
        options: [
          "8",
          "16",
          "0",
          "-8"
        ],
        correctAnswer: 2,
        explanation: "D = b² - 4ac. Here a = 1, b = -4, c = 4. D = (-4)² - 4(1)(4) = 16 - 16 = 0."
      }
    ]
  },
  "jee-advanced": {
    title: "JEE Advanced Physics Practice",
    subject: "science",
    timeLimit: 1200,
    questions: [
      {
        id: "ja1",
        type: "msq",
        question: "A uniform magnetic field B exists in a region. A charged particle enters the field perpendicularly. Which of the following statements are correct?",
        options: [
          "The kinetic energy of the particle remains constant.",
          "The speed of the particle remains constant.",
          "The momentum of the particle remains constant.",
          "The path of the particle is a circle."
        ],
        correctAnswers: [0, 1, 3],
        explanation: `<h4>Multi-Correct Explanation:</h4>
        <div class="derivation-step">
          <strong>Step 1: Analyzing Force</strong><br>
          The magnetic force on a moving charge is given by: 
          <div class="math-box"><strong>F = q(v × B)</strong></div>
          Since F is always perpendicular to velocity v, the work done by the magnetic force on the charge is:
          <div class="math-box"><strong>W = ∫ F · ds = ∫ F · (v dt) = 0</strong></div>
        </div>
        <div class="derivation-step">
          <strong>Step 2: Kinetic Energy and Speed</strong><br>
          By the Work-Energy Theorem, since Work done is zero, change in Kinetic Energy is zero. Kinetic energy remains constant (Option A). As Kinetic Energy = ½mv², speed v must also remain constant (Option B).
        </div>
        <div class="derivation-step">
          <strong>Step 3: Momentum and Path</strong><br>
          Momentum is a vector quantity (p = m*v). Since the direction of velocity changes continuously, momentum is NOT constant (Option C is incorrect). 
          Since speed is constant and force is constant in magnitude and perpendicular to velocity, the particle undergoes uniform circular motion (Option D is correct).
        </div>
        <div class="pitfall-box">
          <strong>Common Pitfall:</strong> Do not confuse speed with velocity! Velocity changes (due to direction change), so momentum changes. Speed and Kinetic Energy remain strictly constant.
        </div>`
      },
      {
        id: "ja2",
        type: "msq",
        question: "Let f(x) = x² + bx + c, where b and c are real numbers. If the equation f(x) = 0 has two distinct real roots in the interval (0, 1), then which of the following conditions must hold true?",
        options: [
          "b² - 4c > 0",
          "f(0) > 0 and f(1) > 0",
          "0 < -b/2 < 1",
          "b + c + 1 < 0"
        ],
        correctAnswers: [0, 1, 2],
        explanation: `<h4>Mathematical Analysis & Proof:</h4>
        <div class="derivation-step">
          <strong>Step 1: Discriminant for Real Roots</strong><br>
          For two distinct real roots, the discriminant must be strictly positive:
          <div class="math-box"><strong>D = b² - 4ac > 0 ➔ b² - 4c > 0</strong> (Option A is correct).</div>
        </div>
        <div class="derivation-step">
          <strong>Step 2: Location of Roots (Boundary Conditions)</strong><br>
          Since the roots lie in (0, 1), the parabola opens upwards (a=1 > 0). Therefore, the values of f(x) at the boundaries must be positive:
          <div class="math-box"><strong>f(0) > 0 ➔ c > 0</strong> and <strong>f(1) > 0 ➔ 1 + b + c > 0</strong> (Option B is correct).</div>
        </div>
        <div class="derivation-step">
          <strong>Step 3: Axis of Symmetry</strong><br>
          The vertex (axis of symmetry) of the parabola x = -b/2a = -b/2 must lie within the interval (0, 1):
          <div class="math-box"><strong>0 < -b/2 < 1</strong> (Option C is correct).</div>
        </div>
        <div class="pitfall-box">
          <strong>Exam Tip:</strong> If the interval boundaries were closed, e.g., [0, 1], then f(0) ≥ 0 and f(1) ≥ 0 would be the required conditions instead.
        </div>`
      }
    ]
  }
};

export const PRESET_DOUBTS = [
  {
    question: "Why does the color of copper sulfate change when an iron nail is kept in it?",
    category: "Science (Chemistry)",
    aiResponse: `<h3>Displacement Reaction Analysis</h3>
    <p>When an iron nail is dipped in a blue copper sulfate (CuSO₄) solution, a <strong>Single Displacement Reaction</strong> takes place because iron is chemically more reactive than copper (based on the reactivity series).</p>
    
    <div class="code-box">
      <strong>Chemical Equation:</strong><br>
      Fe (s) [Grey] + CuSO₄ (aq) [Blue] ➔ FeSO₄ (aq) [Light Green] + Cu (s) [Brownish Red]
    </div>
    
    <h4>Key Observations:</h4>
    <ul>
      <li><strong>Solution Color Change:</strong> The deep blue color of copper sulfate fades and turns light green due to the formation of iron sulfate (FeSO₄) in the solution.</li>
      <li><strong>Nail Coating:</strong> A reddish-brown coating of copper metal is deposited on the surface of the iron nail.</li>
    </ul>
    
    <div class="info-alert">
      <strong>Exam Tip:</strong> Always mention the physical state of reactants and products: (s) for solid and (aq) for aqueous solution to score full marks in CBSE.
    </div>`,
    eli5: `<h3>ELI5: Displacement Analogy 🎈</h3>
    <p>Think of this reaction like a game of <strong>musical chairs</strong>. In this solution, copper is currently sitting in a blue chair (the sulfate group).</p>
    <p>However, <strong>Iron is stronger and faster</strong> than copper. When the iron nail enters the beaker, the iron pushes the copper out of the chair, sits down, and turns the chair light green. Poor copper is left standing alone, forming a brownish coating on the nail!</p>`
  },
  {
    question: "How do we find the nature of roots for a quadratic equation?",
    category: "Mathematics",
    aiResponse: `<h3>Understanding the Discriminant & Nature of Roots</h3>
    <p>For any quadratic equation in standard form, <strong>ax² + bx + c = 0</strong> (where a ≠ 0), the nature of its roots depends on the value of the <strong>Discriminant (D)</strong>:</p>
    
    <div class="math-box">
      Formula: <strong>D = b² - 4ac</strong>
    </div>
    
    <h4>The Three Cases:</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>Condition</th>
          <th>Nature of Roots</th>
          <th>Graphical Representation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>D > 0</strong></td>
          <td>Two distinct, real roots.</td>
          <td>Intersects X-axis at two points.</td>
        </tr>
        <tr>
          <td><strong>D = 0</strong></td>
          <td>Two equal, real roots (coincident).</td>
          <td>Touches X-axis at exactly one point.</td>
        </tr>
        <tr>
          <td><strong>D < 0</strong></td>
          <td>No real roots (imaginary roots).</td>
          <td>Does not cross or touch the X-axis.</td>
        </tr>
      </tbody>
    </table>
    
    <div class="info-alert">
      <strong>Important Note:</strong> Real roots only exist if <strong>D ≥ 0</strong>. If the question asks if a situation is mathematically possible, calculate D and check if it is non-negative!
    </div>`,
    eli5: `<h3>ELI5: The Root Metal Detector 🔍</h3>
    <p>Imagine you are looking for gold coins (roots) buried along a trail (the X-axis). You have a special metal detector called the <strong>Discriminant (D)</strong>.</p>
    <ul>
      <li><strong>If D > 0 (High beep):</strong> The detector is loud! You will find exactly <strong>two separate spots</strong> with gold coins.</li>
      <li><strong>If D = 0 (One click):</strong> The detector clicks once. There is only <strong>one spot</strong>, where two coins are stacked exactly on top of each other.</li>
      <li><strong>If D < 0 (Silent):</strong> The detector stays quiet. There is <strong>no gold</strong> at all along this trail (the graph floats in the air and never touches the ground).</li>
    </ul>`
  },
  {
    question: "What is Ohm's Law and its mathematical expression?",
    category: "Science (Physics)",
    aiResponse: `<h3>Ohm's Law Explained</h3>
    <p><strong>Statement:</strong> Ohm's law states that the electric current (I) flowing through a metallic conductor is directly proportional to the potential difference (V) across its ends, provided its temperature and other physical conditions remain constant.</p>
    
    <div class="math-box">
      <strong>V ∝ I</strong> &nbsp;➔&nbsp; <strong>V = I * R</strong>
    </div>
    
    <p>Where <strong>R</strong> is a constant called <strong>Resistance</strong> of the conductor. The SI unit of Resistance is Ohm (Ω).</p>
    
    <h4>Graphical Verification (V-I Graph):</h4>
    <p>A graph plotted between potential difference (V) on the x-axis and current (I) on the y-axis (or vice-versa) is a <strong>straight line passing through the origin</strong>. The slope of the V-I graph represents the resistance R.</p>
    
    <div class="info-alert">
      <strong>CBSE Trick Question:</strong> If they swap V and I on the axes, the slope of the I-V graph becomes <strong>1/R (Conductance)</strong> instead of R! Read the axes labels carefully.
    </div>`,
    eli5: `<h3>ELI5: Water Pipe Analogy 💧</h3>
    <p>Imagine electricity is water flowing through a garden hose:</p>
    <ul>
      <li><strong>Voltage (V)</strong> is the water pump pressure. The harder you push, the faster water flows.</li>
      <li><strong>Current (I)</strong> is the flow rate (how much water comes out per second).</li>
      <li><strong>Resistance (R)</strong> is a pinch in the hose. It resists the flow.</li>
    </ul>
    <p>If you double the pump pressure (V), you get double the water flow (I). But if you pinch the hose tighter (increase R), the water flow drops. That is <strong>V = I * R</strong>!</p>`
  }
];

export const DEFAULT_STUDENT = {
  name: "Rohan Sharma",
  grade: "Class 10-A (CBSE)",
  classLevel: "Class 10",
  section: "A",
  board: "CBSE",
  academicYear: "2026-27",
  rollNumber: "28",
  school: "Delhi Public School, R.K. Puram",
  streak: 5,
  streakHistory: [true, true, true, true, true, false, false], // Last 7 days status
  xp: 2450,
  level: 4,
  nextLevelXp: 3000,
  syllabusCompletion: {
    science: 65,
    mathematics: 72
  },
  chapterProgress: {
    "chem-reactions": "mastered",
    "acids-bases": "revising",
    "light": "learning",
    "electricity": "learning",
    "magnetic-effects": "not-started",
    "quadratic-eq": "mastered",
    "ap": "revising",
    "trigo": "learning"
  },
  recentScores: [
    { title: "Chemical Reactions Test", date: "May 20, 2026", score: 85, total: 100 },
    { title: "Trigonometry Basics", date: "May 23, 2026", score: 92, total: 100 },
    { title: "Electricity Concept Test", date: "May 27, 2026", score: 75, total: 100 }
  ],
  weakTopics: [
    { topic: "Factors affecting Resistance", subject: "Science (Physics)", completion: 40 },
    { topic: "Nature of Roots", subject: "Maths", completion: 50 },
    { topic: "Double Displacement Reactions", subject: "Science (Chemistry)", completion: 55 }
  ],
  strongTopics: [
    { topic: "Trigonometric Identities", subject: "Maths", rating: "95%" },
    { topic: "pH Scale", subject: "Science (Chemistry)", rating: "92%" },
    { topic: "Spherical Mirrors", subject: "Science (Physics)", rating: "90%" }
  ],
  dailyTasks: [
    { id: "task1", title: "Practice 5 Quadratic Equations", completed: true },
    { id: "task2", title: "Solve Physics Electricity quiz", completed: false },
    { id: "task3", title: "Revise Bleaching Powder chemical formula", completed: false }
  ],
  announcements: [
    {
      id: "ann1",
      sender: "Ms. Sharma (Science)",
      title: "Science Lab Practical File Submission",
      content: "Please ensure your light refraction practical files are completed and signed by tomorrow afternoon.",
      date: "Today, 10:30 AM"
    },
    {
      id: "ann2",
      sender: "Mr. Verma (Maths)",
      title: "Quadratic Equations Doubt Session",
      content: "We will hold an optional doubt clearing class on MS Teams at 4:30 PM this Saturday.",
      date: "Yesterday"
    }
  ]
};

export const MOCK_TEACHER = {
  name: "Ms. Ananya Sharma",
  subject: "Science Specialist",
  classes: ["Class 10-A", "Class 10-B", "Class 9-C"],
  averagePerformance: {
    "Class 10-A": 78,
    "Class 10-B": 72,
    "Class 9-C": 81
  },
  activeHomeworks: [
    { id: "hw1", class: "Class 10-A", title: "Electricity Resistance Numericals", dueDate: "29 May 2026", submittedCount: 22, totalCount: 30 },
    { id: "hw2", class: "Class 10-B", title: "Balancing Equations Practice Sheets", dueDate: "30 May 2026", submittedCount: 14, totalCount: 28 }
  ]
};

export const CHAT_BOT_RESPONSES = {
  greeting: "Hello Rohan! I am your Vidya AI Companion. What topic from Science or Mathematics are we revising today?",
  topicsList: "You can click on any chapter in the list, or ask me doubts like: \n- *'How to balance chemical equations?'*\n- *'Explain refraction through a glass prism.'*\n- *'What is Sridharacharya formula?'*",
  generalFallback: "That's an interesting question! Based on the CBSE Class 10 syllabus, here is the concept breakdown. If you would like a mock question on this topic to test your understanding, let me know! Let me guide you step-by-step..."
};

export const JEE_PREP_DATA = {
  countdownDate: "May 28, 2028 09:00:00",
  dailyChallenger: {
    question: "A solid sphere of mass M and radius R rolls without slipping down an inclined plane of angle θ. The acceleration of its center of mass is:",
    options: [
      "5/7 g sin θ",
      "2/3 g sin θ",
      "3/5 g sin θ",
      "g sin θ"
    ],
    correctAnswer: 0,
    explanation: "For a rolling solid sphere, acceleration a = (g sin θ) / (1 + I/MR²). Since I = 2/5 MR² for a solid sphere, a = (g sin θ) / (1 + 2/5) = 5/7 g sin θ."
  },
  formulas: [
    { subject: "Physics", topic: "Rotational Mechanics", formulas: ["Moment of Inertia of Disc: I = ½ M R²", "Torque: τ = I * α = r × F", "Angular Momentum: L = I * ω = r × p"] },
    { subject: "Chemistry", topic: "Chemical Kinetics", formulas: ["Zero Order Half-life: t_½ = [A]₀ / 2k", "First Order Rate Law: k = (2.303 / t) * log([A]₀ / [A])", "Arrhenius Equation: k = A * e^(-Ea / RT)"] },
    { subject: "Mathematics", topic: "Calculus", formulas: ["Standard Limit: lim (x→0) (sin x / x) = 1", "Derivative of x^x: d/dx (x^x) = x^x * (1 + ln x)", "Integration: ∫ (1 / (x² + a²)) dx = (1/a) * arctan(x/a) + C"] }
  ]
};

export const NEET_PREP_DATA = {
  countdownDate: "May 7, 2028 10:00:00",
  dailyChallenger: {
    question: "Which of the following hormones is NOT secreted by human placenta?",
    options: [
      "hCG (Human Chorionic Gonadotropin)",
      "hPL (Human Placental Lactogen)",
      "Progesterone",
      "LH (Luteinizing Hormone)"
    ],
    correctAnswer: 3,
    explanation: "LH (Luteinizing Hormone) is secreted by the anterior pituitary gland, not the placenta. The placenta secretes hCG, hPL, estrogens, and progesterone."
  },
  ncertHighlights: [
    { subject: "Biology", chapter: "Photosynthesis", highlight: "<strong>NCERT Page 211:</strong> The reaction center chlorophyll 'a' has an absorption peak at 700 nm in PS I, hence is called P700, while in PS II it has absorption maxima at 680 nm, and is called P680." },
    { subject: "Biology", chapter: "Genetics", highlight: "<strong>NCERT Page 78:</strong> Gregor Mendel conducted hybridization experiments on garden peas for seven years (1856-1863) and proposed the laws of inheritance in living organisms." },
    { subject: "Chemistry", chapter: "Biomolecules", highlight: "<strong>NCERT Page 422:</strong> D-(+)-Glucose is dextrorotatory, and all naturally occurring amino acids (except glycine) are optically active and have the L-configuration." }
  ]
};

export const PYQ_BANK = [
  {
    id: "pyq1",
    exam: "jee",
    year: "2024",
    subject: "Physics",
    chapter: "Rotational Mechanics",
    question: "A thin uniform rod of mass M and length L is bent at its center so that the two halves are perpendicular to each other. What is the moment of inertia of the bent rod about an axis passing through the bend and perpendicular to the plane containing the two halves?",
    options: [
      "1/12 M L²",
      "1/3 M L²",
      "1/24 M L²",
      "1/6 M L²"
    ],
    correctAnswer: 0,
    correctAnswers: [0],
    explanation: `<h3>Moment of Inertia Derivation</h3>
    <div class="derivation-step">
      <strong>Step 1: Splitting the Rod into Components</strong><br>
      Let the total mass of the rod be <strong>M</strong> and its total length be <strong>L</strong>.
      When bent at the center, we get two independent halves:
      <ul>
        <li>Mass of each half: <strong>m = M/2</strong></li>
        <li>Length of each half: <strong>l = L/2</strong></li>
      </ul>
    </div>
    <div class="derivation-step">
      <strong>Step 2: Calculating Moment of Inertia of each half</strong><br>
      The axis passes through the bend (which is the end point of both halves) and is perpendicular to their plane.
      The moment of inertia of a uniform rod of mass <em>m</em> and length <em>l</em> about an axis passing through one of its ends is:
      <div class="math-box"><strong>I_half = ⅓ m l²</strong></div>
      Substituting <em>m = M/2</em> and <em>l = L/2</em>:
      <div class="math-box"><strong>I_half = ⅓ * (M/2) * (L/2)² = ⅓ * (M/2) * (L²/4) = 1/24 M L²</strong></div>
    </div>
    <div class="derivation-step">
      <strong>Step 3: Total Moment of Inertia</strong><br>
      Since moment of inertia is a scalar quantity, we can sum the contribution of both halves:
      <div class="math-box"><strong>I_total = I_half1 + I_half2 = 2 * (1/24 M L²) = 1/12 M L²</strong></div>
      Thus, the correct option is <strong>1/12 M L²</strong>.
    </div>
    <div class="pitfall-box">
      <strong>Common Pitfall:</strong> Students often mistakenly use the total mass M and total length L in the formula directly, calculating 1/3 M L² or 1/12 M L² without splitting mass and length correctly. Always write mass and length in terms of individual component parameters!
    </div>`,
    eli5: `<h3>ELI5: Spinning Clay Corner 🌀</h3>
    <p>Imagine you have a long piece of clay. If you spin it from the absolute center, it spins easily. If you bend it in half into an L-shape, it's like spinning two separate, shorter rods from their endpoints at the same time.</p>
    <p>Since each half rod is half the weight (M/2) and half the length (L/2), each half is much easier to spin. When we add their resistances together, it matches exactly <strong>1/12 M L²</strong>!</p>`
  },
  {
    id: "pyq2",
    exam: "cbse",
    year: "2023",
    subject: "Science",
    chapter: "Acids, Bases & Salts",
    question: "Which of the following salts does not contain water of crystallization?",
    options: [
      "Blue Vitriol",
      "Baking Soda",
      "Washing Soda",
      "Gypsum"
    ],
    correctAnswer: 1,
    correctAnswers: [1],
    explanation: `<h3>Chemical Formula Review & Identification</h3>
    <div class="derivation-step">
      <strong>Step 1: Write chemical formulas for each salt</strong><br>
      <ul>
        <li><strong>Blue Vitriol (Copper Sulfate Pentahydrate):</strong> CuSO₄ · 5H₂O (Contains 5 molecules of water of crystallization)</li>
        <li><strong>Baking Soda (Sodium Hydrogen Carbonate):</strong> NaHCO₃ (No water of crystallization)</li>
        <li><strong>Washing Soda (Sodium Carbonate Decahydrate):</strong> Na₂CO₃ · 10H₂O (Contains 10 molecules of water of crystallization)</li>
        <li><strong>Gypsum (Calcium Sulfate Dihydrate):</strong> CaSO₄ · 2H₂O (Contains 2 molecules of water of crystallization)</li>
      </ul>
    </div>
    <div class="derivation-step">
      <strong>Step 2: Conclusion</strong><br>
      Baking Soda (NaHCO₃) is a dry anhydrous salt and does not contain any water of crystallization in its standard crystalline lattice form.
    </div>`,
    eli5: `<h3>ELI5: Crystals and Sponge Water 🧽</h3>
    <p>Some salts act like tiny sponges that lock water molecules inside their solid crystal shapes. This is called <strong>water of crystallization</strong>. It gives Blue Vitriol its beautiful blue color.</p>
    <p><strong>Baking Soda (NaHCO₃)</strong>, however, is like dry flour. It has no water trapped inside its grains, so it is just a dry, powdery white baking ingredient!</p>`
  },
  {
    id: "pyq3",
    exam: "neet",
    year: "2024",
    subject: "Biology",
    chapter: "Genetics",
    question: "In a dihybrid cross, if the inheritance of two genes is independent, what is the expected phenotypic ratio in the F2 generation?",
    options: [
      "3 : 1",
      "1 : 2 : 1",
      "9 : 3 : 3 : 1",
      "9 : 7"
    ],
    correctAnswer: 2,
    correctAnswers: [2],
    explanation: `<h3>Mendelian Genetics Phenotypic Ratio Derivation</h3>
    <div class="derivation-step">
      <strong>Step 1: Understanding Dihybrid Cross</strong><br>
      A dihybrid cross involves studying the inheritance of two pairs of contrasting traits simultaneously (e.g. Seed shape: Round/Wrinkled and Seed color: Yellow/Green).
    </div>
    <div class="derivation-step">
      <strong>Step 2: Punnett Square Analysis</strong><br>
      F1 generation individuals are heterozygous for both traits (RrYy). Selfing F1 (RrYy × RrYy) generates a 4×4 Punnett square representing 16 combinations:
      <ul>
        <li>Round Yellow (Dominant-Dominant): <strong>9</strong></li>
        <li>Round Green (Dominant-Recessive): <strong>3</strong></li>
        <li>Wrinkled Yellow (Recessive-Dominant): <strong>3</strong></li>
        <li>Wrinkled Green (Recessive-Recessive): <strong>1</strong></li>
      </ul>
    </div>
    <div class="derivation-step">
      <strong>Step 3: Phenotypic Ratio</strong><br>
      Thus, the phenotypic ratio is <strong>9 : 3 : 3 : 1</strong>.
    </div>`,
    eli5: `<h3>ELI5: Coin Flip Puppy Combinations 🐶</h3>
    <p>Imagine you're breeding puppies with two independent traits: Ear shape (Floppy vs Pointy) and Coat color (Black vs Brown).</p>
    <p>If they inherit these traits independently—like flipping two coins at the same time—the statistical combination results in:
    <ul>
      <li><strong>9</strong> Floppy-Black puppies (dominant traits)</li>
      <li><strong>3</strong> Floppy-Brown puppies</li>
      <li><strong>3</strong> Pointy-Black puppies</li>
      <li><strong>1</strong> Pointy-Brown puppy (both recessive traits)</li>
    </ul>
    That gives us the famous Mendelian ratio: <strong>9:3:3:1</strong>!</p>`
  }
];

export const ACHIEVEMENTS = {
  badges: [
    { id: "streak-1", title: "Daily Legend", desc: "Maintained a 5-day active study streak.", icon: "🔥", unlocked: true, progress: 100 },
    { id: "doubt-10", title: "Concept Crusher", desc: "Resolved 10 doubts using AI doubt solver.", icon: "🔍", unlocked: true, progress: 100 },
    { id: "test-ace", title: "Exam Conqueror", desc: "Scored 90%+ in any Mock Test evaluation.", icon: "🎯", unlocked: true, progress: 100 },
    { id: "battle-5", title: "Arena Knight", desc: "Won 5 Quiz Battles against AI peers.", icon: "⚔️", unlocked: false, progress: 60 }
  ],
  milestones: [
    { title: "First Steps", desc: "Complete 1 syllabus chapter", completed: true },
    { title: "Point Collector", desc: "Earn 2000 total XP points", completed: true },
    { title: "Battle Champion", desc: "Win a live Quiz Battle", completed: false }
  ]
};

export const FLASHCARD_DECKS = {
  chemistry: {
    title: "Class 10 Chemistry Formulas",
    cards: [
      { front: "Balanced reaction of rust formation", back: "4Fe + 3O₂ + 2xH₂O ➔ 2Fe₂O₃·xH₂O (Hydrated Iron oxide)" },
      { front: "Define Decomposition Reaction", back: "A single reactant breaks down to give two or more simpler products (e.g. CaCO₃ ➔ CaO + CO₂)" },
      { front: "Chemical formula of Bleaching Powder", back: "Calcium Oxychloride: CaOCl₂" },
      { front: "Define Plaster of Paris chemical name", back: "Calcium Sulfate Hemihydrate: CaSO₄ · ½H₂O" }
    ]
  },
  physics: {
    title: "Class 10 Physics Laws & Units",
    cards: [
      { front: "Ohm's Law formula", back: "V = I * R (Potential difference = Current * Resistance)" },
      { front: "Resistors in Series (R_s)", back: "R_s = R₁ + R₂ + R₃ + ..." },
      { front: "Resistors in Parallel (R_p)", back: "1/R_p = 1/R₁ + 1/R₂ + 1/R₃ + ..." },
      { front: "Power of a Lens formula & SI unit", back: "P = 1/f (in meters). Unit: Dioptre (D)" }
    ]
  }
};

export const QUIZ_BATTLES = {
  opponents: [
    { name: "Pranav Gowda", school: "DPS Bangalore", avatar: "👦", level: 3, winRate: "72%" },
    { name: "Sneha Iyer", school: "KV New Delhi", avatar: "👧", level: 4, winRate: "80%" },
    { name: "Rahul Deshmukh", school: "Loyola Pune", avatar: "🧑", level: 5, winRate: "88%" }
  ],
  questions: [
    {
      question: "Which metal is liquid at room temperature?",
      options: ["Sodium", "Mercury", "Gallium", "Bromine"],
      correctAnswer: 1,
      explanation: "Mercury (Hg) is the only metallic element that is liquid at standard room temperature and pressure."
    },
    {
      question: "What is the SI unit of electric potential difference?",
      options: ["Ampere", "Ohm", "Volt", "Joule"],
      correctAnswer: 2,
      explanation: "The SI unit of electric potential difference is Volt (V), named after Alessandro Volta."
    },
    {
      question: "If a lens has a focal length of +0.5 meters, what is its power?",
      options: ["+2 Dioptres", "-2 Dioptres", "+0.5 Dioptres", "+5 Dioptres"],
      correctAnswer: 0,
      explanation: "Power P = 1 / f = 1 / +0.5 = +2 Dioptres."
    }
  ]
};

export const DYNAMIC_TUTOR_CONTENT = {
  "Ohm's Law & Resistance": {
    eli5: `<h3>Ohm's Law Analogy: Water Pipe 🎈</h3>
    <p>Imagine electricity is water flowing through a garden hose:</p>
    <ul>
      <li><strong>Voltage (V)</strong> is the water pump pressure. The harder you push, the faster water flows.</li>
      <li><strong>Current (I)</strong> is the flow rate (how much water comes out per second).</li>
      <li><strong>Resistance (R)</strong> is a pinch in the hose. It resists the flow.</li>
    </ul>
    <p>If you double the pump pressure (V), you get double the water flow (I). But if you pinch the hose tighter (increase R), the water flow drops. That is <strong>V = I * R</strong>!</p>`,
    tips: `<h3>CBSE Board Exam Tips: Ohm's Law & Resistance 💡</h3>
    <ul>
      <li><strong>Slope Pitfall:</strong> If they plot Current (I) on the Y-axis and Potential Difference (V) on the X-axis, the slope of the line is <strong>1/R (Conductance)</strong>, not R! Read axes labels carefully.</li>
      <li><strong>Constant Temperature Condition:</strong> Ohm's law only applies if the physical conditions (like temperature) of the conductor remain constant. Resistance of a metallic wire increases with temperature.</li>
    </ul>`,
    numerical: `<h3>Solved Practice Numerical: Ohm's Law & Resistance 📐</h3>
    <p><strong>Question:</strong> An electric heating appliance is connected to a 220V power supply and draws a current of 5A. 
    (a) Calculate its resistance. 
    (b) If it is connected to a 110V supply instead, what current will it draw?</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Solution:</strong></p>
    <p><strong>Given:</strong> V₁ = 220 V, I₁ = 5 A</p>
    <p><strong>Part (a): Find Resistance (R)</strong><br>
    Using Ohm's law, V = I * R &rArr; R = V / I:<br>
    R = 220 / 5 = 44 &Omega;.<br>
    So, the resistance of the heating appliance is <strong>44 &Omega;</strong>.</p>
    <p><strong>Part (b): Find Current (I₂) at V₂ = 110 V</strong><br>
    Since resistance remains constant (R = 44 &Omega;), the new current is:<br>
    I₂ = V₂ / R = 110 / 44 = 2.5 A.<br>
    So, the new current is <strong>2.5 A</strong>.</p>`,
    mockQuestion: {
      question: "If a metallic wire of resistance R is stretched to double its length without changing its density or mass, its new resistance will be:",
      options: [
        "R (Unchanged)",
        "2R (Doubled)",
        "4R (Four times)",
        "R/2 (Halved)"
      ],
      correctAnswer: 2,
      explanation: "When stretched to double its length (L' = 2L), its cross-sectional area becomes half (A' = A/2) to maintain a constant volume. Since resistance is given by R = &rho; L / A, the new resistance is R' = &rho; (2L) / (A/2) = 4 * (&rho; L / A) = 4R."
    }
  },
  "Resistors in Series & Parallel": {
    eli5: `<h3>Series & Parallel Analogy: Traffic Flow 🎈</h3>
    <ul>
      <li><strong>Resistors in Series:</strong> Imagine a single-lane road with three toll booths in a row. Every car must pass through all three booths one after another. The delays add up: <strong>R_s = R₁ + R₂ + R₃</strong>.</li>
      <li><strong>Resistors in Parallel:</strong> Imagine opening more lanes at the toll plaza. Even if one lane is congested, cars can take any of the other paths. The overall traffic flow is smoother, and total delay is smaller than any single booth: <strong>1/R_p = 1/R₁ + 1/R₂ + 1/R₃</strong>.</li>
    </ul>`,
    tips: `<h3>CBSE Board Exam Tips: Resistors in Series & Parallel 💡</h3>
    <ul>
      <li><strong>In Series:</strong> Current remains <em>identical</em> through all resistors, but the total voltage splits: V = V_1 + V_2 + V_3.</li>
      <li><strong>In Parallel:</strong> Voltage remains <em>identical</em> across all resistors, but total current splits: I = I_1 + I_2 + I_3.</li>
      <li><strong>Parallel Rule of Thumb:</strong> The equivalent resistance R_p in a parallel network is always <strong>less than</strong> the smallest individual resistor in that network. Use this to quickly spot check your answers!</li>
    </ul>`,
    numerical: `<h3>Solved Practice Numerical: Resistors in Series & Parallel 📐</h3>
    <p><strong>Question:</strong> Two resistors of 3 &Omega; and 6 &Omega; are connected (a) in series, and (b) in parallel, to a 12V battery. Calculate the total current in each case.</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Solution:</strong></p>
    <p><strong>Case (a): Connected in Series</strong><br>
    Equivalent resistance: R_s = 3 &Omega; + 6 &Omega; = 9 &Omega;.<br>
    Total Current: I = V / R_s = 12 / 9 = 1.33 A.</p>
    <p><strong>Case (b): Connected in Parallel</strong><br>
    Equivalent resistance (1/R_p = 1/R_1 + 1/R_2):<br>
    1/R_p = 1/3 + 1/6 = (2+1)/6 = 3/6 = 1/2 &rArr; R_p = 2 &Omega;.<br>
    Total Current: I = V / R_p = 12 / 2 = 6 A.</p>`,
    mockQuestion: {
      question: "What is the equivalent resistance when three resistors of 6 &Omega; each are connected in parallel?",
      options: [
        "18 &Omega;",
        "6 &Omega;",
        "3 &Omega;",
        "2 &Omega;"
      ],
      correctAnswer: 3,
      explanation: "Using parallel equivalent formula: 1/R_p = 1/6 + 1/6 + 1/6 = 3/6 = 1/2. Thus, R_p = 2 &Omega;."
    }
  },
  "Balanced Chemical Equations": {
    eli5: `<h3>Balancing Equations Analogy: Baking Cookies 🎈</h3>
    <p>Balancing is like a recipe in the kitchen. If the recipe calls for 2 cups of flour + 1 cup of sugar to make 1 batch of cookies, you must keep that exact ratio. You cannot end up with 3 batches of cookies from the same ingredients, and you can't have flour disappear during mixing. Everything that goes in as ingredients must come out in the final cookies. That is the <strong>Law of Conservation of Mass</strong>!</p>`,
    tips: `<h3>CBSE Board Exam Tips: Balanced Chemical Equations 💡</h3>
    <ul>
      <li><strong>Formula Subscripts:</strong> Never modify subscripts (the small numbers inside formulas, like changing H₂O to H₂O₂) to balance an equation. Only change the coefficients (the numbers in front, like 2H₂O).</li>
      <li><strong>Order of Balancing:</strong> Start by balancing elements that appear in only one reactant and one product first (usually metals). Balance Hydrogen and Oxygen last, as they are often scattered across multiple compounds.</li>
    </ul>`,
    numerical: `<h3>Solved Example: Balancing Chemical Reactions 🧪</h3>
    <p><strong>Problem:</strong> Balance the skeletal equation: Fe + H₂O &rarr; Fe₃O₄ + H₂.</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Step-by-Step Balancing:</strong></p>
    <p><strong>Step 1: Balance Iron (Fe)</strong><br>
    LHS has 1 Fe, RHS has 3 Fe. Add coefficient 3 on LHS:<br>
    3Fe + H₂O &rarr; Fe₃O₄ + H₂</p>
    <p><strong>Step 2: Balance Oxygen (O)</strong><br>
    LHS has 1 O, RHS has 4 O. Add coefficient 4 to H₂O on LHS:<br>
    3Fe + 4H₂O &rarr; Fe₃O₄ + H₂</p>
    <p><strong>Step 3: Balance Hydrogen (H)</strong><br>
    LHS now has 8 H (4 * 2), RHS has 2 H. Add coefficient 4 to H₂ on RHS:<br>
    3Fe + 4H₂O &rarr; Fe₃O₄ + 4H₂</p>
    <p>Now all elements are balanced! (Reactants: 3Fe, 8H, 4O ➔ Products: 3Fe, 8H, 4O).</p>`,
    mockQuestion: {
      question: "In the balanced equation: a C₃H₈ + b O₂ ➔ c CO₂ + d H₂O, what are the coefficients a, b, c, and d?",
      options: [
        "1, 3, 3, 4",
        "1, 5, 3, 4",
        "2, 10, 6, 8",
        "1, 4, 3, 4"
      ],
      correctAnswer: 1,
      explanation: "Balancing Carbon gives c = 3. Balancing Hydrogen gives d = 4. Total oxygen atoms on the RHS is (3 * 2) + 4 = 10. Thus, we need 10 Oxygen atoms on the LHS, so b = 5. The ratio is 1, 5, 3, 4."
    }
  },
  "Nature of Roots & Discriminant": {
    eli5: `<h3>Roots Analogy: Coin Metal Detector 🔍</h3>
    <p>Imagine you are searching for gold coins (roots) buried along a trail (the X-axis) using a metal detector called the <strong>Discriminant (D)</strong>:</p>
    <ul>
      <li><strong>If D > 0 (Loud Double Beep):</strong> The detector is loud! You will find exactly <strong>two separate spots</strong> with gold coins.</li>
      <li><strong>If D = 0 (Single Click):</strong> The detector clicks once. There is exactly <strong>one spot</strong>, where two gold coins are stacked exactly on top of each other.</li>
      <li><strong>If D < 0 (Dead Silence):</strong> The detector stays quiet. There are <strong>no coins</strong> along this trail (the parabola floats above the trail and never crosses the ground).</li>
    </ul>`,
    tips: `<h3>CBSE Board Exam Tips: Nature of Roots & Discriminant 💡</h3>
    <ul>
      <li><strong>Equal Roots condition:</strong> Whenever a question states the roots of an equation are equal, set D = b² - 4ac = 0 immediately to solve for unknowns. This is a very common 3-mark board question!</li>
      <li><strong>'Real Roots' vs 'Distinct Real Roots':</strong> If the question asks for 'real roots', write <strong>D &ge; 0</strong>. If it specifies 'distinct real roots', write <strong>D > 0</strong>.</li>
    </ul>`,
    numerical: `<h3>Solved Practice Numerical: Nature of Roots & Discriminant 📐</h3>
    <p><strong>Question:</strong> Find the values of k for which the quadratic equation 2x² + kx + 3 = 0 has two equal real roots.</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Solution:</strong></p>
    <p>Compare the equation with standard form ax² + bx + c = 0:<br>
    a = 2, b = k, c = 3.</p>
    <p>For two equal real roots, the discriminant D must be equal to zero:<br>
    D = b² - 4ac = 0<br>
    k² - 4(2)(3) = 0<br>
    k² - 24 = 0<br>
    k² = 24<br>
    k = &plusmn;&radic;24 = &plusmn;2&radic;6.</p>
    <p>Therefore, the quadratic equation has equal roots when k = &plusmn;2&radic;6.</p>`,
    mockQuestion: {
      question: "What is the nature of roots for the quadratic equation x² - 5x + 7 = 0?",
      options: [
        "Real and Distinct",
        "Real and Equal",
        "No Real Roots",
        "Rational and Equal"
      ],
      correctAnswer: 2,
      explanation: "Calculate Discriminant D = b² - 4ac. Here a = 1, b = -5, c = 7. D = (-5)² - 4(1)(7) = 25 - 28 = -3. Since D < 0, the equation has no real roots."
    }
  },
  "Trigonometric Identities": {
    eli5: `<h3>Trigo Identities Analogy: LEGO Blocks 🧱</h3>
    <p>Think of trigonometric functions like LEGO models. All complex shapes (&tan;, &cot;, &sec;, &csc;) can be broken down into two basic base bricks: <strong>Sine (Red block)</strong> and <strong>Cosine (Blue block)</strong>.</p>
    <p>Once you break everything down into basic blocks, you will see that they fit together perfectly, cancel out, and simplify easily!</p>`,
    tips: `<h3>CBSE Board Exam Tips: Trigonometric Identities 💡</h3>
    <ul>
      <li><strong>Default Strategy:</strong> When stuck proving an identity, convert all terms on LHS (like &tan; &theta;, &sec; &theta;, etc.) into &sin; &theta; and &cos; &theta;. In 90% of cases, the proof simplifies immediately after this.</li>
      <li><strong>Complex to Simple:</strong> Always start simplifying from the side that looks more complicated (usually Left-Hand Side) and work your way towards the simpler side (Right-Hand Side).</li>
    </ul>`,
    numerical: `<h3>Solved Example: Proving Trigonometric Identities 📐</h3>
    <p><strong>Prove that:</strong> (&sec; &theta; + &tan; &theta;)(1 - &sin; &theta;) = &cos; &theta;</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Proof:</strong></p>
    <p>Let's simplify the Left-Hand Side (LHS) by converting terms to &sin; and &cos;:</p>
    <p>LHS = (1 / &cos; &theta; + &sin; &theta; / &cos; &theta;)(1 - &sin; &theta;)<br>
    LHS = ((1 + &sin; &theta;) / &cos; &theta;)(1 - &sin; &theta;)<br>
    LHS = ((1 + &sin; &theta;)(1 - &sin; &theta;)) / &cos; &theta;</p>
    <p>Using algebraic identity (a+b)(a-b) = a² - b²:<br>
    LHS = (1 - &sin;² &theta;) / &cos; &theta;</p>
    <p>Using identity &sin;² &theta; + &cos;² &theta; = 1 &rArr; 1 - &sin;² &theta; = &cos;² &theta;:<br>
    LHS = &cos;² &theta; / &cos; &theta; = &cos; &theta; = RHS.<br>
    <strong>Hence Proved!</strong></p>`,
    mockQuestion: {
      question: "Evaluate: 9 sec² A - 9 tan² A",
      options: [
        "1",
        "9",
        "0",
        "-9"
      ],
      correctAnswer: 1,
      explanation: "Factor out the 9: 9(sec² A - tan² A). We know the fundamental trigonometric identity: 1 + tan² A = sec² A &rArr; sec² A - tan² A = 1. Thus, 9 * 1 = 9."
    }
  }
};

