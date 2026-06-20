// app.js - Main Application Controller for VidyaOS

import { 
  CBSE_SUBJECTS, 
  NCERT_CONTENT_REGISTRY,
  MOCK_TESTS, 
  PRESET_DOUBTS, 
  DEFAULT_STUDENT, 
  MOCK_TEACHER, 
  CHAT_BOT_RESPONSES,
  JEE_PREP_DATA,
  NEET_PREP_DATA,
  ACHIEVEMENTS,
  FLASHCARD_DECKS,
  QUIZ_BATTLES,
  DYNAMIC_TUTOR_CONTENT
} from './mockData.js';

// Global Application State
const state = {
  currentRole: 'student', // 'student', 'parent', 'teacher'
  student: { ...DEFAULT_STUDENT },
  teacher: { ...MOCK_TEACHER },
  activeViews: {
    student: 'student-dash',
    parent: 'parent-dash',
    teacher: 'teacher-dash'
  },
  tutor: {
    currentSubject: 'science',
    currentChapter: 'electricity',
    complexity: 'standard',
    activeTopic: null,
    activeQuiz: null,
    chatHistory: [
      { sender: 'bot', text: CHAT_BOT_RESPONSES.greeting, suggestions: ["Ohm's Law 💡", "Balance Equations 🔬", "Quadratic Formula 📐", "Explain Prism 🌈"] }
    ]
  },
  activeTest: {
    id: null,
    inProgress: false,
    questions: [],
    answers: {}, // questionId -> selectedOptionIndex
    currentQuestionIndex: 0,
    timeRemaining: 0,
    timerInterval: null
  },
  jeeneet: {
    activeStream: 'jee', // 'jee' or 'neet'
    challengerAnswered: false,
    selectedOption: null,
    countdownInterval: null
  },
  flashcards: {
    activeDeck: 'chemistry',
    currentCardIndex: 0
  },
  battle: {
    activeOpponent: null,
    currentQuestionIndex: 0,
    playerHp: 100,
    opponentHp: 100,
    roundTimeRemaining: 10,
    timerInterval: null,
    opponentAnswerTimeout: null
  },
  currentDoubt: null,
  doubtMode: 'standard' // 'standard' or 'eli5'
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  const initSteps = [
    { name: 'initLoginScreen', fn: initLoginScreen },
    { name: 'initRoleSwitcher', fn: initRoleSwitcher },
    { name: 'initNavigation', fn: initNavigation },
    { name: 'initDashboard', fn: initDashboard },
    { name: 'initTutor', fn: initTutor },
    { name: 'initSyllabus', fn: initSyllabus },
    { name: 'initDoubtSolver', fn: initDoubtSolver },
    { name: 'initMockTests', fn: initMockTests },
    { name: 'initPlanner', fn: initPlanner },
    { name: 'initJeeNeetPrep', fn: initJeeNeetPrep },
    { name: 'initParentDashboard', fn: initParentDashboard },
    { name: 'initTeacherDashboard', fn: initTeacherDashboard },
    { name: 'initAchievements', fn: initAchievements },
    { name: 'initFlashcards', fn: initFlashcards },
    { name: 'initQuizBattles', fn: initQuizBattles },
    { name: 'initRoadmap', fn: initRoadmap }
  ];

  initSteps.forEach(step => {
    try {
      step.fn();
    } catch (err) {
      console.error(`[CRITICAL] Error initializing ${step.name}:`, err);
    }
  });
  
  // Set default view on load
  try {
    switchRole(state.currentRole);
  } catch (err) {
    console.error(`[CRITICAL] Error setting default view:`, err);
  }
});

// ================= UTILITIES & NOTIFICATIONS =================
function showToast(message, type = 'success') {
  // Create simple elegant toast container if not exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'glass-panel';
  toast.style.cssText = `
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    animation: slideInToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background: ${type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    border-color: ${type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'};
    color: var(--text-main);
  `;
  
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✓' : '⚠️';
  toast.appendChild(icon);

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  container.appendChild(toast);

  // Remove toast after 3s
  setTimeout(() => {
    toast.style.animation = 'slideOutToast 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value);
  return div.innerHTML;
}

// Add CSS keyframes for Toast dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes slideInToast {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOutToast {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(30px); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);


// ================= ROLE MANAGEMENT =================
function initRoleSwitcher() {
  const btn = document.getElementById('roleSwitcherBtn');
  const dropdown = document.getElementById('roleDropdown');
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
    btn.setAttribute('aria-expanded', dropdown.classList.contains('show').toString());
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
  });

  const opts = dropdown.querySelectorAll('.role-opt');
  opts.forEach(opt => {
    opt.setAttribute('role', 'button');
    opt.setAttribute('tabindex', '0');
    opt.setAttribute('aria-pressed', opt.classList.contains('active').toString());

    const selectRole = () => {
      opts.forEach(o => o.classList.remove('active'));
      opts.forEach(o => o.setAttribute('aria-pressed', 'false'));
      opt.classList.add('active');
      opt.setAttribute('aria-pressed', 'true');
      const selectedRole = opt.dataset.role;
      switchRole(selectedRole);
    };

    opt.addEventListener('click', selectRole);
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRole();
      }
    });
  });
}

function switchRole(role) {
  state.currentRole = role;
  const appShell = document.getElementById('appShell');
  const activeLabel = document.getElementById('activeRoleLabel');
  
  // Set class on container to toggle visible elements via CSS variables
  if (appShell) appShell.className = `app-container role-${role}`;
  
  // Update header text label
  if (activeLabel) {
    if (role === 'student') activeLabel.innerHTML = '👤 Student Mode';
    else if (role === 'parent') activeLabel.innerHTML = '👪 Parent Mode';
    else if (role === 'teacher') activeLabel.innerHTML = '🏫 Teacher Mode';
  }
  
  // Toggle the visible sidebar and content panel
  document.querySelectorAll('.role-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  const targetPanel = document.querySelector(`.${role}-panel`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Activate default view for this role
  const defaultView = state.activeViews[role];
  switchView(role, defaultView);
}

// ================= SPA NAVIGATION =================
function initNavigation() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');

    const openView = () => {
      const targetView = link.dataset.target;
      switchView(state.currentRole, targetView);
    };

    link.addEventListener('click', openView);
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openView();
      }
    });
  });
}

function switchView(role, viewId) {
  // Update state tracking
  state.activeViews[role] = viewId;
  
  // Update sidebar active status
  const sidebar = document.querySelector(`.layout-body aside`);
  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
      if (link.dataset.target === viewId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Update content view panel visibility
  const roleContainer = document.querySelector(`.${role}-panel`);
  if (roleContainer) {
    roleContainer.querySelectorAll('.panel-view').forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  // Custom view hook updates
  if (viewId === 'student-dash') {
    renderDailyTasks();
    renderRoadmap();
  } else if (viewId === 'parent-dash') {
    renderParentDashboard();
  } else if (viewId === 'teacher-dash') {
    renderTeacherDashboard();
  } else if (viewId === 'teacher-portion') {
    renderTeacherPortionManager();
  } else if (viewId === 'student-achievements') {
    renderAchievements();
  } else if (viewId === 'student-flashcards') {
    renderFlashcards();
  } else if (viewId === 'student-battles') {
    renderBattleLobby();
  } else if (viewId === 'student-syllabus') {
    renderSyllabusWorkspace();
  }
}


// ================= STUDENT: DASHBOARD =================
function initDashboard() {
  // Welcome card title
  const welcomeTitle = document.getElementById('welcomeTitle');
  if (welcomeTitle) welcomeTitle.innerText = `Namaste, ${state.student.name}! 🚀`;
  renderStudentContext();
  
  // Set progress bars dynamically from student state
  const sciProgressText = document.getElementById('sciProgressText');
  const sciProgressBar = document.getElementById('sciProgressBar');
  const mathProgressText = document.getElementById('mathProgressText');
  const mathProgressBar = document.getElementById('mathProgressBar');
  
  if (sciProgressText) sciProgressText.innerText = `${state.student.syllabusCompletion.science}%`;
  if (sciProgressBar) sciProgressBar.style.width = `${state.student.syllabusCompletion.science}%`;
  if (mathProgressText) mathProgressText.innerText = `${state.student.syllabusCompletion.mathematics}%`;
  if (mathProgressBar) mathProgressBar.style.width = `${state.student.syllabusCompletion.mathematics}%`;

  // Chapter pathways triggers (redirecting to AI Tutor on click)
  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const subj = card.dataset.subj;
      state.tutor.currentSubject = subj;
      // Auto-set the first chapter of this subject
      const chapters = CBSE_SUBJECTS[subj].chapters;
      if (chapters.length > 0) {
        state.tutor.currentChapter = chapters[0].id;
      }
      
      // Navigate to Tutor view
      switchView('student', 'student-tutor');
      // Load chapters and launch chat
      renderTutorSidebar();
      startTutorConversation();
    });
  });
  
  renderDailyTasks();
  renderAnnouncements();
}

function renderStudentContext() {
  const container = document.getElementById('studentContextRow');
  if (!container) return;

  container.innerHTML = `
    <span>${escapeHtml(state.student.classLevel)}-${escapeHtml(state.student.section)}</span>
    <span>${escapeHtml(state.student.board)}</span>
    <span>Academic Year ${escapeHtml(state.student.academicYear)}</span>
    <span>Roll No. ${escapeHtml(state.student.rollNumber)}</span>
  `;
}

function renderDailyTasks() {
  const container = document.getElementById('dailyTaskList');
  if (!container) return;
  container.innerHTML = '';

  state.student.dailyTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      handleTaskCompletion(checkbox.checked);
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.title;

    item.appendChild(checkbox);
    item.appendChild(text);
    container.appendChild(item);
  });
}

function renderAnnouncements() {
  const container = document.getElementById('announcementsList');
  if (!container) return;
  container.innerHTML = '';
  
  state.student.announcements.forEach(ann => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.style.flexDirection = 'column';
    item.style.gap = '4px';
    item.style.cursor = 'default';
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 12px;
      font-weight: 700;
      color: var(--accent-indigo);
    `;
    
    const title = document.createElement('span');
    title.textContent = `${ann.sender} • ${ann.title}`;
    
    const date = document.createElement('span');
    date.textContent = ann.date;
    date.style.color = 'var(--text-dim)';
    
    header.appendChild(title);
    header.appendChild(date);
    
    const desc = document.createElement('p');
    desc.style.cssText = `
      font-size: 13px;
      color: var(--text-muted);
    `;
    desc.textContent = ann.content;

    item.appendChild(header);
    item.appendChild(desc);
    container.appendChild(item);
  });
}

function handleTaskCompletion(isCompleted) {
  // If checked, award XP
  const xpReward = 50;
  if (isCompleted) {
    state.student.xp += xpReward;
    showToast(`Goal Completed! +${xpReward} XP Earned`);
  } else {
    state.student.xp -= xpReward;
  }
  
  // Calculate level up
  if (state.student.xp >= state.student.nextLevelXp) {
    state.student.level += 1;
    state.student.xp = state.student.xp - state.student.nextLevelXp;
    state.student.nextLevelXp = Math.floor(state.student.nextLevelXp * 1.2);
    showToast(`LEVEL UP! You reached Level ${state.student.level}! 🎉`, 'success');
  }

  // Update header indicators
  document.getElementById('xpCount').textContent = state.student.xp;
  document.getElementById('levelCount').textContent = `Lvl ${state.student.level}`;
}


// ================= STUDENT: AI TUTOR =================
function initTutor() {
  renderTutorSidebar();
  renderTutorSource();

  document.querySelectorAll('.complexity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.complexity-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      state.tutor.complexity = btn.dataset.complexity;
      showToast(`Tutor mode changed to ${btn.textContent}`);
    });
  });
  
  // Send message triggers
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  
  sendBtn.addEventListener('click', () => submitChatMessage());
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'enter' || e.keyCode === 13) {
      submitChatMessage();
    }
  });

  // Voice recording binds
  const micBtn = document.getElementById('tutorVoiceMicBtn');
  const stopRecBtn = document.getElementById('stopVoiceRecBtn');
  const voiceOverlay = document.getElementById('voiceWaveOverlay');

  if (micBtn && stopRecBtn && voiceOverlay) {
    micBtn.addEventListener('click', () => {
      voiceOverlay.style.display = 'flex';
      showToast("Listening to voice doubt query...");
    });

    stopRecBtn.addEventListener('click', () => {
      voiceOverlay.style.display = 'none';
      const dictations = [
        "Why does resistance increase with temperature?",
        "Can you give me an analogy for Ohm's law?",
        "How does light refract in a glass slab?",
        "Explain nature of roots in simple terms."
      ];
      const randomDictation = dictations[Math.floor(Math.random() * dictations.length)];
      chatInput.value = randomDictation;
      showToast("Voice query transcribed successfully!");
      submitChatMessage();
    });
  }

  // Inject suggestions container if not already present
  const chatInputArea = document.querySelector('.chat-input-area');
  if (chatInputArea && !document.getElementById('tutorSuggestionsArea')) {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'chat-suggestions-area';
    suggestionsDiv.id = 'tutorSuggestionsArea';
    suggestionsDiv.style.display = 'none';
    chatInputArea.parentNode.insertBefore(suggestionsDiv, chatInputArea);
  }

  // Load default welcome chat
  renderChatHistory();
}

function renderTutorSource() {
  const source = document.getElementById('ncertTutorSource');
  const verified = document.getElementById('ncertTutorVerified');
  if (!source || !verified) return;

  source.textContent = `${NCERT_CONTENT_REGISTRY.classLabel} NCERT | Reprint ${NCERT_CONTENT_REGISTRY.tutoringCycle}`;
  verified.textContent = `Verified ${NCERT_CONTENT_REGISTRY.lastVerified} | Rationalised syllabus applied`;
}

function getTutorComplexityGuidance(topic) {
  const modes = {
    foundation: {
      label: 'Foundation',
      approach: `Start with a simple everyday analogy and define the key words used in ${topic}.`,
      practice: 'Try 2 guided recall questions before moving to calculations.'
    },
    standard: {
      label: 'Standard',
      approach: `Follow the NCERT explanation sequence for ${topic}, then work through one solved example.`,
      practice: 'Solve 5 NCERT-aligned MCQs and review the diagnostic feedback.'
    },
    advanced: {
      label: 'Advanced',
      approach: `Connect ${topic} to derivations, edge cases, and common CBSE exam traps.`,
      practice: 'Attempt 3 HOTS questions and explain why the distractor options are wrong.'
    },
    'deep-dive': {
      label: 'Deep Dive',
      approach: `Map the prerequisites, derivation path, experiment context, and extension concepts behind ${topic}.`,
      practice: 'Build a concept map, solve mixed questions, and compare the idea with JEE or NEET applications.'
    }
  };

  return modes[state.tutor.complexity] || modes.standard;
}

function renderTutorSidebar() {
  const container = document.getElementById('tutorChaptersList');
  container.innerHTML = '';

  // Render Science Chapters
  const sciHeading = document.createElement('h4');
  sciHeading.textContent = "🔬 Science Chapters";
  sciHeading.style.cssText = "font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-top: 10px;";
  container.appendChild(sciHeading);

  CBSE_SUBJECTS.science.chapters.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = `chapter-selector-btn ${state.tutor.currentChapter === ch.id ? 'active' : ''}`;
    btn.textContent = ch.title;
    btn.addEventListener('click', () => {
      selectChapter('science', ch.id);
    });
    container.appendChild(btn);
  });

  // Render Math Chapters
  const mathHeading = document.createElement('h4');
  mathHeading.textContent = "📐 Maths Chapters";
  mathHeading.style.cssText = "font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-top: 12px;";
  container.appendChild(mathHeading);

  CBSE_SUBJECTS.mathematics.chapters.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = `chapter-selector-btn ${state.tutor.currentChapter === ch.id ? 'active' : ''}`;
    btn.textContent = ch.title;
    btn.addEventListener('click', () => {
      selectChapter('mathematics', ch.id);
    });
    container.appendChild(btn);
  });
}

function selectChapter(subject, chapterId) {
  state.tutor.currentSubject = subject;
  state.tutor.currentChapter = chapterId;
  state.tutor.activeQuiz = null;
  state.tutor.activeTopic = null;
  
  // Re-highlight button
  document.querySelectorAll('.chapter-selector-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === CBSE_SUBJECTS[subject].chapters.find(c => c.id === chapterId).title) {
      btn.classList.add('active');
    }
  });

  // Reset chat and trigger tutorial start
  state.tutor.chatHistory = [];
  renderChatHistory();
  startTutorConversation();
}

function renderChatHistory() {
  const chatBox = document.getElementById('chatHistoryBox');
  chatBox.innerHTML = '';

  state.tutor.chatHistory.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.sender}`;
    
    // Support basic markup/newlines or HTML if sent by bot
    if (msg.sender === 'bot') {
      div.innerHTML = msg.text;
    } else {
      div.textContent = msg.text;
    }
    
    chatBox.appendChild(div);
  });
  
  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  // Render suggestions chips
  renderSuggestionChips();
}

function startTutorConversation() {
  const subject = state.tutor.currentSubject;
  const chapterId = state.tutor.currentChapter;
  const chapter = CBSE_SUBJECTS[subject].chapters.find(c => c.id === chapterId);
  
  const introMsg = `<h3>Let's study ${chapter.title}!</h3>
  <p>I have outlined the main syllabus benchmarks below. Click on any topic to generate a quick study guide, or type your question details:</p>
  <div style="display:flex; flex-direction:column; gap:6px; margin-top: 10px;">
    ${chapter.topics.map(topic => `<button class="sample-doubt-btn topic-pill-btn" style="padding: 8px 12px; margin-bottom: 2px;">📖 Revise: ${topic}</button>`).join('')}
  </div>`;
  
  state.tutor.chatHistory.push({ sender: 'bot', text: introMsg });
  renderChatHistory();

  // Attach dynamic listener to topic pills
  setTimeout(() => {
    const chatBox = document.getElementById('chatHistoryBox');
    chatBox.querySelectorAll('.topic-pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const topicText = pill.textContent.replace('📖 Revise: ', '');
        triggerTutorTopicExplanation(topicText);
      });
    });
  }, 100);
}

function submitChatMessage() {
  const input = document.getElementById('chatInput');
  const val = input.value.trim();
  if (!val) return;

  // Add user message
  state.tutor.chatHistory.push({ sender: 'user', text: val });
  renderChatHistory();
  input.value = '';

  // Reset active quiz to prevent state conflicts
  state.tutor.activeQuiz = null;

  // Hide suggestions container while bot compiles response
  const container = document.getElementById('tutorSuggestionsArea');
  if (container) container.style.display = 'none';

  // Simulated AI response loading bubble
  const chatBox = document.getElementById('chatHistoryBox');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-msg bot';
  loadingDiv.innerHTML = `<span style="font-style:italic; color: var(--text-dim);">Tutor is thinking...</span>`;
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Generate automated reply
  setTimeout(() => {
    loadingDiv.remove();
    let replyText = CHAT_BOT_RESPONSES.generalFallback;
    let nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"];

    // Custom keywords responses
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('balancing') || lowerVal.includes('chemical equation')) {
      state.tutor.activeTopic = "Balanced Chemical Equations";
      replyText = `<h3>How to Balance Chemical Equations</h3>
      <p>Balancing is governed by the <strong>Law of Conservation of Mass</strong>. Let's look at balancing the reaction of hydrogen and oxygen: </p>
      <div class="code-box">H₂ (g) + O₂ (g) ➔ H₂O (l) [Unbalanced]</div>
      <p>Follow these steps:</p>
      <ul>
        <li><strong>Step 1:</strong> List the elements on both sides: Reactants (2H, 2O) ➔ Products (2H, 1O).</li>
        <li><strong>Step 2:</strong> Balance Oxygen by adding coefficient 2 to H₂O: H₂ + O₂ ➔ 2H₂O. Reactants (2H, 2O) ➔ Products (4H, 2O).</li>
        <li><strong>Step 3:</strong> Balance Hydrogen by adding coefficient 2 to H₂: 2H₂ + O₂ ➔ 2H₂O. Reactants (4H, 2O) ➔ Products (4H, 2O). Now it is balanced!</li>
      </ul>`;
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Show solved example 🧪", "Give me a mock question 📝"];
    } else if (lowerVal.includes('sridharacharya') || lowerVal.includes('quadratic formula')) {
      state.tutor.activeTopic = "Nature of Roots & Discriminant";
      replyText = `<h3>Sridharacharya Formula (Quadratic Formula)</h3>
      <p>For any quadratic equation in the form <strong>ax² + bx + c = 0</strong>, the roots are calculated by:</p>
      <div class="math-box">x = [-b ± √(b² - 4ac)] / 2a</div>
      <p>Where <strong>b² - 4ac</strong> is the Discriminant (D) which decides the nature of the roots.</p>`;
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"];
    } else if (lowerVal.includes('prism') || lowerVal.includes('refraction')) {
      state.tutor.activeTopic = "Refraction Through a Glass Prism";
      replyText = `<h3>Refraction Through a Glass Prism</h3>
      <p>When a ray of light passes through a triangular glass prism, it bends twice: once when entering the glass (towards normal) and once when exiting (away from normal).</p>
      <p>Due to the angle between the refracting faces (Angle of Prism, A), the emergent ray is bent at an angle to the incident ray. This angle is called the <strong>Angle of Deviation (D)</strong>.</p>`;
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"];
    } else if (lowerVal.includes('ohm') || lowerVal.includes('resistance')) {
      state.tutor.activeTopic = "Ohm's Law & Resistance";
      replyText = getTopicStandardResponse("Ohm's Law & Resistance");
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"];
    }

    state.tutor.chatHistory.push({ sender: 'bot', text: replyText, suggestions: nextSuggestions });
    renderChatHistory();
  }, 1000);
}

function triggerTutorTopicExplanation(topic) {
  state.tutor.activeTopic = topic;
  state.tutor.chatHistory.push({ sender: 'user', text: `Revise: ${topic}` });
  renderChatHistory();

  // Loading
  const chatBox = document.getElementById('chatHistoryBox');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-msg bot';
  loadingDiv.innerHTML = `<span style="font-style:italic; color: var(--text-dim);">Generating personalized explanation for ${topic}...</span>`;
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    loadingDiv.remove();
    
    const guidance = getTutorComplexityGuidance(topic);
    const standardExpl = getTopicStandardResponse(topic);

    // Build context explanation
    const replyText = `${standardExpl}
    <div style="margin-top: 12px; border-top: 1px dashed var(--glass-border); padding-top: 12px;">
      <p style="font-size: 12px; color: var(--text-dim);"><strong>${guidance.label} Mode Guidance:</strong> ${guidance.approach}</p>
      <p style="font-size: 12px; color: var(--text-dim);"><strong>Recommended practice:</strong> ${guidance.practice}</p>
      <p style="font-size: 11px; color: var(--text-dim); margin-top: 4px;"><strong>Source:</strong> NCERT ${NCERT_CONTENT_REGISTRY.classLabel}, verified reprint ${NCERT_CONTENT_REGISTRY.tutoringCycle}. Rationalised syllabus applied.</p>
    </div>`;
    
    const topicData = DYNAMIC_TUTOR_CONTENT[topic] || getFallbackTopicData(topic);
    const isChem = topic.includes("Chemical") || topic.includes("Decomposition") || topic.includes("Displacement") || topic.includes("Oxidation");
    
    const nextSuggestions = [
      "Simplify this (ELI5) 🎈",
      "Show CBSE Board Tips 💡",
      "Give me a mock question 📝"
    ];
    if (topicData.numerical) {
      nextSuggestions.unshift(isChem ? "Show solved example 🧪" : "Solve a numerical 📐");
    }

    state.tutor.chatHistory.push({ 
      sender: 'bot', 
      text: replyText, 
      suggestions: nextSuggestions 
    });
    renderChatHistory();
  }, 900);
}

// ================= STUDY TUTOR SUGGESTION CHIPS LOGIC =================

function renderSuggestionChips() {
  const container = document.getElementById('tutorSuggestionsArea');
  if (!container) return;

  const history = state.tutor.chatHistory;
  if (history.length === 0) {
    container.style.display = 'none';
    return;
  }

  const lastMsg = history[history.length - 1];
  if (lastMsg.sender === 'bot' && lastMsg.suggestions && lastMsg.suggestions.length > 0 && !state.tutor.activeQuiz) {
    container.innerHTML = '';
    container.style.display = 'flex';

    lastMsg.suggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-chip-btn';
      btn.textContent = suggestion;
      btn.addEventListener('click', () => handleSuggestionClick(suggestion));
      container.appendChild(btn);
    });
  } else {
    container.style.display = 'none';
  }
}

function handleSuggestionClick(suggestion) {
  state.tutor.chatHistory.push({ sender: 'user', text: suggestion });
  renderChatHistory();

  const container = document.getElementById('tutorSuggestionsArea');
  if (container) container.style.display = 'none';

  const chatBox = document.getElementById('chatHistoryBox');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-msg bot';
  loadingDiv.innerHTML = `<span style="font-style:italic; color: var(--text-dim);">Generating response...</span>`;
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    loadingDiv.remove();
    let replyText = '';
    let nextSuggestions = [];

    const cleanSuggestion = suggestion.replace(/[🎈💡📐📝🔬🌈🧪]/g, '').trim().toLowerCase();

    // Check if it matches initial suggestion list
    if (cleanSuggestion === "ohm's law") {
      state.tutor.activeTopic = "Ohm's Law & Resistance";
      replyText = getTopicStandardResponse("Ohm's Law & Resistance");
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"];
    } else if (cleanSuggestion === "balance equations") {
      state.tutor.activeTopic = "Balanced Chemical Equations";
      replyText = getTopicStandardResponse("Balanced Chemical Equations");
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Show solved example 🧪", "Give me a mock question 📝"];
    } else if (cleanSuggestion === "quadratic formula") {
      state.tutor.activeTopic = "Nature of Roots & Discriminant";
      replyText = getTopicStandardResponse("Nature of Roots & Discriminant");
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"];
    } else if (cleanSuggestion === "explain prism") {
      state.tutor.activeTopic = "Refraction Through a Glass Prism";
      replyText = getTopicStandardResponse("Refraction Through a Glass Prism");
      nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"];
    } else {
      const activeTopic = state.tutor.activeTopic || "Ohm's Law & Resistance";
      const topicData = DYNAMIC_TUTOR_CONTENT[activeTopic] || getFallbackTopicData(activeTopic);
      const isChem = activeTopic.includes("Chemical") || activeTopic.includes("Decomposition") || activeTopic.includes("Displacement") || activeTopic.includes("Oxidation");

      if (cleanSuggestion.includes("simplify this") || cleanSuggestion.includes("eli5")) {
        replyText = topicData.eli5;
        nextSuggestions = ["Show CBSE Board Tips 💡", "Give me a mock question 📝"];
        if (topicData.numerical) {
          nextSuggestions.unshift(isChem ? "Show solved example 🧪" : "Solve a numerical 📐");
        }
      } else if (cleanSuggestion.includes("board tips") || cleanSuggestion.includes("cbse")) {
        replyText = topicData.tips;
        nextSuggestions = ["Simplify this (ELI5) 🎈", "Give me a mock question 📝"];
        if (topicData.numerical) {
          nextSuggestions.unshift(isChem ? "Show solved example 🧪" : "Solve a numerical 📐");
        }
      } else if (cleanSuggestion.includes("solve a numerical") || cleanSuggestion.includes("solved example") || cleanSuggestion.includes("numerical") || cleanSuggestion.includes("example")) {
        replyText = topicData.numerical;
        nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"];
      } else if (cleanSuggestion.includes("mock question") || cleanSuggestion.includes("quiz") || cleanSuggestion.includes("another numerical") || cleanSuggestion.includes("another question")) {
        startInteractiveQuiz(activeTopic);
        return;
      } else {
        replyText = CHAT_BOT_RESPONSES.generalFallback;
        nextSuggestions = ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"];
      }
    }

    state.tutor.chatHistory.push({
      sender: 'bot',
      text: replyText,
      suggestions: nextSuggestions
    });
    renderChatHistory();
  }, 1000);
}

function getTopicStandardResponse(topic) {
  if (topic === "Ohm's Law & Resistance") {
    return `<h3>Ohm's Law & Resistance</h3>
    <p>Ohm's law states that the current (I) flowing through a conductor is directly proportional to the potential difference (V) across its ends, provided temperature remains constant.</p>
    <div class="math-box"><strong>V = I &times; R</strong></div>
    <p>Where <strong>R</strong> is the resistance of the conductor, representing its opposition to electric current. The SI unit of resistance is Ohm (&Omega;).</p>`;
  } else if (topic === "Balanced Chemical Equations") {
    return `<h3>Balanced Chemical Equations</h3>
    <p>A balanced chemical equation has an equal number of atoms of each element on both the reactant and product sides. This satisfies the <strong>Law of Conservation of Mass</strong> which states that mass can neither be created nor destroyed in a chemical reaction.</p>
    <div class="code-box">Reactants Atoms = Products Atoms</div>`;
  } else if (topic === "Nature of Roots & Discriminant") {
    return `<h3>Nature of Roots & Discriminant</h3>
    <p>For a quadratic equation ax² + bx + c = 0, the discriminant D determines the nature of its roots:</p>
    <div class="math-box"><strong>D = b² - 4ac</strong></div>
    <ul>
      <li><strong>D > 0:</strong> Two distinct real roots.</li>
      <li><strong>D = 0:</strong> Two equal real roots.</li>
      <li><strong>D < 0:</strong> No real roots.</li>
    </ul>`;
  } else if (topic === "Refraction Through a Glass Prism") {
    return `<h3>Refraction Through a Glass Prism</h3>
    <p>When light enters a triangular glass prism, it bends twice (at the entering and exiting faces). Due to the angle of the prism, the emergent ray deviates from its original path by an angle called the <strong>Angle of Deviation (D)</strong>.</p>`;
  } else if (topic === "Resistors in Series & Parallel") {
    return `<h3>Resistors in Series & Parallel</h3>
    <p>Resistors can be connected in two main configurations:</p>
    <ul>
      <li><strong>Series:</strong> Current is the same. R_s = R₁ + R₂ + R₃.</li>
      <li><strong>Parallel:</strong> Voltage is the same. 1/R_p = 1/R₁ + 1/R₂ + 1/R₃.</li>
    </ul>`;
  }
  
  return `<h3>Syllabus Overview: ${topic}</h3>
  <p>Based on the CBSE curriculum, this topic is a core standard. Here is the step-by-step breakdown:</p>
  <div class="math-box">Core Objective: Master basic concepts and derivations of ${topic}</div>
  <p>Practice standard CBSE Board questions, check formula derivations, and review notes.</p>`;
}

function getFallbackTopicData(topic) {
  return {
    eli5: `<h3>ELI5 Analogy: ${topic} 🎈</h3>
    <p>Think of <strong>${topic}</strong> like a team of players. Each player has a specific role, and they must work together in sync. If one player is missing or changes their position, the whole team dynamic adjusts to keep things balanced!</p>`,
    tips: `<h3>CBSE Board Exam Tips: ${topic} 💡</h3>
    <ul>
      <li><strong>Focus Area:</strong> Definitions, core SI units, and diagram labeling are frequently asked.</li>
      <li><strong>Marking Guide:</strong> Step-by-Step explanation of answers is vital for securing full marks in CBSE Section C.</li>
    </ul>`,
    numerical: `<h3>Solved Practice Problem: ${topic} 📐</h3>
    <p><strong>Question:</strong> State and explain a standard application of ${topic} under standard exam conditions.</p>
    <hr style="border:0; border-top:1px dashed var(--glass-border); margin:12px 0;">
    <p><strong>Solution:</strong></p>
    <p>Define variables, write the appropriate equation, and verify units. E.g., if checking outputs, double check that calculations are in standard SI units before writing the final value.</p>`,
    mockQuestion: {
      question: `Which of the following statements is true regarding the core concept of ${topic}?`,
      options: [
        "A) It is governed by standard conservation principles.",
        "B) It varies inversely under all physical conditions.",
        "C) It is only applicable to Class 9 syllabus.",
        "D) None of the above."
      ],
      correctAnswer: 0,
      explanation: `The concept of ${topic} is fundamental to standard CBSE curriculum and is governed by conservation laws and definitions.`
    }
  };
}

function startInteractiveQuiz(topic) {
  const topicData = DYNAMIC_TUTOR_CONTENT[topic] || getFallbackTopicData(topic);
  const quiz = topicData.mockQuestion;

  state.tutor.activeQuiz = {
    question: quiz.question,
    options: quiz.options,
    correctAnswer: quiz.correctAnswer,
    explanation: quiz.explanation,
    topic: topic,
    selected: null
  };

  const quizHtml = `<h3>📝 Practice Quiz: ${topic}</h3>
  <p style="margin-bottom: 12px; font-weight: 500;">${quiz.question}</p>
  <div class="chat-options-container" id="chatQuizOptions">
    ${quiz.options.map((opt, idx) => `
      <button class="chat-option-btn" data-index="${idx}">${opt}</button>
    `).join('')}
  </div>`;

  state.tutor.chatHistory.push({
    sender: 'bot',
    text: quizHtml
  });
  renderChatHistory();

  setTimeout(() => {
    const optionBtns = document.querySelectorAll('#chatQuizOptions .chat-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIdx = parseInt(e.currentTarget.getAttribute('data-index'));
        submitQuizAnswer(selectedIdx);
      });
    });
  }, 100);
}

function submitQuizAnswer(selectedIdx) {
  if (!state.tutor.activeQuiz || state.tutor.activeQuiz.selected !== null) return;

  state.tutor.activeQuiz.selected = selectedIdx;
  const quiz = state.tutor.activeQuiz;
  const isCorrect = selectedIdx === quiz.correctAnswer;

  const optionBtns = document.querySelectorAll('#chatQuizOptions .chat-option-btn');
  optionBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === quiz.correctAnswer) {
      btn.classList.add('correct-opt');
    } else if (idx === selectedIdx) {
      btn.classList.add('incorrect-opt');
    }
  });

  let resultHeader = '';
  let xpAwarded = 0;
  if (isCorrect) {
    resultHeader = `<h4 style="color: var(--accent-green); margin-bottom: 8px;">✓ Correct! (+15 XP Awarded) 🏆</h4>`;
    xpAwarded = 15;
    state.student.xp += xpAwarded;
    
    if (state.student.xp >= state.student.nextLevelXp) {
      state.student.level += 1;
      state.student.nextLevelXp = Math.floor(state.student.nextLevelXp * 1.5);
      showToast(`Level Up! You are now Level ${state.student.level}! 🎉`);
    }
    updateHeaderStats();
  } else {
    resultHeader = `<h4 style="color: var(--accent-red); margin-bottom: 8px;">❌ Incorrect</h4>`;
  }

  const explanationText = `${resultHeader}
  <p>${quiz.explanation}</p>`;

  state.tutor.activeQuiz = null;

  setTimeout(() => {
    state.tutor.chatHistory.push({
      sender: 'bot',
      text: explanationText,
      suggestions: ["Solve another numerical 📐", "Show CBSE Board Tips 💡", "Explain standard topic 🔬"]
    });
    renderChatHistory();
  }, 800);
}


// ================= STUDENT: ACADEMIC SYLLABUS =================
function initSyllabus() {
  renderSyllabusWorkspace();
}

function renderSyllabusWorkspace() {
  const grid = document.getElementById('syllabusSubjectGrid');
  if (!grid) return;

  const year = document.getElementById('syllabusAcademicYear');
  const title = document.getElementById('syllabusSourceTitle');
  const note = document.getElementById('syllabusSourceNote');
  const textbookLink = document.getElementById('ncertTextbookLink');
  const rationalisedLink = document.getElementById('ncertRationalisedLink');

  year.textContent = `${state.student.classLevel}-${state.student.section} | ${state.student.academicYear}`;
  title.textContent = `${NCERT_CONTENT_REGISTRY.classLabel} NCERT | Reprint ${NCERT_CONTENT_REGISTRY.tutoringCycle}`;
  note.textContent = NCERT_CONTENT_REGISTRY.note;
  textbookLink.href = NCERT_CONTENT_REGISTRY.officialTextbookPortal;
  rationalisedLink.href = NCERT_CONTENT_REGISTRY.rationalisedContentUrl;
  grid.innerHTML = '';

  Object.entries(CBSE_SUBJECTS).forEach(([subjectKey, subject]) => {
    const card = document.createElement('section');
    card.className = 'glass-panel syllabus-subject-card';

    const completion = state.student.syllabusCompletion[subjectKey] || 0;
    card.innerHTML = `
      <div class="syllabus-subject-header">
        <div>
          <span class="context-label">${escapeHtml(state.student.academicYear)} school portion</span>
          <h3>${escapeHtml(subject.title)}</h3>
        </div>
        <strong>${completion}% complete</strong>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${completion}%"></div>
      </div>
      <div class="syllabus-chapter-list"></div>
    `;

    const chapterList = card.querySelector('.syllabus-chapter-list');
    subject.chapters.forEach(chapter => {
      const status = state.student.chapterProgress[chapter.id] || 'not-started';
      const row = document.createElement('div');
      row.className = 'syllabus-chapter-row';
      row.innerHTML = `
        <span>${escapeHtml(chapter.title)}</span>
        <span class="syllabus-status status-${status}">${escapeHtml(status.replace('-', ' '))}</span>
      `;
      chapterList.appendChild(row);
    });

    grid.appendChild(card);
  });
}

// ================= STUDENT: DOUBT SOLVER =================
function initDoubtSolver() {
  const uploadPanel = document.getElementById('ocrUploadPanel');
  const previewBox = document.getElementById('ocrPreviewBox');
  const doubtsList = document.getElementById('quickDoubtsList');
  const eli5Btn = document.getElementById('doubtEli5ToggleBtn');

  // Render presets
  doubtsList.innerHTML = '';
  PRESET_DOUBTS.forEach((doubt) => {
    const btn = document.createElement('button');
    btn.className = 'sample-doubt-btn';
    btn.innerHTML = `<span style="color: var(--accent-indigo); font-weight:700;">[${doubt.category}]</span> ${doubt.question}`;
    btn.addEventListener('click', () => {
      resolveDoubt(doubt);
    });
    doubtsList.appendChild(btn);
  });

  // Simulated OCR Drag/Drop/Click
  uploadPanel.addEventListener('click', () => {
    previewBox.style.display = 'flex';
    uploadPanel.style.height = '180px';
    
    showToast("Analyzing textbook image layout...");
    
    setTimeout(() => {
      previewBox.style.display = 'none';
      uploadPanel.style.height = '300px';
      
      resolveDoubt(PRESET_DOUBTS[0]);
      showToast("OCR Resolved: Found 1 Science question");
    }, 2000);
  });

  // ELI5 Toggle action
  if (eli5Btn) {
    eli5Btn.addEventListener('click', () => {
      if (!state.currentDoubt) return;
      const contentBox = document.getElementById('doubtExplanationContent');
      if (state.doubtMode === 'standard') {
        state.doubtMode = 'eli5';
        contentBox.innerHTML = state.currentDoubt.eli5;
        eli5Btn.textContent = 'Show Advanced Solution 🔬';
        eli5Btn.style.borderColor = 'var(--accent-green)';
        eli5Btn.style.color = 'var(--accent-green)';
        showToast("Simplified concept representation loaded 🎈");
      } else {
        state.doubtMode = 'standard';
        contentBox.innerHTML = state.currentDoubt.aiResponse;
        eli5Btn.textContent = "Explain like I'm 5 (ELI5) 🎈";
        eli5Btn.style.borderColor = 'var(--accent-purple)';
        eli5Btn.style.color = 'var(--accent-purple)';
      }
    });
  }
}

function resolveDoubt(doubt) {
  state.currentDoubt = doubt;
  state.doubtMode = 'standard';
  
  const eli5Btn = document.getElementById('doubtEli5ToggleBtn');
  if (eli5Btn) {
    eli5Btn.style.display = 'inline-block';
    eli5Btn.textContent = "Explain like I'm 5 (ELI5) 🎈";
    eli5Btn.style.borderColor = 'var(--accent-purple)';
    eli5Btn.style.color = 'var(--accent-purple)';
  }

  const contentBox = document.getElementById('doubtExplanationContent');
  if (contentBox) {
    contentBox.innerHTML = `
      <h4 style="margin-bottom: 16px; font-weight:700; line-height:1.4;">Q: ${doubt.question}</h4>
      <div style="animation: fadeIn 0.4s ease-out;">
        ${doubt.aiResponse}
      </div>
    `;
  }
}


// ================= STUDENT: MOCK TESTS =================
function initMockTests() {
  renderTestSelectors();
  
  // Attach listeners to test panel buttons
  document.getElementById('prevQuestionBtn').addEventListener('click', navigatePrevQuestion);
  document.getElementById('nextQuestionBtn').addEventListener('click', navigateNextQuestion);
  document.getElementById('submitTestBtn').addEventListener('click', submitMockTest);
  document.getElementById('backToTestsBtn').addEventListener('click', () => {
    document.getElementById('test-report-screen').style.display = 'none';
    document.getElementById('test-select-screen').style.display = 'grid';
  });
}

function renderTestSelectors() {
  const container = document.getElementById('test-select-screen');
  container.innerHTML = '';

  Object.keys(MOCK_TESTS).forEach(key => {
    const test = MOCK_TESTS[key];
    const card = document.createElement('div');
    card.className = 'glass-panel test-selector-card';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.gap = '8px';

    const badges = document.createElement('div');
    badges.className = 'badge-row';
    
    const subjectBadge = document.createElement('span');
    subjectBadge.className = `mini-badge ${test.subject === 'science' ? 'badge-science' : 'badge-maths'}`;
    subjectBadge.textContent = test.subject;
    
    const questionsCount = document.createElement('span');
    questionsCount.className = 'mini-badge';
    questionsCount.style.cssText = 'background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--glass-border);';
    questionsCount.textContent = `${test.questions.length} Questions`;
    
    badges.appendChild(subjectBadge);
    badges.appendChild(questionsCount);

    const title = document.createElement('h3');
    title.textContent = test.title;
    
    header.appendChild(badges);
    header.appendChild(title);

    const desc = document.createElement('p');
    desc.style.fontSize = '12px';
    desc.textContent = `Includes multiple choice and assertion-reason problems aligned with CBSE blueprints. Time: ${test.timeLimit / 60} minutes.`;

    const button = document.createElement('button');
    button.className = 'primary-btn';
    button.textContent = 'Launch Exam';
    button.addEventListener('click', () => {
      startMockTest(key);
    });

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(button);
    container.appendChild(card);
  });
}

function startMockTest(testKey) {
  const test = MOCK_TESTS[testKey];
  state.activeTest.id = testKey;
  state.activeTest.inProgress = true;
  state.activeTest.questions = test.questions;
  state.activeTest.answers = {};
  state.activeTest.currentQuestionIndex = 0;
  state.activeTest.timeRemaining = test.timeLimit;
  
  // Swap screens
  document.getElementById('test-select-screen').style.display = 'none';
  document.getElementById('test-session-screen').style.display = 'block';

  // Render question layout
  renderActiveQuestion();
  renderQuestionNavPalette();
  
  // Launch timer
  clearInterval(state.activeTest.timerInterval);
  updateTimerDisplay();
  state.activeTest.timerInterval = setInterval(() => {
    state.activeTest.timeRemaining -= 1;
    updateTimerDisplay();
    
    if (state.activeTest.timeRemaining <= 0) {
      clearInterval(state.activeTest.timerInterval);
      showToast("Time's up! Submitting answers...", 'error');
      submitMockTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const time = state.activeTest.timeRemaining;
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  document.getElementById('testTimer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderActiveQuestion() {
  const index = state.activeTest.currentQuestionIndex;
  const q = state.activeTest.questions[index];
  
  document.getElementById('currentQuestionNum').textContent = `Question ${index + 1} of ${state.activeTest.questions.length}`;
  document.getElementById('currentQuestionText').innerHTML = q.question.replace(/\n/g, '<br>');

  // Show/Hide MSQ warning box
  const msqWarning = document.getElementById('msqWarningBox');
  if (q.type === 'msq') {
    msqWarning.style.display = 'block';
  } else {
    msqWarning.style.display = 'none';
  }

  const optionsContainer = document.getElementById('currentQuestionOptions');
  optionsContainer.innerHTML = '';

  const alphabet = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, optIndex) => {
    const isSelected = q.type === 'msq'
      ? (state.activeTest.answers[q.id] || []).includes(optIndex)
      : state.activeTest.answers[q.id] === optIndex;

    const item = document.createElement('div');
    item.className = `option-item ${isSelected ? 'selected' : ''} ${q.type === 'msq' ? 'checkbox-type' : ''}`;
    
    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.textContent = alphabet[optIndex];
    
    const label = document.createElement('span');
    label.style.fontSize = '14px';
    label.textContent = opt;

    item.appendChild(marker);
    item.appendChild(label);
    
    item.addEventListener('click', () => {
      if (q.type === 'msq') {
        if (!Array.isArray(state.activeTest.answers[q.id])) {
          state.activeTest.answers[q.id] = [];
        }
        const answerArr = state.activeTest.answers[q.id];
        const idx = answerArr.indexOf(optIndex);
        if (idx > -1) {
          answerArr.splice(idx, 1);
        } else {
          answerArr.push(optIndex);
        }
      } else {
        state.activeTest.answers[q.id] = optIndex;
      }
      
      // Re-render choices & nav palette
      renderActiveQuestion();
      renderQuestionNavPalette();
    });

    optionsContainer.appendChild(item);
  });

  // Enable/disable navigation buttons
  document.getElementById('prevQuestionBtn').disabled = (index === 0);
  document.getElementById('nextQuestionBtn').textContent = (index === state.activeTest.questions.length - 1) ? 'Submit Review' : 'Next Question ▶';
}

function renderQuestionNavPalette() {
  const grid = document.getElementById('questionNavGrid');
  grid.innerHTML = '';

  state.activeTest.questions.forEach((q, index) => {
    const hasAnswered = q.type === 'msq'
      ? (state.activeTest.answers[q.id] && state.activeTest.answers[q.id].length > 0)
      : (state.activeTest.answers[q.id] !== undefined);

    const dot = document.createElement('div');
    dot.className = `nav-dot ${state.activeTest.currentQuestionIndex === index ? 'current' : ''} ${hasAnswered ? 'answered' : ''}`;
    dot.textContent = index + 1;
    
    dot.addEventListener('click', () => {
      state.activeTest.currentQuestionIndex = index;
      renderActiveQuestion();
      renderQuestionNavPalette();
    });

    grid.appendChild(dot);
  });
}

function navigatePrevQuestion() {
  if (state.activeTest.currentQuestionIndex > 0) {
    state.activeTest.currentQuestionIndex -= 1;
    renderActiveQuestion();
    renderQuestionNavPalette();
  }
}

function navigateNextQuestion() {
  const index = state.activeTest.currentQuestionIndex;
  if (index < state.activeTest.questions.length - 1) {
    state.activeTest.currentQuestionIndex += 1;
    renderActiveQuestion();
    renderQuestionNavPalette();
  } else {
    // Last question click triggers submission prompt
    submitMockTest();
  }
}

function submitMockTest() {
  clearInterval(state.activeTest.timerInterval);
  state.activeTest.inProgress = false;
  
  // Calculate marks
  let scoreCount = 0;
  state.activeTest.questions.forEach(q => {
    if (q.type === 'msq') {
      const userAnswers = state.activeTest.answers[q.id] || [];
      const correctAnswers = q.correctAnswers || [];
      
      const allCorrectMatch = userAnswers.length === correctAnswers.length &&
        userAnswers.every(val => correctAnswers.includes(val));
        
      if (allCorrectMatch) {
        scoreCount += 1;
      }
    } else {
      if (state.activeTest.answers[q.id] === q.correctAnswer) {
        scoreCount += 1;
      }
    }
  });

  const accuracy = Math.round((scoreCount / state.activeTest.questions.length) * 100);
  const totalAwardedXp = scoreCount * 50 + 50; // 50 XP per correct question + 50 baseline completion
  state.student.xp += totalAwardedXp;
  
  // Update study scores history
  const testKey = state.activeTest.id;
  const testData = MOCK_TESTS[testKey];
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  state.student.recentScores.push({
    title: testData.title,
    date: todayDate,
    score: accuracy,
    total: 100
  });

  // Switch screens
  document.getElementById('test-session-screen').style.display = 'none';
  document.getElementById('test-report-screen').style.display = 'block';

  // Render scorecard
  document.getElementById('reportScore').textContent = `${accuracy}%`;
  document.getElementById('reportTitle').textContent = testData.title;
  document.getElementById('reportSubtitle').textContent = `Completed on ${todayDate}`;

  // Generate diagnostics based on incorrect answers
  const diagContainer = document.getElementById('reportDiagnostics');
  diagContainer.innerHTML = '';

  state.activeTest.questions.forEach((q, index) => {
    let isCorrect = false;
    if (q.type === 'msq') {
      const userAnswers = state.activeTest.answers[q.id] || [];
      const correctAnswers = q.correctAnswers || [];
      isCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(val => correctAnswers.includes(val));
    } else {
      isCorrect = state.activeTest.answers[q.id] === q.correctAnswer;
    }

    const bullet = document.createElement('div');
    bullet.className = 'bullet-item';

    const icon = document.createElement('span');
    icon.className = 'bullet-icon';
    icon.textContent = isCorrect ? '✅' : '❌';
    icon.style.color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';

    const text = document.createElement('div');
    text.style.fontSize = '13px';
    if (isCorrect) {
      text.innerHTML = `<strong>Question ${index+1} (Correct):</strong> Good understanding of this concept.`;
    } else {
      text.innerHTML = `<strong>Question ${index+1} (Incorrect):</strong> Study hint: <em>${q.explanation}</em>.`;
      
      // Add weak topic tracking dynamically
      if (testKey === 'electricity' && index === 1) {
        addWeakTopic("Factors affecting Resistance", "Science (Physics)");
      }
    }

    bullet.appendChild(icon);
    bullet.appendChild(text);
    diagContainer.appendChild(bullet);
  });

  showToast(`Exam submitted! +${totalAwardedXp} XP Awarded.`);
  
  // Update header Stats
  document.getElementById('xpCount').textContent = state.student.xp;
}

function addWeakTopic(topicName, subjectName) {
  const exists = state.student.weakTopics.some(t => t.topic === topicName);
  if (!exists) {
    state.student.weakTopics.unshift({
      topic: topicName,
      subject: subjectName,
      completion: 30
    });
  }
}


// ================= STUDENT: REVISION PLANNER =================
function initPlanner() {
  const grid = document.getElementById('calendarDaysGrid');
  
  // Generate block squares for May 2026 starting from Friday (1st)
  // Total 31 days
  const startDayOffset = 5; // Friday is 5th day in 0-indexed (Sun=0)
  
  // Add empty placeholders for days before Friday
  for (let i = 0; i < startDayOffset; i++) {
    const empty = document.createElement('div');
    grid.appendChild(empty);
  }

  // Pre-fill days 1-28. Let's make 20-24 as active streaks
  for (let day = 1; day <= 31; day++) {
    const box = document.createElement('div');
    box.className = 'calendar-day-box';
    
    // Check if within our simulated 5 day streak (23rd to 27th May)
    if (day >= 23 && day <= 27) {
      box.classList.add('active-streak');
    }

    const num = document.createElement('span');
    num.className = 'day-num';
    num.textContent = day;

    const flame = document.createElement('span');
    flame.className = 'day-streak-flame';
    flame.textContent = '🔥';

    box.appendChild(num);
    box.appendChild(flame);
    grid.appendChild(box);
  }

  // Set streak label
  document.getElementById('streakSummaryCount').textContent = `${state.student.streak} Days`;
}


// ================= STUDENT: JEE & NEET ASPIRANTS =================
function initJeeNeetPrep() {
  // Stream selectors listeners
  const jeeBtn = document.getElementById('jeeneetToggleJee');
  const neetBtn = document.getElementById('jeeneetToggleNeet');

  jeeBtn.addEventListener('click', () => {
    toggleJeeNeetStream('jee');
  });
  
  neetBtn.addEventListener('click', () => {
    toggleJeeNeetStream('neet');
  });

  // Submit Challenger MCQ
  document.getElementById('submitChallengerBtn').addEventListener('click', submitChallengerAnswer);

  // AI PrepMentor coach send
  document.getElementById('jeeneetAiSendBtn').addEventListener('click', sendPrepMentorQuestion);
  document.getElementById('jeeneetAiInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendPrepMentorQuestion();
  });

  // Initialize
  toggleJeeNeetStream('jee');
}

function toggleJeeNeetStream(stream) {
  state.jeeneet.activeStream = stream;
  state.jeeneet.challengerAnswered = false;
  state.jeeneet.selectedOption = null;

  const jeeBtn = document.getElementById('jeeneetToggleJee');
  const neetBtn = document.getElementById('jeeneetToggleNeet');
  const expBox = document.getElementById('challengerExplanationBox');
  
  expBox.style.display = 'none';

  if (stream === 'jee') {
    jeeBtn.classList.add('active');
    jeeBtn.style.cssText = "background: rgba(99, 102, 241, 0.15); border-color: var(--accent-indigo);";
    neetBtn.classList.remove('active');
    neetBtn.style.cssText = "background: transparent; border-color: var(--glass-border);";
    
    // Set Badge and Question
    document.getElementById('challengerSubjectBadge').textContent = 'Physics (JEE Advanced)';
    document.getElementById('challengerSubjectBadge').style.cssText = 'background: rgba(99, 102, 241, 0.15); color: var(--accent-indigo);';
    document.getElementById('challengerQuestionText').textContent = JEE_PREP_DATA.dailyChallenger.question;
    
    renderChallengerOptions(JEE_PREP_DATA.dailyChallenger.options);
    
    // Set Countdown and Booklet
    launchJeeneetCountdown(JEE_PREP_DATA.countdownDate);
    document.getElementById('bookletTitle').textContent = 'JEE Formula Booklet';
    document.getElementById('bookletSubtitle').textContent = 'Highly consolidated concepts for Physics and Maths.';
    renderHighYieldBooklets(JEE_PREP_DATA.formulas, 'formula');
  } else {
    neetBtn.classList.add('active');
    neetBtn.style.cssText = "background: rgba(168, 85, 247, 0.15); border-color: var(--accent-purple);";
    jeeBtn.classList.remove('active');
    jeeBtn.style.cssText = "background: transparent; border-color: var(--glass-border);";
    
    // Set Badge and Question
    document.getElementById('challengerSubjectBadge').textContent = 'Biology (NEET Level)';
    document.getElementById('challengerSubjectBadge').style.cssText = 'background: rgba(168, 85, 247, 0.15); color: var(--accent-purple);';
    document.getElementById('challengerQuestionText').textContent = NEET_PREP_DATA.dailyChallenger.question;
    
    renderChallengerOptions(NEET_PREP_DATA.dailyChallenger.options);

    // Set Countdown and Booklet
    launchJeeneetCountdown(NEET_PREP_DATA.countdownDate);
    document.getElementById('bookletTitle').textContent = 'NCERT Line Highlighter';
    document.getElementById('bookletSubtitle').textContent = 'Biology line snippets critical for NEET assertion questions.';
    renderHighYieldBooklets(NEET_PREP_DATA.ncertHighlights, 'highlight');
  }
}

function renderChallengerOptions(options) {
  const container = document.getElementById('challengerOptionsContainer');
  container.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.id = `challenger-opt-${idx}`;
    
    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.textContent = letters[idx];

    const label = document.createElement('span');
    label.style.fontSize = '14px';
    label.textContent = opt;

    div.appendChild(marker);
    div.appendChild(label);
    
    div.addEventListener('click', () => {
      if (state.jeeneet.challengerAnswered) return; // Frozen after submission
      
      // De-select others
      container.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      state.jeeneet.selectedOption = idx;
    });

    container.appendChild(div);
  });
}

function submitChallengerAnswer() {
  if (state.jeeneet.selectedOption === null) {
    showToast("Please choose an option first!", "error");
    return;
  }
  if (state.jeeneet.challengerAnswered) return;

  state.jeeneet.challengerAnswered = true;
  const stream = state.jeeneet.activeStream;
  const data = stream === 'jee' ? JEE_PREP_DATA : NEET_PREP_DATA;
  const isCorrect = state.jeeneet.selectedOption === data.dailyChallenger.correctAnswer;
  
  const expBox = document.getElementById('challengerExplanationBox');
  const expText = document.getElementById('challengerExplanationText');
  const selectedDiv = document.getElementById(`challenger-opt-${state.jeeneet.selectedOption}`);
  const correctDiv = document.getElementById(`challenger-opt-${data.dailyChallenger.correctAnswer}`);

  expBox.style.display = 'block';

  if (isCorrect) {
    selectedDiv.style.borderColor = 'var(--accent-green)';
    selectedDiv.style.background = 'rgba(34,197,94,0.1)';
    expBox.querySelector('h4').textContent = '✓ Correct! Step-by-Step AI Verification:';
    expBox.querySelector('h4').style.color = 'var(--accent-green)';
    expBox.style.borderColor = 'var(--accent-green)';
    expBox.style.background = 'rgba(34,197,94,0.03)';
    
    // Award XP
    state.student.xp += 100;
    showToast("Splendid! +100 XP Challenger Awarded.");
    document.getElementById('xpCount').textContent = state.student.xp;
  } else {
    selectedDiv.style.borderColor = 'var(--accent-red)';
    selectedDiv.style.background = 'rgba(239,68,68,0.1)';
    
    correctDiv.style.borderColor = 'var(--accent-green)';
    correctDiv.style.background = 'rgba(34,197,94,0.05)';

    expBox.querySelector('h4').textContent = '❌ Incorrect. Correct Option is ' + ['A','B','C','D'][data.dailyChallenger.correctAnswer] + ':';
    expBox.querySelector('h4').style.color = 'var(--accent-red)';
    expBox.style.borderColor = 'var(--accent-red)';
    expBox.style.background = 'rgba(239,68,68,0.03)';
  }

  expText.innerHTML = data.dailyChallenger.explanation;
}

function renderHighYieldBooklets(items, type) {
  const container = document.getElementById('bookletContentContainer');
  container.innerHTML = '';

  items.forEach(item => {
    const box = document.createElement('div');
    box.className = 'task-item';
    box.style.flexDirection = 'column';
    box.style.alignItems = 'flex-start';
    box.style.cursor = 'default';

    const header = document.createElement('div');
    header.style.cssText = 'width: 100%; display: flex; justify-content: space-between; font-size:12px; font-weight:700; color: var(--accent-indigo); margin-bottom: 6px;';
    
    const title = document.createElement('span');
    title.textContent = item.subject + ' • ' + (type === 'formula' ? item.topic : item.chapter);
    header.appendChild(title);
    box.appendChild(header);

    if (type === 'formula') {
      const ul = document.createElement('ul');
      ul.style.cssText = 'padding-left: 14px; font-size: 13px; color: var(--text-muted);';
      item.formulas.forEach(form => {
        const li = document.createElement('li');
        li.textContent = form;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.style.fontSize = '13px';
      p.innerHTML = item.highlight;
      box.appendChild(p);
    }

    container.appendChild(box);
  });
}

function launchJeeneetCountdown(targetDateStr) {
  clearInterval(state.jeeneet.countdownInterval);
  const targetDate = new Date(targetDateStr).getTime();

  const update = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff < 0) {
      document.getElementById('jeeneetCountdown').textContent = "Exam Time!";
      clearInterval(state.jeeneet.countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('jeeneetCountdown').textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  update();
  state.jeeneet.countdownInterval = setInterval(update, 1000);
}

function sendPrepMentorQuestion() {
  const input = document.getElementById('jeeneetAiInput');
  const val = input.value.trim();
  if (!val) return;

  const box = document.getElementById('jeeneetAiResponse');
  box.style.display = 'block';
  box.innerHTML = `<span style="font-style: italic;">PrepMentor analyzing advanced equation...</span>`;
  input.value = '';

  setTimeout(() => {
    let resp = "That is a high-yield conceptual question! In JEE / NEET physics, you can solve this using standard integration boundaries or by applying dimensional analysis shortcuts. Here is the AI tip: always resolve vectors into perpendicular components first to reduce coordinate variables.";
    if (val.toLowerCase().includes('ladder') || val.toLowerCase().includes('infinite')) {
      resp = "<strong>AI Shortcut for Infinite Resistance Ladders:</strong><br>Assume the equivalent resistance of the infinite loop is X. Cut the ladder after the first repeating cell. You will get a simple parallel-series combination: R_eq = R1 + (R2 * X) / (R2 + X) = X. Solve the resulting quadratic equation in X to get the speed shortcut!";
    }
    box.innerHTML = resp;
  }, 1200);
}


// ================= PARENT: DASHBOARD =================
function initParentDashboard() {
  renderParentVisualChart();
  renderParentFocusAreas();
  renderParentLogTable();
}

function renderParentDashboard() {
  initParentDashboard();
}

function renderParentVisualChart() {
  const container = document.getElementById('parentVisualChart');
  if (!container) return;
  container.innerHTML = '';

  state.student.recentScores.forEach(score => {
    const col = document.createElement('div');
    col.className = 'chart-column';

    const barVal = document.createElement('span');
    barVal.className = 'chart-value';
    barVal.textContent = `${score.score}%`;

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = '0px'; // Trigger animation
    setTimeout(() => {
      bar.style.height = `${score.score * 1.5}px`; // Cap max height around 150px
    }, 100);

    const label = document.createElement('span');
    label.className = 'chart-label';
    label.textContent = score.title.split(' ')[0]; // Pick first word

    col.appendChild(barVal);
    col.appendChild(bar);
    col.appendChild(label);
    container.appendChild(col);
  });
}

function renderParentFocusAreas() {
  const container = document.getElementById('parentStrengthWeaknessList');
  if (!container) return;
  container.innerHTML = '';

  // Render weak areas (requires work)
  const weakHeading = document.createElement('h4');
  weakHeading.textContent = "⚠️ High Attention Required (Weak Concepts)";
  weakHeading.style.cssText = "font-size: 13px; color: var(--accent-red); margin-bottom: 6px;";
  container.appendChild(weakHeading);

  state.student.weakTopics.forEach(t => {
    const item = document.createElement('div');
    item.style.cssText = "display: flex; flex-direction: column; gap: 4px; padding: 10px; background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 8px;";
    
    const topRow = document.createElement('div');
    topRow.style.cssText = "display:flex; justify-content:space-between; font-size:12px; font-weight:700;";
    topRow.innerHTML = `<span>${t.topic}</span><span style="color:var(--accent-red);">${t.completion}% syllabus clarity</span>`;
    
    const progressBg = document.createElement('div');
    progressBg.className = 'progress-bar-bg';
    progressBg.style.height = '4px';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar-fill';
    progressFill.style.cssText = `width: ${t.completion}%; background: var(--accent-red);`;
    
    progressBg.appendChild(progressFill);
    item.appendChild(topRow);
    item.appendChild(progressBg);
    container.appendChild(item);
  });

  // Render strong areas (praise)
  const strongHeading = document.createElement('h4');
  strongHeading.textContent = "🏆 Excellent Mastery (Strong Concepts)";
  strongHeading.style.cssText = "font-size: 13px; color: var(--accent-green); margin-top: 14px; margin-bottom: 6px;";
  container.appendChild(strongHeading);

  const tags = document.createElement('div');
  tags.style.cssText = "display: flex; flex-wrap: wrap; gap: 8px;";
  
  state.student.strongTopics.forEach(t => {
    const badge = document.createElement('span');
    badge.className = 'mini-badge';
    badge.style.cssText = `
      background: rgba(34, 197, 94, 0.15);
      color: var(--accent-green);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 6px 12px;
      font-size: 12px;
    `;
    badge.textContent = `✓ ${t.topic} (${t.rating})`;
    tags.appendChild(badge);
  });
  container.appendChild(tags);
}

function renderParentLogTable() {
  const tbody = document.querySelector('#parentLogsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.student.recentScores.forEach(score => {
    const tr = document.createElement('tr');
    
    let grade = 'B';
    if (score.score >= 90) grade = 'A+';
    else if (score.score >= 80) grade = 'A';
    else if (score.score >= 70) grade = 'B+';

    tr.innerHTML = `
      <td><strong>${score.title}</strong></td>
      <td>${score.date}</td>
      <td style="color: ${score.score >= 75 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight:700;">${score.score}%</td>
      <td><span class="logo-badge" style="background: rgba(255,255,255,0.05); color: var(--text-main); font-weight:700;">${grade}</span></td>
    `;
    tbody.appendChild(tr);
  });
}


// ================= TEACHER: DASHBOARD =================
function initTeacherDashboard() {
  // Generate panel defaults
  const subjectSelect = document.getElementById('genSubject');
  const chapterSelect = document.getElementById('genChapter');

  const updateChaptersList = () => {
    const subj = subjectSelect.value;
    chapterSelect.innerHTML = '';
    CBSE_SUBJECTS[subj].chapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.id;
      opt.textContent = ch.title;
      chapterSelect.appendChild(opt);
    });
  };

  subjectSelect.addEventListener('change', updateChaptersList);
  updateChaptersList();

  // Question gen trigger
  document.getElementById('genQuestionsBtn').addEventListener('click', runAiQuestionGenerator);
  document.getElementById('assignHomeworkBtn').addEventListener('click', assignHomeworkToClass);

  // Broadcast publish trigger
  document.getElementById('publishAnnBtn').addEventListener('click', publishTeacherAnnouncement);

  renderTeacherDashboard();
  renderTeacherPortionManager();
}

function renderTeacherDashboard() {
  renderTeacherActiveHomeworks();
  renderTeacherClassMetrics();
}

function renderTeacherPortionManager() {
  const grid = document.getElementById('teacherPortionGrid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(CBSE_SUBJECTS).forEach(([, subject]) => {
    const card = document.createElement('section');
    card.className = 'glass-panel syllabus-subject-card';
    card.innerHTML = `
      <h3>${escapeHtml(subject.title)}</h3>
      <div class="syllabus-chapter-list"></div>
    `;

    const list = card.querySelector('.syllabus-chapter-list');
    subject.chapters.forEach(chapter => {
      const row = document.createElement('label');
      row.className = 'syllabus-chapter-row portion-checkbox-row';
      row.innerHTML = `
        <span>${escapeHtml(chapter.title)}</span>
        <input type="checkbox" ${state.student.chapterProgress[chapter.id] !== 'not-started' ? 'checked' : ''}>
      `;

      row.querySelector('input').addEventListener('change', (e) => {
        state.student.chapterProgress[chapter.id] = e.target.checked ? 'learning' : 'not-started';
        showToast(`${chapter.title} ${e.target.checked ? 'added to' : 'removed from'} the current portion`);
      });

      list.appendChild(row);
    });

    grid.appendChild(card);
  });
}

function renderTeacherActiveHomeworks() {
  const container = document.getElementById('teacherHomeworksList');
  if (!container) return;
  container.innerHTML = '';

  state.teacher.activeHomeworks.forEach(hw => {
    const card = document.createElement('div');
    card.className = 'task-item';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'flex-start';
    card.style.cursor = 'default';

    const header = document.createElement('div');
    header.style.cssText = 'width: 100%; display: flex; justify-content: space-between; font-size:12px; font-weight:700; color: var(--accent-indigo); margin-bottom: 6px;';
    header.innerHTML = `<span>${hw.class} • Active Homework</span><span style="color:var(--text-dim);">Due: ${hw.dueDate}</span>`;

    const title = document.createElement('h4');
    title.style.fontSize = '14px';
    title.textContent = hw.title;

    const progressBox = document.createElement('div');
    progressBox.className = 'progress-container';
    progressBox.style.cssText = 'width:100%; margin-top:8px;';
    
    const percent = Math.round((hw.submittedCount / hw.totalCount) * 100);
    progressBox.innerHTML = `
      <div class="progress-labels" style="font-size:11px;">
        <span>Submitted: ${hw.submittedCount}/${hw.totalCount} Students</span>
        <span>${percent}% Submission Rate</span>
      </div>
      <div class="progress-bar-bg" style="height: 4px;">
        <div class="progress-bar-fill" style="width: ${percent}%; background: linear-gradient(to right, var(--accent-indigo), var(--accent-green));"></div>
      </div>
    `;

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(progressBox);
    container.appendChild(card);
  });
}

function renderTeacherClassMetrics() {
  const container = document.getElementById('teacherClassPerformanceList');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(state.teacher.averagePerformance).forEach(cls => {
    const avg = state.teacher.averagePerformance[cls];
    const box = document.createElement('div');
    box.style.cssText = 'margin-bottom: 12px;';
    box.innerHTML = `
      <div class="progress-labels" style="font-size:12px; font-weight:600;">
        <span>${cls} Class Average</span>
        <span>${avg}% Accuracy</span>
      </div>
      <div class="progress-bar-bg" style="height: 6px; margin-top: 4px;">
        <div class="progress-bar-fill" style="width: ${avg}%; background: linear-gradient(to right, var(--accent-indigo), var(--accent-purple));"></div>
      </div>
    `;
    container.appendChild(box);
  });
}

let generatedSheetData = null; // Store active generated sheet values

function runAiQuestionGenerator() {
  const subj = document.getElementById('genSubject').value;
  const chapId = document.getElementById('genChapter').value;
  const topic = document.getElementById('genTopic').value.trim() || 'General review';
  const type = document.getElementById('genType').value;

  const preview = document.getElementById('genQuestionsPreview');
  const assignBtn = document.getElementById('assignHomeworkBtn');

  // Loading animation simulation
  preview.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:180px; gap: 12px;">
      <span style="font-size: 32px; animation: bounceSlow 1.5s infinite;">🤖</span>
      <p style="font-size:13px; color: var(--accent-indigo); font-weight:600;">Vidya AI generating high-yield questions based on CBSE blueprint...</p>
    </div>
  `;
  assignBtn.style.display = 'none';

  setTimeout(() => {
    const chapName = CBSE_SUBJECTS[subj].chapters.find(c => c.id === chapId).title;
    
    // Setup mockup generated sheet data
    generatedSheetData = {
      title: `${chapName} Quiz (${topic})`,
      subject: subj,
      questions: []
    };

    if (type === 'mcq') {
      generatedSheetData.questions = [
        {
          question: `Which of the following is correct regarding standard properties of ${chapName} in accordance to Class 10 boards?`,
          opts: ["Option A - Primary standard characteristics", "Option B - Secondary variable parameters", "Option C - Proportional coefficients", "Option D - None of the above"],
          ans: 0
        },
        {
          question: `Under standard laboratory conditions, how does ${topic || 'the concept'} react or behave?`,
          opts: ["Doubles in velocity", "Halves in magnitude", "Increases exponentially", "Remains conserved in a closed loop"],
          ans: 3
        }
      ];
    } else if (type === 'assertion-reason') {
      generatedSheetData.questions = [
        {
          question: `Assertion (A): ${chapName} is fundamental to all school board experiments.<br>Reason (R): It has been proven through mathematical equations that ${topic || 'this topic'} is conserved.`,
          opts: ["Both A and R are true and R explains A", "Both A and R are true but R does not explain A", "A is true but R is false", "A is false but R is true"],
          ans: 0
        }
      ];
    } else {
      generatedSheetData.questions = [
        {
          question: `Explain the physical significance of ${topic} inside ${chapName}. Provide the mathematical formula and units (3 Marks).`,
          opts: ["Marking Guide: 1 Mark for formula definition", "1 Mark for drawing diagram representation", "1 Mark for specifying SI units", "Model Answer provided in booklet"],
          ans: 0
        }
      ];
    }

    // Render Preview
    preview.innerHTML = `
      <div style="font-size: 12px; color: var(--accent-indigo); font-weight:700; margin-bottom: 10px;">GENERATED SUITE: ${escapeHtml(generatedSheetData.title)}</div>
      ${generatedSheetData.questions.map((q, qidx) => `
        <div class="question-gen-item" style="animation: fadeIn 0.4s ease-out;">
          <div class="question-gen-title">Q${qidx+1}: ${escapeHtml(q.question).replace(/&lt;br&gt;/g, '<br>')}</div>
          <div class="question-gen-opts">
            ${q.opts.map((opt, oidx) => `
              <div class="opt-bullet ${oidx === q.ans ? 'active' : ''}" style="${oidx === q.ans ? 'border-color: var(--accent-green); background: rgba(34,197,94,0.05); color: var(--accent-green);' : ''}">
                ${['A','B','C','D'][oidx]}: ${escapeHtml(opt)}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    assignBtn.style.display = 'block';
    showToast("Worksheet synthesized successfully!");
  }, 1800);
}

function assignHomeworkToClass() {
  if (!generatedSheetData) return;

  // Append new homework assignment details
  const randomId = 'hw-' + Math.floor(Math.random() * 1000);
  const newHw = {
    id: randomId,
    class: state.teacher.classes[0], // Class 10-A
    title: generatedSheetData.title,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    submittedCount: 0,
    totalCount: 30
  };

  state.teacher.activeHomeworks.unshift(newHw);
  renderTeacherActiveHomeworks();

  // CROSS-ROLE INTERACTION: Push daily checklist goal to Student's list!
  state.student.dailyTasks.push({
    id: randomId,
    title: `Solve homework: ${generatedSheetData.title}`,
    completed: false
  });

  // Pushes Announcement notifications
  state.student.announcements.unshift({
    id: 'ann-' + Math.floor(Math.random() * 1000),
    sender: 'Ms. Sharma (Science Teacher)',
    title: `New Homework Assigned: ${generatedSheetData.title}`,
    content: `I have generated and allocated a homework sheet on ${generatedSheetData.title}. Please solve it by the due date.`,
    date: 'Just Now'
  });

  // Reset generator previews
  document.getElementById('genQuestionsPreview').innerHTML = `
    <p style="text-align: center; color: var(--text-dim); padding-top: 30px;">Input variables on the left and hit generate to synthesize contextual CBSE worksheets using the AI simulator.</p>
  `;
  document.getElementById('assignHomeworkBtn').style.display = 'none';
  generatedSheetData = null;

  showToast("Homework assigned! Allocated to all Class 10-A Student check-lists.");
}

function publishTeacherAnnouncement() {
  const title = document.getElementById('annTitleInput').value.trim();
  const content = document.getElementById('annContentInput').value.trim();

  if (!title || !content) {
    showToast("Please provide both title and description content!", "error");
    return;
  }

  // Cross-role push: adds announcements to Student arrays
  state.student.announcements.unshift({
    id: 'ann-' + Math.floor(Math.random() * 1000),
    sender: 'Ms. Sharma (Science Teacher)',
    title: title,
    content: content,
    date: 'Just Now'
  });

  // Clear inputs
  document.getElementById('annTitleInput').value = '';
  document.getElementById('annContentInput').value = '';

  showToast("Announcement broadcasted to students and parents.");
}

// ================= STUDENT: VISUAL LEARNING ROADMAP =================
function initRoadmap() {
  renderRoadmap();
}

function renderRoadmap() {
  const container = document.getElementById('learningPathRoadmap');
  if (!container) return;
  container.innerHTML = '';

  const subject = state.tutor.currentSubject;
  const chapterId = state.tutor.currentChapter;
  const chapter = CBSE_SUBJECTS[subject].chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  const topics = chapter.topics;
  
  const roadWrapper = document.createElement('div');
  roadWrapper.className = 'roadmap-container';

  topics.forEach((topic, index) => {
    let nodeState = 'locked';
    let icon = '🔒';

    const isWeak = state.student.weakTopics.some(t => t.topic.toLowerCase() === topic.toLowerCase());
    
    if (index < 2) {
      nodeState = 'mastered';
      icon = '✓';
    } else if (index === 2) {
      if (isWeak) {
        nodeState = 'weak';
        icon = '⚠️';
      } else {
        nodeState = 'active';
        icon = '⭐';
      }
    } else if (index === 3) {
      nodeState = 'active';
      icon = '📖';
    } else {
      nodeState = 'locked';
      icon = '🔒';
    }

    const node = document.createElement('div');
    node.className = `roadmap-node ${nodeState}`;
    node.innerHTML = icon;

    const tooltip = document.createElement('div');
    tooltip.className = 'roadmap-node-tooltip';
    tooltip.innerHTML = `<strong>${topic}</strong> (${nodeState.toUpperCase()})`;
    node.appendChild(tooltip);

    node.addEventListener('click', () => {
      if (nodeState === 'locked') {
        showToast("Complete previous topics to unlock this benchmark!", "error");
        return;
      }
      
      switchView('student', 'student-tutor');
      triggerTutorTopicExplanation(topic);
      showToast(`Loading study mentor helper for: ${topic}`);
    });

    roadWrapper.appendChild(node);

    if (index < topics.length - 1) {
      const line = document.createElement('div');
      line.className = `roadmap-path-line ${index < 3 ? 'completed' : ''}`;
      roadWrapper.appendChild(line);
    }
  });

  container.appendChild(roadWrapper);
}

// ================= STUDENT: ACHIEVEMENTS & MILESTONES =================
function initAchievements() {
  renderAchievements();
}

function renderAchievements() {
  const badgesContainer = document.getElementById('achievementsBadgesList');
  const milestonesContainer = document.getElementById('achievementsMilestonesList');
  if (!badgesContainer || !milestonesContainer) return;

  badgesContainer.innerHTML = '';
  milestonesContainer.innerHTML = '';

  ACHIEVEMENTS.badges.forEach(badge => {
    const item = document.createElement('div');
    item.className = `achievement-badge-item ${badge.unlocked ? '' : 'locked'}`;

    const iconBox = document.createElement('div');
    iconBox.className = 'achievement-badge-icon';
    iconBox.textContent = badge.icon;

    const content = document.createElement('div');
    content.style.flex = '1';

    const title = document.createElement('h4');
    title.style.margin = '0 0 4px 0';
    title.style.fontSize = '14px';
    title.innerHTML = `${badge.title} ${badge.unlocked ? '<span style="color:var(--accent-green); font-size:11px; font-weight:600; margin-left:6px;">✓ Unlocked</span>' : '<span style="color:var(--text-dim); font-size:11px; font-weight:600; margin-left:6px;">🔒 Locked</span>'}`;

    const desc = document.createElement('p');
    desc.style.fontSize = '12px';
    desc.style.margin = '0';
    desc.textContent = badge.desc;

    content.appendChild(title);
    content.appendChild(desc);

    if (!badge.unlocked) {
      const progressBg = document.createElement('div');
      progressBg.className = 'achievement-progress-bg';
      const progressFill = document.createElement('div');
      progressFill.className = 'achievement-progress-fill';
      progressFill.style.width = `${badge.progress}%`;
      progressBg.appendChild(progressFill);
      content.appendChild(progressBg);
    }

    item.appendChild(iconBox);
    item.appendChild(content);
    badgesContainer.appendChild(item);
  });

  ACHIEVEMENTS.milestones.forEach(milestone => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.style.cursor = 'default';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = milestone.completed;
    checkbox.disabled = true;

    const text = document.createElement('div');
    text.className = 'task-text';
    text.innerHTML = `<strong>${milestone.title}</strong>: ${milestone.desc}`;

    item.appendChild(checkbox);
    item.appendChild(text);
    milestonesContainer.appendChild(item);
  });
}

// ================= STUDENT: FLASHCARDS =================
function initFlashcards() {
  const swipeLeftBtn = document.getElementById('swipeLeftBtn');
  const swipeRightBtn = document.getElementById('swipeRightBtn');
  const cardElement = document.getElementById('activeFlashcard');

  if (cardElement) {
    cardElement.addEventListener('click', () => {
      cardElement.classList.toggle('flipped');
    });
  }

  if (swipeLeftBtn) {
    swipeLeftBtn.addEventListener('click', () => {
      showToast("Marked for review again");
      nextFlashcard();
    });
  }

  if (swipeRightBtn) {
    swipeRightBtn.addEventListener('click', () => {
      state.student.xp += 15;
      document.getElementById('xpCount').textContent = state.student.xp;
      showToast("Mastered! +15 XP");
      nextFlashcard();
    });
  }

  renderFlashcards();
}

function renderFlashcards() {
  const sidebar = document.getElementById('flashcardDecksSidebar');
  if (!sidebar) return;

  sidebar.innerHTML = '';
  
  Object.keys(FLASHCARD_DECKS).forEach(key => {
    const deck = FLASHCARD_DECKS[key];
    const btn = document.createElement('button');
    btn.className = `chapter-selector-btn ${state.flashcards.activeDeck === key ? 'active' : ''}`;
    btn.textContent = deck.title;
    btn.addEventListener('click', () => {
      state.flashcards.activeDeck = key;
      state.flashcards.currentCardIndex = 0;
      renderFlashcards();
    });
    sidebar.appendChild(btn);
  });

  const activeKey = state.flashcards.activeDeck;
  const deck = FLASHCARD_DECKS[activeKey];
  const index = state.flashcards.currentCardIndex;
  
  if (deck && deck.cards[index]) {
    const card = deck.cards[index];
    document.getElementById('cardFrontText').textContent = card.front;
    document.getElementById('cardBackText').textContent = card.back;
    document.getElementById('flashcardDeckProgress').textContent = `Card ${index + 1} of ${deck.cards.length}`;
  }

  const activeFlashcard = document.getElementById('activeFlashcard');
  if (activeFlashcard) {
    activeFlashcard.classList.remove('flipped');
  }
}

function nextFlashcard() {
  const activeKey = state.flashcards.activeDeck;
  const deck = FLASHCARD_DECKS[activeKey];
  
  state.flashcards.currentCardIndex += 1;
  if (state.flashcards.currentCardIndex >= deck.cards.length) {
    state.flashcards.currentCardIndex = 0;
    showToast("Deck complete! Restarting...", "success");
  }
  
  renderFlashcards();
}

// ================= STUDENT: QUIZ BATTLES =================
function initQuizBattles() {
  const exitBtn = document.getElementById('exitBattleBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      document.getElementById('battle-results-screen').style.display = 'none';
      document.getElementById('battle-lobby-screen').style.display = 'block';
    });
  }
  renderBattleLobby();
}

// Render Battle Lobby opponents
function renderBattleLobby() {
  const container = document.getElementById('battleOpponentsList');
  if (!container) return;
  container.innerHTML = '';

  QUIZ_BATTLES.opponents.forEach(opp => {
    const card = document.createElement('div');
    card.className = `battle-opponent-card ${opp.level > 4 ? 'challenger-level-high' : ''}`;
    
    card.innerHTML = `
      <div class="battle-opponent-avatar">${opp.avatar}</div>
      <h4 style="margin: 0; font-size:14px;">${opp.name}</h4>
      <span style="font-size: 11px; color: var(--text-dim);">${opp.school}</span>
      <div style="display:flex; gap:10px; font-size:11px; margin-top:4px;">
        <span class="logo-badge" style="background:rgba(99,102,241,0.15); color:var(--accent-indigo); margin:0;">Lvl ${opp.level}</span>
        <span class="logo-badge" style="background:rgba(34,197,94,0.15); color:var(--accent-green); margin:0;">${opp.winRate} WR</span>
      </div>
      <button class="primary-btn" style="width:100%; margin-top:8px; font-size:11px; padding:6px 12px;">Challenge</button>
    `;

    card.addEventListener('click', () => {
      startMatchmaking(opp);
    });

    container.appendChild(card);
  });
}

function startMatchmaking(opponent) {
  state.battle.activeOpponent = opponent;
  
  document.getElementById('battle-lobby-screen').style.display = 'none';
  document.getElementById('battle-matchmaking-screen').style.display = 'flex';
  document.getElementById('opponentBattleAvatar').textContent = opponent.avatar;
  
  const statusLabel = document.getElementById('battleMatchmakingStatus');
  statusLabel.textContent = "Connecting to exam matchmaking room...";
  
  setTimeout(() => {
    statusLabel.textContent = `Opponent accepted! Joining room with ${opponent.name}...`;
    setTimeout(() => {
      launchBattleArena();
    }, 1200);
  }, 1200);
}

function launchBattleArena() {
  const opponent = state.battle.activeOpponent;
  state.battle.playerHp = 100;
  state.battle.opponentHp = 100;
  state.battle.currentQuestionIndex = 0;
  
  document.getElementById('opponentBattleName').textContent = opponent.name;
  updateBattleHpBars();

  document.getElementById('battle-matchmaking-screen').style.display = 'none';
  document.getElementById('battle-arena-screen').style.display = 'block';

  loadBattleQuestion();
}

function updateBattleHpBars() {
  document.getElementById('playerBattleScore').textContent = `HP: ${state.battle.playerHp}/100`;
  document.getElementById('playerBattleHpBar').style.width = `${state.battle.playerHp}%`;
  
  document.getElementById('opponentBattleScore').textContent = `HP: ${state.battle.opponentHp}/100`;
  document.getElementById('opponentBattleHpBar').style.width = `${state.battle.opponentHp}%`;
}

function loadBattleQuestion() {
  const idx = state.battle.currentQuestionIndex;
  const questions = QUIZ_BATTLES.questions;
  
  if (idx >= questions.length || state.battle.playerHp <= 0 || state.battle.opponentHp <= 0) {
    endQuizBattle();
    return;
  }

  const q = questions[idx];
  document.getElementById('battleQuestionNum').textContent = `Battle Question ${idx + 1} of ${questions.length}`;
  document.getElementById('battleQuestionText').textContent = q.question;

  const optionsContainer = document.getElementById('battleOptionsContainer');
  optionsContainer.innerHTML = '';

  const alphabet = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, optIdx) => {
    const item = document.createElement('div');
    item.className = 'option-item';
    
    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.textContent = alphabet[optIdx];
    
    const label = document.createElement('span');
    label.style.fontSize = '14px';
    label.textContent = opt;

    item.appendChild(marker);
    item.appendChild(label);
    
    item.addEventListener('click', () => {
      evaluateBattleAnswer(optIdx);
    });

    optionsContainer.appendChild(item);
  });

  state.battle.roundTimeRemaining = 10;
  document.getElementById('battleRoundTimer').textContent = `${state.battle.roundTimeRemaining}s Remaining`;
  
  clearInterval(state.battle.timerInterval);
  state.battle.timerInterval = setInterval(() => {
    state.battle.roundTimeRemaining -= 1;
    document.getElementById('battleRoundTimer').textContent = `${state.battle.roundTimeRemaining}s Remaining`;
    
    if (state.battle.roundTimeRemaining <= 0) {
      clearInterval(state.battle.timerInterval);
      evaluateBattleAnswer(-1);
    }
  }, 1000);
}

function evaluateBattleAnswer(selectedOptionIndex) {
  clearInterval(state.battle.timerInterval);
  
  const idx = state.battle.currentQuestionIndex;
  const q = QUIZ_BATTLES.questions[idx];
  const isPlayerCorrect = selectedOptionIndex === q.correctAnswer;
  
  const optionsContainer = document.getElementById('battleOptionsContainer');
  const items = optionsContainer.querySelectorAll('.option-item');
  
  if (selectedOptionIndex !== -1 && items[selectedOptionIndex]) {
    items[selectedOptionIndex].classList.add('selected');
    if (isPlayerCorrect) {
      items[selectedOptionIndex].style.borderColor = 'var(--accent-green)';
      items[selectedOptionIndex].style.background = 'rgba(34,197,94,0.15)';
    } else {
      items[selectedOptionIndex].style.borderColor = 'var(--accent-red)';
      items[selectedOptionIndex].style.background = 'rgba(239,68,68,0.15)';
    }
  }

  if (!isPlayerCorrect && items[q.correctAnswer]) {
    items[q.correctAnswer].style.borderColor = 'var(--accent-green)';
    items[q.correctAnswer].style.background = 'rgba(34,197,94,0.08)';
  }

  const oppWinRate = parseFloat(state.battle.activeOpponent.winRate) / 100;
  const isOpponentCorrect = Math.random() < oppWinRate;

  if (isPlayerCorrect) {
    const damage = Math.round(25 + state.battle.roundTimeRemaining * 1.5);
    state.battle.opponentHp = Math.max(0, state.battle.opponentHp - damage);
    showToast(`Correct! You dealt ${damage} HP damage to opponent.`);
  } else {
    state.battle.playerHp = Math.max(0, state.battle.playerHp - 30);
    showToast("Incorrect answer! You took 30 HP damage.", "error");
  }

  if (isOpponentCorrect) {
    const oppDmg = Math.round(15 + Math.random() * 10);
    state.battle.playerHp = Math.max(0, state.battle.playerHp - oppDmg);
    showToast(`${state.battle.activeOpponent.name} dealt ${oppDmg} HP damage to you.`, "error");
  } else {
    state.battle.opponentHp = Math.max(0, state.battle.opponentHp - 15);
    showToast(`${state.battle.activeOpponent.name} missed their answer and took 15 HP recoil damage.`);
  }

  updateBattleHpBars();

  setTimeout(() => {
    state.battle.currentQuestionIndex += 1;
    loadBattleQuestion();
  }, 2200);
}

function endQuizBattle() {
  clearInterval(state.battle.timerInterval);
  
  const won = state.battle.playerHp > state.battle.opponentHp;
  
  document.getElementById('battle-arena-screen').style.display = 'none';
  document.getElementById('battle-results-screen').style.display = 'flex';

  const outcomeEmoji = document.getElementById('battleOutcomeEmoji');
  const outcomeTitle = document.getElementById('battleOutcomeTitle');
  const outcomeDesc = document.getElementById('battleOutcomeDesc');

  if (won) {
    outcomeEmoji.textContent = '🏆';
    outcomeTitle.textContent = "Victory!";
    outcomeTitle.style.color = 'var(--accent-green)';
    
    ACHIEVEMENTS.milestones[2].completed = true;
    
    const battleBadge = ACHIEVEMENTS.badges.find(b => b.id === 'battle-5');
    if (battleBadge && !battleBadge.unlocked) {
      battleBadge.progress += 20;
      if (battleBadge.progress >= 100) {
        battleBadge.progress = 100;
        battleBadge.unlocked = true;
        showToast("Achievement Unlocked: Arena Knight! ⚔️", "success");
      }
    }

    const xpReward = 150;
    state.student.xp += xpReward;
    document.getElementById('xpCount').textContent = state.student.xp;
    outcomeDesc.innerHTML = `You defeated ${state.battle.activeOpponent.name} with ${state.battle.playerHp} HP remaining!<br><strong>Reward: +${xpReward} XP</strong>`;
    showToast(`Victory! +${xpReward} XP earned.`);
  } else {
    outcomeEmoji.textContent = '💀';
    outcomeTitle.textContent = "Defeat!";
    outcomeTitle.style.color = 'var(--accent-red)';
    outcomeDesc.textContent = `You lost to ${state.battle.activeOpponent.name}. Review this chapter's mock formulas to perform better next time.`;
    showToast("Defeat! Keep practicing to improve.", "error");
  }
}

// ================= SECURE AUTHENTICATION SYSTEM =================
function initLoginScreen() {
  // Setup Authentication state
  state.auth = {
    failedAttempts: 0,
    lockedOut: false,
    captchaSolved: false,
    currentCaptcha: { q: '', a: 0 },
    users: [
      { username: 'rohan_sharma', email: 'rohan@vidyaos.edu.in', password: 'Password@123', role: 'student' },
      { username: 'parent_sharma', email: 'parent.sharma@vidyaos.edu.in', password: 'Password@123', role: 'parent' },
      { username: 'parent', email: 'parent@vidyaos.edu.in', password: 'Password@123', role: 'parent' },
      { username: 'teacher_sharma', email: 'teacher.sharma@vidyaos.edu.in', password: 'Password@123', role: 'teacher' },
      { username: 'teacher', email: 'teacher@vidyaos.edu.in', password: 'Password@123', role: 'teacher' }
    ],
    inactivitySeconds: 0,
    sessionActive: false,
    rememberedRole: null
  };

  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm = document.getElementById('form-login-panel');
  const signupForm = document.getElementById('form-signup-panel');

  // --- Auth Tabs Toggling ---
  if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      loginTab.setAttribute('aria-selected', 'true');
      signupTab.classList.remove('active');
      signupTab.setAttribute('aria-selected', 'false');
      
      loginForm.style.display = 'flex';
      signupForm.style.display = 'none';
      logAudit('SYSTEM', 'Navigated to Sign In form');
    });

    signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      signupTab.setAttribute('aria-selected', 'true');
      loginTab.classList.remove('active');
      loginTab.setAttribute('aria-selected', 'false');
      
      signupForm.style.display = 'flex';
      loginForm.style.display = 'none';
      logAudit('SYSTEM', 'Navigated to Registration form');
    });
  }

  // --- Password Show/Hide Toggle ---
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  });

  // --- Sign Up Password Strength Meter & Real-time Checklist ---
  const signupPassword = document.getElementById('signup-password');
  if (signupPassword) {
    signupPassword.addEventListener('input', () => {
      const val = signupPassword.value;
      
      // Validation rules check
      const rules = {
        len: val.length >= 9,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        num: /[0-9]/.test(val),
        spec: /[!@#$%^&*]/.test(val),
        space: /^\S*$/.test(val) && val.length > 0
      };

      // Update UI checklist markers
      toggleCheckItem('chk-len', rules.len, 'At least 9 characters');
      toggleCheckItem('chk-upper', rules.upper, 'At least one uppercase letter (A-Z)');
      toggleCheckItem('chk-lower', rules.lower, 'At least one lowercase letter (a-z)');
      toggleCheckItem('chk-num', rules.num, 'At least one number (0-9)');
      toggleCheckItem('chk-spec', rules.spec, 'At least one special character (!@#$%^&*)');
      toggleCheckItem('chk-space', rules.space && val.length > 0, 'No spaces allowed');

      // Calculate strength score (0 to 4 levels)
      let score = 0;
      if (val.length > 0) {
        if (rules.len) score++;
        if (rules.upper && rules.lower) score++;
        if (rules.num) score++;
        if (rules.spec) score++;
        if (!rules.space) score = Math.max(0, score - 1); // Penality for spaces
      }

      // Update segment bars
      updateStrengthMeter(score);
    });
  }

  // Helper to toggle checkmark colors
  function toggleCheckItem(id, isValid, text) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isValid) {
      el.className = 'check-item valid';
      el.textContent = `✓ ${text}`;
    } else {
      el.className = 'check-item';
      el.textContent = `❌ ${text}`;
    }
  }

  // Helper to color meter segments
  function updateStrengthMeter(score) {
    const segments = [
      document.getElementById('seg-1'),
      document.getElementById('seg-2'),
      document.getElementById('seg-3'),
      document.getElementById('seg-4')
    ];
    const label = document.getElementById('strength-label');

    // Reset colors
    segments.forEach(seg => {
      if (seg) seg.className = 'strength-segment';
    });

    if (score === 0) {
      if (label) label.textContent = 'Password Strength: Empty';
      if (label) label.style.color = 'var(--text-dim)';
      return;
    }

    const val = signupPassword.value;
    const isVeryStrong = score === 4 && val.length >= 12;

    if (isVeryStrong) {
      segments.forEach(seg => { if (seg) seg.classList.add('very-strong'); });
      if (label) {
        label.textContent = 'Password Strength: Very Strong 💪';
        label.style.color = 'var(--accent-green)';
      }
    } else if (score === 4) {
      segments[0].classList.add('strong');
      segments[1].classList.add('strong');
      segments[2].classList.add('strong');
      if (label) {
        label.textContent = 'Password Strength: Strong 🛡️';
        label.style.color = 'var(--accent-blue)';
      }
    } else if (score === 3) {
      segments[0].classList.add('fair');
      segments[1].classList.add('fair');
      if (label) {
        label.textContent = 'Password Strength: Fair 📈';
        label.style.color = 'var(--accent-orange)';
      }
    } else {
      segments[0].classList.add('weak');
      if (label) {
        label.textContent = 'Password Strength: Weak ⚠️';
        label.style.color = 'var(--accent-red)';
      }
    }
  }

  // --- Real-time Field Validations (Blur Validation) ---
  const inputsToValidate = [
    { id: 'login-identity', type: 'required', errId: 'login-identity-err' },
    { id: 'login-password', type: 'required', errId: 'login-password-err' },
    { id: 'signup-username', type: 'username', errId: 'signup-username-err' },
    { id: 'signup-email', type: 'email', errId: 'signup-email-err' },
    { id: 'signup-password', type: 'signup-password', errId: 'signup-password-err' }
  ];

  inputsToValidate.forEach(field => {
    const el = document.getElementById(field.id);
    if (el) {
      el.addEventListener('blur', () => {
        validateField(el, field.type, field.errId);
      });
    }
  });

  function validateField(el, type, errId) {
    const val = el.value.trim();
    const errEl = document.getElementById(errId);
    let errorMsg = '';
    let isValid = true;

    if (type === 'required' && !val) {
      errorMsg = 'This field is required';
      isValid = false;
    } else if (type === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!val) {
        errorMsg = 'Username is required';
        isValid = false;
      } else if (!usernameRegex.test(val)) {
        errorMsg = 'Username must be 3-20 characters (alphanumeric & underscores only)';
        isValid = false;
      }
    } else if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        errorMsg = 'Email address is required';
        isValid = false;
      } else if (!emailRegex.test(val)) {
        errorMsg = 'Please enter a valid email address (e.g. name@domain.com)';
        isValid = false;
      }
    } else if (type === 'signup-password') {
      const hasUpper = /[A-Z]/.test(el.value);
      const hasLower = /[a-z]/.test(el.value);
      const hasNum = /[0-9]/.test(el.value);
      const hasSpec = /[!@#$%^&*]/.test(el.value);
      const noSpace = /^\S*$/.test(el.value);
      
      if (el.value.length < 9) {
        errorMsg = 'Password must be at least 9 characters';
        isValid = false;
      } else if (!hasUpper || !hasLower || !hasNum || !hasSpec || !noSpace) {
        errorMsg = 'Password does not meet complexity requirements below';
        isValid = false;
      }
    }

    if (errEl) {
      errEl.textContent = errorMsg;
    }

    if (!isValid) {
      el.classList.add('invalid-field');
      el.classList.remove('valid-field');
    } else {
      el.classList.remove('invalid-field');
      if (val) el.classList.add('valid-field');
    }

    return isValid;
  }

  // --- Dynamic Math CAPTCHA Generator ---
  function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 2;
    state.auth.currentCaptcha = {
      q: `⚠️ Math CAPTCHA: Solve ${n1} + ${n2}`,
      a: n1 + n2
    };
    
    const label = document.getElementById('captcha-question-label');
    const input = document.getElementById('captcha-input');
    
    if (label) label.textContent = state.auth.currentCaptcha.q;
    if (input) input.value = '';
    
    logAudit('SECURITY', `Generated CAPTCHA challenge: ${n1} + ${n2}`);
  }

  // --- Account Brute-force Lockout timer ---
  function runLockoutTimer() {
    state.auth.lockedOut = true;
    
    const block = document.getElementById('lockout-block');
    const timerLabel = document.getElementById('lockout-timer');
    const submitBtn = document.getElementById('login-submit-btn');
    
    if (block) block.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

    // Disable all login fields
    const fields = ['login-identity', 'login-password', 'captcha-input'];
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el) el.disabled = true;
    });

    let secondsLeft = 30;
    if (timerLabel) timerLabel.textContent = secondsLeft;
    
    logAudit('SECURITY', 'Account locked out due to 5 failed attempts.');

    const interval = setInterval(() => {
      secondsLeft--;
      if (timerLabel) timerLabel.textContent = secondsLeft;

      if (secondsLeft <= 0) {
        clearInterval(interval);
        
        // Unlock
        state.auth.lockedOut = false;
        state.auth.failedAttempts = 0;
        
        if (block) block.style.display = 'none';
        document.getElementById('captcha-block').style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
        
        fields.forEach(f => {
          const el = document.getElementById(f);
          if (el) el.disabled = false;
        });

        logAudit('SECURITY', 'Account lockout expired. Inputs re-enabled.');
      }
    }, 1000);
  }

  // --- Audit Logging Helper (Frontend Representation) ---
  function logAudit(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT LOG - ${type}] Timestamp: ${timestamp} | Info: ${message} | UA: ${navigator.userAgent}`);
  }

  // --- Sign In Form Submit Listener ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (state.auth.lockedOut) return;

      const identityEl = document.getElementById('login-identity');
      const passwordEl = document.getElementById('login-password');

      const isIdentityValid = validateField(identityEl, 'required', 'login-identity-err');
      const isPasswordValid = validateField(passwordEl, 'required', 'login-password-err');

      if (!isIdentityValid || !isPasswordValid) return;

      const identityVal = identityEl.value.trim();
      const passwordVal = passwordEl.value;

      // CAPTCHA check
      if (state.auth.failedAttempts >= 3) {
        const captchaInput = document.getElementById('captcha-input');
        const userAns = parseInt(captchaInput.value.trim());
        
        if (userAns !== state.auth.currentCaptcha.a) {
          document.getElementById('captcha-err').textContent = 'Incorrect CAPTCHA answer';
          captchaInput.classList.add('invalid-field');
          generateCaptcha();
          
          state.auth.failedAttempts++;
          logAudit('SECURITY_FAIL', `Incorrect CAPTCHA entered. Total failures: ${state.auth.failedAttempts}`);
          
          if (state.auth.failedAttempts >= 5) {
            runLockoutTimer();
          }
          return;
        } else {
          document.getElementById('captcha-err').textContent = '';
          captchaInput.classList.remove('invalid-field');
          captchaInput.classList.add('valid-field');
        }
      }

      // Check credentials (case-insensitive for username/email)
      const user = state.auth.users.find(u => 
        (u.email.toLowerCase() === identityVal.toLowerCase() || u.username.toLowerCase() === identityVal.toLowerCase()) && 
        u.password === passwordVal
      );

      const submitBtn = document.getElementById('login-submit-btn');
      submitBtn.textContent = 'Authenticating Securely...';
      submitBtn.disabled = true;

      // Simulate secure network latency
      setTimeout(() => {
        if (user) {
          // Success!
          logAudit('AUTH_SUCCESS', `User ${user.username} authenticated successfully.`);
          
          // Reset failures
          state.auth.failedAttempts = 0;
          document.getElementById('captcha-block').style.display = 'none';

          // Trigger simulated 2FA OTP Screen
          triggerTwoFactorVerification(user);
        } else {
          // Failure
          state.auth.failedAttempts++;
          logAudit('AUTH_FAIL', `Failed login attempt for identity: ${identityVal}. Total failures: ${state.auth.failedAttempts}`);

          submitBtn.textContent = 'Sign In';
          submitBtn.disabled = false;

          // Vague error message for security
          document.getElementById('login-identity-err').textContent = 'Invalid email or password';
          identityEl.classList.add('invalid-field');
          passwordEl.classList.add('invalid-field');

          if (state.auth.failedAttempts === 3) {
            document.getElementById('captcha-block').style.display = 'flex';
            generateCaptcha();
            showToast("Security Check: CAPTCHA required", "error");
          } else if (state.auth.failedAttempts >= 5) {
            runLockoutTimer();
          }
        }
      }, 1000);
    });
  }

  // --- Sign Up Form Submit Listener ---
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameEl = document.getElementById('signup-username');
      const emailEl = document.getElementById('signup-email');
      const passwordEl = document.getElementById('signup-password');
      const roleVal = document.getElementById('signup-role').value;
      const classVal = document.getElementById('signup-class').value;
      const boardVal = document.getElementById('signup-board').value;
      const academicYearVal = document.getElementById('signup-academic-year').value;

      const isUserValid = validateField(usernameEl, 'username', 'signup-username-err');
      const isEmailValid = validateField(emailEl, 'email', 'signup-email-err');
      const isPasswordValid = validateField(passwordEl, 'signup-password', 'signup-password-err');

      if (!isUserValid || !isEmailValid || !isPasswordValid) {
        showToast("Please fix the validation errors", "error");
        return;
      }

      const submitBtn = document.getElementById('signup-submit-btn');
      submitBtn.textContent = 'Creating Account Workspace...';
      submitBtn.disabled = true;

      setTimeout(() => {
        // Register user in local memory
        const newUser = {
          username: usernameEl.value.trim(),
          email: emailEl.value.trim(),
          password: passwordEl.value,
          role: roleVal,
          className: classVal,
          board: boardVal,
          academicYear: academicYearVal
        };

        state.auth.users.push(newUser);
        logAudit('REGISTRATION_SUCCESS', `New account created: ${newUser.username} with role: ${newUser.role}`);

        showToast("Registration completed! Please sign in with your password.", "success");

        // Clear and switch tab
        usernameEl.value = '';
        emailEl.value = '';
        passwordEl.value = '';
        document.getElementById('signup-phone').value = '';
        
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
        
        loginTab.click(); // Redirect back to Sign In
      }, 1200);
    });
  }

  // --- Simulated 2FA Verification Flow ---
  function triggerTwoFactorVerification(user) {
    const loginCard = document.querySelector('.login-card');
    if (!loginCard) return;
    
    // Hide standard forms and tabs safely
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    
    const authTabs = document.querySelector('.auth-tabs');
    if (authTabs) authTabs.style.display = 'none';
    
    const ssoDivider = document.querySelector('.sso-divider');
    if (ssoDivider) ssoDivider.style.display = 'none';
    
    const ssoButtons = document.querySelector('.sso-buttons');
    if (ssoButtons) ssoButtons.style.display = 'none';

    // Remove existing OTP form if any
    const oldOtp = document.getElementById('form-otp-panel');
    if (oldOtp) oldOtp.remove();

    // Create OTP form
    const otpForm = document.createElement('form');
    otpForm.id = 'form-otp-panel';
    otpForm.novalidate = true;
    otpForm.style.cssText = 'display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.4s ease-out;';
    
    otpForm.innerHTML = `
      <h3 style="color: var(--accent-indigo); margin-bottom: 4px; font-weight:700;">🔒 Two-Factor Verification</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">We sent a 6-digit OTP verification code to your registered device.<br>Enter test code: <strong style="color:var(--accent-indigo);">123456</strong> to proceed.</p>
      
      <div class="login-form-group" style="text-align: left;">
        <label for="otp-code" style="font-size:12px; font-weight:600; color:var(--text-muted);">Enter 6-Digit Code</label>
        <input type="text" id="otp-code" class="form-input" autocomplete="one-time-code" maxlength="6" style="text-align: center; font-size: 24px; letter-spacing: 8px; width: 100%; font-weight: 800;" placeholder="••••••" required>
        <span class="error-msg" id="otp-err" aria-live="polite" style="color: var(--accent-red); font-size: 11px; margin-top: 4px; display: block;"></span>
      </div>

      <button type="submit" id="otp-submit-btn" class="primary-btn" style="width: 100%; padding: 14px; margin-top: 10px;">Verify & Enter Workspace</button>
      <button type="button" id="otp-back-btn" class="sec-btn" style="width: 100%; padding: 10px; font-size: 12px;">Back to Sign In</button>
    `;

    loginCard.appendChild(otpForm);

    // Binds Back button
    const otpBackBtn = document.getElementById('otp-back-btn');
    if (otpBackBtn) {
      otpBackBtn.addEventListener('click', () => {
        otpForm.remove();
        
        const authTabs = document.querySelector('.auth-tabs');
        if (authTabs) authTabs.style.display = 'flex';
        
        const ssoDivider = document.querySelector('.sso-divider');
        if (ssoDivider) ssoDivider.style.display = 'flex';
        
        const ssoButtons = document.querySelector('.sso-buttons');
        if (ssoButtons) ssoButtons.style.display = 'grid';
        
        if (loginForm) loginForm.style.display = 'flex';
        
        // Reset submit button
        const submitBtn = document.getElementById('login-submit-btn');
        if (submitBtn) {
          submitBtn.textContent = 'Sign In';
          submitBtn.disabled = false;
        }
        logAudit('2FA', 'User cancelled 2FA check');
      });
    }

    // Binds Submit OTP
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('otp-code');
      const errEl = document.getElementById('otp-err');

      if (codeInput.value.trim() !== '123456') {
        errEl.textContent = 'Invalid verification code. Please enter 123456';
        codeInput.classList.add('invalid-field');
        logAudit('2FA_FAIL', 'Incorrect 2FA code entered.');
        return;
      }

      errEl.textContent = '';
      codeInput.classList.remove('invalid-field');
      codeInput.classList.add('valid-field');

      const otpSubmitBtn = document.getElementById('otp-submit-btn');
      otpSubmitBtn.textContent = 'Creating Session...';
      otpSubmitBtn.disabled = true;

      setTimeout(() => {
        otpForm.remove();
        
        // Show app shell and set role
        switchRole(user.role);
        
        const loginScreen = document.getElementById('loginScreen');
        const appShell = document.getElementById('appShell');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';
        
        // Reset login button text
        const loginBtn = document.getElementById('login-submit-btn');
        if (loginBtn) {
          loginBtn.textContent = 'Sign In';
          loginBtn.disabled = false;
        }

        state.auth.sessionActive = true;
        state.auth.inactivitySeconds = 0;
        showToast(`Welcome back, ${user.username}!`, 'success');
        logAudit('AUTH_COMPLETE', `2FA verification succeeded. Session activated.`);
      }, 1000);
    });
  }

  // --- Quick Fill Action helpers ---
  const fillStudent = document.getElementById('fill-student');
  const fillParent = document.getElementById('fill-parent');
  const fillTeacher = document.getElementById('fill-teacher');
  const loginIdentity = document.getElementById('login-identity');
  const loginPassword = document.getElementById('login-password');

  if (fillStudent && loginIdentity && loginPassword) {
    fillStudent.addEventListener('click', () => {
      loginIdentity.value = 'rohan@vidyaos.edu.in';
      loginPassword.value = 'Password@123';
      showToast("Filled Student Credentials");
    });
  }

  if (fillParent && loginIdentity && loginPassword) {
    fillParent.addEventListener('click', () => {
      loginIdentity.value = 'parent@vidyaos.edu.in';
      loginPassword.value = 'Password@123';
      showToast("Filled Parent Credentials");
    });
  }

  if (fillTeacher && loginIdentity && loginPassword) {
    fillTeacher.addEventListener('click', () => {
      loginIdentity.value = 'teacher@vidyaos.edu.in';
      loginPassword.value = 'Password@123';
      showToast("Filled Teacher Credentials");
    });
  }

  // --- Forgot Password Action ---
  const forgotPw = document.getElementById('forgot-password-link');
  if (forgotPw) {
    forgotPw.addEventListener('click', () => {
      const email = prompt("Enter your registered email address for reset instructions:");
      if (email === null) return; // cancelled
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        showToast("Invalid email format entered!", "error");
        return;
      }
      
      showToast("✓ Time-limited reset link sent! (Expires in 15 mins)", "success");
      logAudit('FORGOT_PASSWORD', `Password reset requested for email: ${email}`);
    });
  }

  // --- SSO handshakes simulated click ---
  const ssoIds = ['sso-google', 'sso-apple', 'sso-github'];
  ssoIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const originalText = btn.textContent;
        btn.textContent = 'Connecting...';
        btn.disabled = true;
        
        logAudit('SSO_ATTEMPT', `SSO handshake requested via ${id}`);

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          
          // Route default student
          switchRole('student');
          const loginScreen = document.getElementById('loginScreen');
          const appShell = document.getElementById('appShell');
          if (loginScreen) loginScreen.style.display = 'none';
          if (appShell) appShell.style.display = 'flex';

          state.auth.sessionActive = true;
          state.auth.inactivitySeconds = 0;
          showToast("SSO Authentication Completed", "success");
          logAudit('SSO_SUCCESS', `SSO handshake authenticated successfully via ${id}`);
        }, 1200);
      });
    }
  });

  // --- Session Cleanup Helper ---
  function resetSessionState() {
    state.auth.sessionActive = false;
    state.tutor.activeQuiz = null;
    state.tutor.activeTopic = null;
    state.tutor.chatHistory = [
      { sender: 'bot', text: CHAT_BOT_RESPONSES.greeting, suggestions: ["Ohm's Law 💡", "Balance Equations 🔬", "Quadratic Formula 📐", "Explain Prism 🌈"] }
    ];
    
    const loginScreen = document.getElementById('loginScreen');
    const appShell = document.getElementById('appShell');
    
    if (loginScreen) {
      loginScreen.style.display = 'flex';
      
      // Restore standard panels/tabs
      document.querySelector('.auth-tabs').style.display = 'flex';
      document.querySelector('.sso-divider').style.display = 'flex';
      document.querySelector('.sso-buttons').style.display = 'grid';
      if (typeof loginForm !== 'undefined' && loginForm) {
        loginForm.style.display = 'flex';
      } else {
        const lf = document.getElementById('form-login-panel');
        if (lf) lf.style.display = 'flex';
      }
      
      // Remove 2FA OTP if present
      const otpForm = document.getElementById('form-otp-panel');
      if (otpForm) otpForm.remove();
    }
    
    if (appShell) appShell.style.display = 'none';
  }

  // --- Sign Out Button Action ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      resetSessionState();
      showToast("Signed out successfully.", "success");
      logAudit('LOGOUT_MANUAL', 'User manually logged out of workspace.');
    });
  }

  // --- Auto-logout inactivity timer ---
  // Reset inactivity timer on interaction events
  const resetActivity = () => {
    if (state.auth && state.auth.sessionActive) {
      state.auth.inactivitySeconds = 0;
    }
  };

  const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart'];
  activityEvents.forEach(evt => {
    window.addEventListener(evt, resetActivity);
  });

  const inactivityWarningSeconds = 28 * 60;
  const inactivityLogoutSeconds = 30 * 60;

  // Dynamic ticking every second
  setInterval(() => {
    if (state.auth && state.auth.sessionActive) {
      state.auth.inactivitySeconds++;

      // Warn shortly before the study session expires.
      if (state.auth.inactivitySeconds === inactivityWarningSeconds) {
        showToast("⚠️ Idle Warning: You will be logged out in 2 minutes due to inactivity.", "error");
        logAudit('INACTIVITY', 'Inactivity warning triggered with 2 minutes remaining.');
      }

      // Auto-logout after 30 minutes of idle time.
      if (state.auth.inactivitySeconds >= inactivityLogoutSeconds) {
        resetSessionState();
        showToast("Logged out automatically due to inactivity.", "error");
        logAudit('LOGOUT_AUTO', 'Session expired. Automatic logout executed due to 30m inactivity.');
      }
    }
  }, 1000);
}
