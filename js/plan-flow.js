(function(){
  // Fade-in on load
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.classList.add('page-enter');
    requestAnimationFrame(()=>{
      document.body.classList.add('page-enter-active');
    });
  });
  const flowContent = document.getElementById('flowContent');
  const backBtn = document.getElementById('flowBackBtn');
  const progressFill = document.getElementById('flowProgress');
  const stepsRemainingEl = document.getElementById('stepsRemaining');
  const progressAvatar = document.querySelector('.progress-avatar');

  const TOTAL_STEPS = 5; // Course, Goals, Concepts, Knowledge, Date
  const START_OFFSET_PCT = 12; // small head-start to make progress feel begun
  let stepIndex = 1;

  const state = {
    course: '',
    goals: [],
    concepts: [],
    knowledge: '',
    dueDate: ''
  };

  const sampleCourses = ['BIOL 210', 'CHEM 101', 'HIST 205', 'PSYC 110', 'MATH 221', 'IBUS 330'];
  const currentCourses = ['BIOL 210', 'IBUS 330'];
  const defaultGoals = ['Exam 1', 'Exam 2', 'Exam 3'];
  const defaultConcepts = ['Anatomy & Physiology', 'Cells & Tissues', 'Integumentary System', 'Muscular System'];

  const knowledgeToPill = {
    'Not at all': 'Not at all confident',
    'Somewhat': 'Somewhat confident',
    'Very': 'Very confident',
    "I don't know": "Not sure",
    'start from scratch': 'Start from scratch',
    'speed me along': 'Speed me along',
    'I just want extra practice': 'Extra practice',
    'help me diagnose': 'Help me diagnose'
  };

  const knowledgeToHeadline = {
    'Not at all': "We'll start at the basics and build up quickly.",
    'Somewhat': "We’ll move fast, fine-tune weak areas, and review test-style questions.",
    'Very': "We’ll focus on refinement and high-yield practice.",
    "I don't know": "We’ll figure it out together and adapt as we go.",
    'start from scratch': "We’ll teach core concepts and ramp up gently.",
    'speed me along': "We’ll accelerate with targeted practice and checkpoints.",
    'I just want extra practice': "We’ll emphasize practice problems and recall.",
    'help me diagnose': "We’ll start with a quick diagnostic to find gaps."
  };

  function updateProgress() {
    let pct = (stepIndex-1)/TOTAL_STEPS * 100;
    if (pct === 0) pct = START_OFFSET_PCT; // first screen: show slight progress
    progressFill.style.width = pct + '%';
    const remaining = Math.max(0, TOTAL_STEPS - (stepIndex-1));
    if (stepsRemainingEl) {
      stepsRemainingEl.textContent = `${remaining} step${remaining===1?'':'s'} remaining`;
    }
    if (progressAvatar) {
      progressAvatar.style.left = `calc(${pct}% - 20px)`; // 20px = half of 40px avatar
    }
  }

  function render() {
    updateProgress();
    switch(stepIndex){
      case 1: return renderCourse();
      case 2: return renderGoals();
      case 3: return renderConcepts();
      case 4: return renderKnowledge();
      case 5: return renderDate();
      case 6: return renderLoading();
    }
  }

  function next(){ stepIndex = Math.min(6, stepIndex+1); render(); }
  function prev(){ if(stepIndex>1){ stepIndex--; render(); } else { window.history.back(); } }

  // Step 1: Course selection (single select, auto next)
  function renderCourse(){
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">Let’s make a plan. What are you studying?</h1>`+
      `<div class="search-row">`+
      `  <div class="search-field">`+
      `    <span class="material-icons-round search-icon" aria-hidden="true">search</span>`+
      `    <input id="courseSearch" class="search-input" placeholder="Find a course (e.g. BIO 110)" aria-label="Find a course" />`+
      `  </div>`+
      `  <div id="courseDropdown" class="dropdown"></div>`+
      `</div>`+
      `<div class="subtle">Your courses</div>`+
      `<div class="course-list-card" id="courseList"></div>`+
      `<div class="course-cta hidden" id="coursesCta" style="margin-top:48px;"><button class="primary-btn" id="coursesContinue">Continue</button></div>`;

    const search = document.getElementById('courseSearch');
    const dropdown = document.getElementById('courseDropdown');
    const list = document.getElementById('courseList');

    const courseSubtitle = {
      'BIOL 210': 'Human anatomy and physiology',
      'IBUS 330': 'International Business and Multicultural...',
      'PSYC 110': 'Introduction to Psychology',
      'CHEM 101': 'General chemistry fundamentals',
      'HIST 205': 'World history since 1500',
      'MATH 221': 'Calculus I'
    };
    function populateList(items){
      list.innerHTML = items.map(c => `
        <div class="course-row" data-course="${c}">
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text">
            <div class="course-title">${escapeHtml(c)}</div>
            <div class="course-subtitle">${escapeHtml(courseSubtitle[c] || 'Course description')}</div>
          </div>
        </div>
      `).join('');
      // Restore prior selection if any
      if(state.course){
        const sel = list.querySelector(`[data-course="${CSS.escape(state.course)}"]`);
        if(sel){ sel.classList.add('selected'); }
        const cta = document.getElementById('coursesCta');
        if(cta) cta.classList.toggle('hidden', !state.course);
      }
    }
    populateList(currentCourses);

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      const matches = sampleCourses.filter(c => c.toLowerCase().includes(q));
      if(q.length>0 && matches.length>0){
        dropdown.style.display = 'block';
        dropdown.innerHTML = matches.map(c=>`<div class="dropdown-item" data-course="${c}">${c}</div>`).join('');
      } else {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
      }
    });

    dropdown.addEventListener('click', (e)=>{
      const item = e.target.closest('.dropdown-item');
      if(!item) return;
      state.course = item.dataset.course;
      const cta = document.getElementById('coursesCta');
      if(cta) cta.classList.toggle('hidden', !state.course);
      dropdown.style.display = 'none';
    });

    list.addEventListener('click', (e)=>{
      const item = e.target.closest('.course-row');
      if(!item) return;
      list.querySelectorAll('.course-row').forEach(r=>r.classList.remove('selected'));
      item.classList.add('selected');
      state.course = item.dataset.course;
      const cta = document.getElementById('coursesCta');
      if(cta) cta.classList.toggle('hidden', !state.course);
    });

    document.getElementById('coursesContinue').addEventListener('click', ()=>{
      if(state.course) next();
    });
  }

  // Step 2: Goal selection (multi, Continue visible when >=1)
  function renderGoals(){
    const goals = [...defaultGoals];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What should be included from ${escapeHtml(state.course)}?</h1>`+
      `<div class="course-list-card" id="goalList"></div>`+
      `<div class="course-list-card" id="addGoalCard">`+
      `  <div class="course-row" id="addGoalRow">`+
      `    <div class="course-check add" aria-hidden="true"></div>`+
      `    <div class="course-text"><div class="course-title">Add new goal</div></div>`+
      `  </div>`+
      `</div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;

    const list = document.getElementById('goalList');
    function rowHtml(text, attrs){
      const selected = Array.isArray(state.goals) && state.goals.includes(text);
      return `<div class="course-row ${selected?'selected':''}" ${attrs}>
        <div class="course-check" aria-hidden="true"></div>
        <div class="course-text"><div class="course-title">${escapeHtml(text)}</div></div>
      </div>`;
    }
    function renderList(){
      const allSelected = state.goals.length === goals.length && goals.length>0;
      const allRow = `<div class="course-row ${allSelected?'selected':''}" data-select-all="1">
        <div class="course-check" aria-hidden="true"></div>
        <div class="course-text"><div class="course-title">All</div></div>
      </div>`;
      const items = goals.map(g=> rowHtml(g, `data-goal="${g}"`)).join('');
      list.innerHTML = allRow + items;
      const goalsCta = document.getElementById('goalsContinue').parentElement;
      const disabled = state.goals.length===0;
      document.getElementById('goalsContinue').disabled = disabled;
      goalsCta.classList.toggle('hidden', disabled);
    }
    renderList();

    list.addEventListener('click', (e)=>{
      const all = e.target.closest('[data-select-all]');
      if(all){ state.goals = goals.slice(); renderList(); return; }
      const item = e.target.closest('.course-row');
      if(!item) return; const g = item.getAttribute('data-goal'); if(!g) return;
      const i = state.goals.indexOf(g);
      if(i>=0) state.goals.splice(i,1); else state.goals.push(g);
      renderList();
    });

    document.getElementById('addGoalRow').addEventListener('click', ()=>{
      const name = prompt('Goal name');
      if(name){ const trimmed = name.trim(); if(trimmed && !goals.includes(trimmed)){ goals.push(trimmed); }}
      renderList();
    });

    document.getElementById('goalsContinue').addEventListener('click', next);
  }

  // Step 3: Concept selection (multi with expandable terms)
  function renderConcepts(){
    const concepts = [...defaultConcepts];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What’s going to be on ${escapeHtml(state.goals.join(', ') || state.course)}?</h1>`+
      `<div class="course-list-card" id="conceptList"></div>`+
      `<div class="course-list-card" id="addConceptCard">`+
      `  <div class="course-row" id="addConceptRow">`+
      `    <div class="course-check add" aria-hidden="true"></div>`+
      `    <div class="course-text"><div class="course-title">Add new concept</div></div>`+
      `  </div>`+
      `</div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;

    const list = document.getElementById('conceptList');
    function rowHtml(text, attrs){
      const selected = Array.isArray(state.concepts) && state.concepts.includes(text);
      return `<div class="course-row ${selected?'selected':''}" ${attrs}>
        <div class="course-check" aria-hidden="true"></div>
        <div class="course-text"><div class="course-title">${escapeHtml(text)}</div></div>
      </div>`;
    }
    function renderList(){
      const allSelected = state.concepts.length === concepts.length && concepts.length>0;
      const allRow = `<div class="course-row ${allSelected?'selected':''}" data-select-all="1">
        <div class="course-check" aria-hidden="true"></div>
        <div class="course-text"><div class="course-title">All</div></div>
      </div>`;
      const items = concepts.map(c=> rowHtml(c, `data-concept="${c}"`)).join('');
      list.innerHTML = allRow + items;
      const cta = document.getElementById('conceptsContinue').parentElement;
      const disabled = state.concepts.length===0;
      document.getElementById('conceptsContinue').disabled = disabled;
      cta.classList.toggle('hidden', disabled);
    }
    renderList();

    list.addEventListener('click', (e)=>{
      const all = e.target.closest('[data-select-all]');
      if(all){ state.concepts = concepts.slice(); renderList(); return; }
      const item = e.target.closest('.course-row');
      if(!item) return; const c = item.getAttribute('data-concept'); if(!c) return;
      const i = state.concepts.indexOf(c);
      if(i>=0) state.concepts.splice(i,1); else state.concepts.push(c);
      renderList();
    });

    document.getElementById('addConceptRow').addEventListener('click', ()=>{
      const name = prompt('Concept name');
      if(name){ const trimmed = name.trim(); if(trimmed && !concepts.includes(trimmed)){ concepts.push(trimmed); }}
      renderList();
    });

    document.getElementById('conceptsContinue').addEventListener('click', next);
  }

  // Step 4: Knowledge state (single select, auto-advance)
  function renderKnowledge(){
    const options = [
      'Not at all, start from scratch',
      'Somewhat, speed me along',
      'Very, I just want extra practice',
      "I don’t know, help me diagnose"
    ];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">How confident are you feeling already?</h1>`+
      `<div class="options-card" id="knowledgeCard"></div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="knowledgeContinue" disabled>Continue</button></div>`;
    const card = document.getElementById('knowledgeCard');
    const knowledgeContinue = document.getElementById('knowledgeContinue');
    card.innerHTML = options.map((o, idx)=>`
      <div class="option-row" data-k="${o}">
        <div class="option-radio"></div>
        <div class="option-text">${escapeHtml(o)}</div>
      </div>
    `).join('');
    card.addEventListener('click', (e)=>{
      const row = e.target.closest('.option-row');
      if(!row) return;
      card.querySelectorAll('.option-row').forEach(r=>r.classList.remove('selected'));
      row.classList.add('selected');
      state.knowledge = row.dataset.k;
      knowledgeContinue.disabled = false;
      knowledgeContinue.parentElement.classList.remove('hidden');
    });
    knowledgeContinue.addEventListener('click', ()=>{ if(!knowledgeContinue.disabled) next(); });
  }

  // Step 5: Date selection
  function renderDate(){
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">When do you need to be ready for ${escapeHtml(state.goals[0] || state.course)}?</h1>`+
      `<input id="dueDate" class="date-input" type="date" />`+
      `<div class="cta-row" style="display:flex; flex-direction:column; gap:8px;">
        <button class="primary-btn" id="startBtn" disabled>Start studying</button>
        <button class="text-btn" id="skipBtn">Skip for now</button>
      </div>`;
    const input = document.getElementById('dueDate');
    const startBtn = document.getElementById('startBtn');
    input.addEventListener('input', ()=>{ state.dueDate = input.value; startBtn.disabled = !state.dueDate; });
    document.getElementById('skipBtn').addEventListener('click', goLoading);
    startBtn.addEventListener('click', goLoading);
  }

  function goLoading(){ stepIndex = 6; render(); }

  // Step 6: Loading
  function renderLoading(){
    flowContent.innerHTML = ''+
      `<div class="loading-wrap">
         <div class="loading-illustration"></div>
         <div class="flow-title" style="text-align:center;">Generating study plan.</div>
         <div class="loading-bar"><div class="fill"></div></div>
       </div>`;

    // Persist for bottom sheet
    const pill = knowledgeToPill[state.knowledge] || 'Somewhat confident';
    const headline = knowledgeToHeadline[state.knowledge] || knowledgeToHeadline['Somewhat'];
    try {
      localStorage.setItem('onboarding_sheet_open','true');
      localStorage.setItem('onboarding_knowledge_pill', pill);
      localStorage.setItem('onboarding_knowledge_headline', headline);
      if(state.course) localStorage.setItem('onboarding_course', state.course);
      if(state.goals && state.goals.length>0) localStorage.setItem('onboarding_goals', JSON.stringify(state.goals));
      if(state.concepts && state.concepts.length>0) localStorage.setItem('onboarding_concepts', JSON.stringify(state.concepts));
      if(state.dueDate) localStorage.setItem('plan_due_date', state.dueDate);
    } catch(_){}

    setTimeout(()=>{ window.location.href = '../html/study-plan.html'; }, 3500);
  }

  // Helpers
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
  function cssId(str){ return String(str||'').replace(/\s+/g,'-').replace(/[^a-zA-Z0-9_-]/g,''); }

  // Events
  backBtn.addEventListener('click', prev);
  render();
})();


