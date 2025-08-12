(function(){
  const flowContent = document.getElementById('flowContent');
  const backBtn = document.getElementById('flowBackBtn');
  const progressFill = document.getElementById('flowProgress');
  const stepsRemainingEl = document.getElementById('stepsRemaining');

  const TOTAL_STEPS = 5; // Course, Goals, Concepts, Knowledge, Date
  let stepIndex = 1;

  const state = {
    course: '',
    goals: [],
    concepts: [],
    knowledge: '',
    dueDate: ''
  };

  const sampleCourses = ['BIOL 210', 'CHEM 101', 'HIST 205', 'PSYC 110', 'MATH 221'];
  const currentCourses = ['BIOL 210', 'PSYC 110'];
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
    const pct = (stepIndex-1)/TOTAL_STEPS * 100;
    progressFill.style.width = pct + '%';
    const remaining = Math.max(0, TOTAL_STEPS - (stepIndex-1));
    stepsRemainingEl.textContent = `${remaining} step${remaining===1?'':'s'} remaining`;
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
      `  <input id="courseSearch" class="search-input" placeholder="Search for a course" />`+
      `  <div id="courseDropdown" class="dropdown"></div>`+
      `</div>`+
      `<div class="subtle">Your courses</div>`+
      `<div class="list" id="courseList"></div>`;

    const search = document.getElementById('courseSearch');
    const dropdown = document.getElementById('courseDropdown');
    const list = document.getElementById('courseList');

    function populateList(items){
      list.innerHTML = items.map(c => `<div class="list-item" data-course="${c}">${c}<span class="material-icons-round">chevron_right</span></div>`).join('');
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
      next();
    });

    list.addEventListener('click', (e)=>{
      const item = e.target.closest('.list-item');
      if(!item) return;
      state.course = item.dataset.course;
      next();
    });
  }

  // Step 2: Goal selection (multi, Continue visible when >=1)
  function renderGoals(){
    const goals = [...defaultGoals];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What should be included from ${escapeHtml(state.course)}?</h1>`+
      `<div class="list" id="goalList"></div>`+
      `<button class="text-btn" id="addGoalBtn">+ Add new goal</button>`+
      `<div class="cta-row"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;

    const list = document.getElementById('goalList');
    function renderList(){
      const allSelected = state.goals.length === goals.length && goals.length>0;
      const items = goals.map(g=>{
        const sel = state.goals.includes(g);
        return `<div class="list-item ${sel?'selected':''}" data-goal="${g}">
          <span>${escapeHtml(g)}</span>
          <span class="material-icons-round">${sel?'check_circle':'add_circle'}</span>
        </div>`;
      }).join('');
      list.innerHTML = `<div class="list-item ${allSelected?'selected':''}" data-select-all="1"><span>All</span><span class="material-icons-round">${allSelected?'check_circle':'select_all'}</span></div>` + items;
      document.getElementById('goalsContinue').disabled = state.goals.length===0;
    }
    renderList();

    list.addEventListener('click', (e)=>{
      const all = e.target.closest('[data-select-all]');
      if(all){ state.goals = goals.slice(); return renderList(); }
      const item = e.target.closest('.list-item');
      if(!item) return; const g = item.dataset.goal; if(!g) return;
      const i = state.goals.indexOf(g);
      if(i>=0) state.goals.splice(i,1); else state.goals.push(g);
      renderList();
    });

    document.getElementById('addGoalBtn').addEventListener('click', ()=>{
      const name = prompt('Goal name');
      if(name && !goals.includes(name)){ goals.push(name); }
      renderList();
    });

    document.getElementById('goalsContinue').addEventListener('click', next);
  }

  // Step 3: Concept selection (multi with expandable terms)
  function renderConcepts(){
    const concepts = [...defaultConcepts];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What’s going to be on ${escapeHtml(state.goals.join(', ') || state.course)}?</h1>`+
      `<div class="list" id="conceptList"></div>`+
      `<button class="text-btn" id="addConceptBtn">+ Add new concept</button>`+
      `<div class="cta-row"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;

    const list = document.getElementById('conceptList');
    function conceptRow(name){
      const sel = state.concepts.includes(name);
      return `<div class="list-item" data-concept="${name}">
        <span>${escapeHtml(name)}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="material-icons-round caret" data-toggle="${name}">expand_more</span>
          <span class="material-icons-round">${sel?'check_circle':'add_circle'}</span>
        </div>
      </div>
      <div class="terms" id="terms-${cssId(name)}">${escapeHtml(name)} terms and definitions will appear here…</div>`;
    }
    function renderList(){
      list.innerHTML = `<div class="list-item ${state.concepts.length===concepts.length?'selected':''}" data-select-all="1"><span>All</span><span class="material-icons-round">${state.concepts.length===concepts.length?'check_circle':'select_all'}</span></div>` + concepts.map(conceptRow).join('');
      document.getElementById('conceptsContinue').disabled = state.concepts.length===0;
    }
    renderList();

    list.addEventListener('click', (e)=>{
      const toggle = e.target.closest('[data-toggle]');
      if(toggle){
        const key = toggle.getAttribute('data-toggle');
        const panel = document.getElementById('terms-'+cssId(key));
        if(panel){ panel.style.display = panel.style.display==='block'?'none':'block'; }
        return;
      }
      const all = e.target.closest('[data-select-all]');
      if(all){ state.concepts = concepts.slice(); return renderList(); }
      const item = e.target.closest('.list-item');
      if(!item) return; const c = item.dataset.concept; if(!c) return;
      const i = state.concepts.indexOf(c);
      if(i>=0) state.concepts.splice(i,1); else state.concepts.push(c);
      renderList();
    });

    document.getElementById('addConceptBtn').addEventListener('click', ()=>{
      const name = prompt('Concept name');
      if(name && !concepts.includes(name)){ concepts.push(name); }
      renderList();
    });

    document.getElementById('conceptsContinue').addEventListener('click', next);
  }

  // Step 4: Knowledge state (single select, auto-advance)
  function renderKnowledge(){
    const options = [
      'Not at all', 'start from scratch', 'Somewhat', 'speed me along', 'Very', 'I just want extra practice', "I don't know", 'help me diagnose'
    ];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">How confident are you feeling already?</h1>`+
      `<div class="options-grid" id="knowledgeGrid"></div>`;
    const grid = document.getElementById('knowledgeGrid');
    grid.innerHTML = options.map(o=>`<div class="option-card" data-k="${o}">${escapeHtml(o)}</div>`).join('');
    grid.addEventListener('click', (e)=>{
      const card = e.target.closest('.option-card');
      if(!card) return; state.knowledge = card.dataset.k; next();
    });
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

    setTimeout(()=>{ window.location.href = '../html/study-path.html'; }, 3500);
  }

  // Helpers
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
  function cssId(str){ return String(str||'').replace(/\s+/g,'-').replace(/[^a-zA-Z0-9_-]/g,''); }

  // Events
  backBtn.addEventListener('click', prev);
  render();
})();


