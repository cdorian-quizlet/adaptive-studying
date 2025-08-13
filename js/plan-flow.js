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
  let initProgressAnimated = false;
  let stepIndex = 1;

  const state = {
    course: '',
    school: '',
    schoolId: '',
    goals: [],
    concepts: [],
    knowledge: '',
    dueDate: ''
  };

  // Debounce helper for typeahead
  function debounce(fn, wait){
    let timeout; return function(...args){ clearTimeout(timeout); timeout = setTimeout(()=>fn.apply(this,args), wait); };
  }

  // Simple in-memory caches
  const apiCache = { schools: null, courses: null, coursesBySchool: new Map() };
  
  // Clear cache on page load to ensure fresh data
  apiCache.schools = null;
  apiCache.courses = null;
  apiCache.coursesBySchool.clear();

  async function fetchSchools(){
    if (apiCache.schools) return apiCache.schools;
    try {
      console.log('Fetching schools from API...');
      const res = await fetch('https://getschools-p3vlbtsdwa-uc.a.run.app/?country=us');
      console.log('Schools API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Schools API raw response:', data);
      
      // API returns {schools: [...]} not an array directly
      const schoolsArray = data.schools || data;
      console.log('Schools API data received:', schoolsArray?.length || 0, 'schools');
      
      if (Array.isArray(schoolsArray) && schoolsArray.length > 0) {
        // API returned valid data
        apiCache.schools = schoolsArray;
        console.log('Using real API data for schools');
      } else {
        // API returned empty or invalid data
        console.log('API returned empty/invalid data, using fallback schools');
        apiCache.schools = [
          { id: '1', name: 'Harvard University' },
          { id: '2', name: 'Stanford University' },
          { id: '3', name: 'MIT' },
          { id: '4', name: 'University of California, Berkeley' },
          { id: '5', name: 'Yale University' },
          { id: '6', name: 'Princeton University' },
          { id: '7', name: 'Columbia University' },
          { id: '8', name: 'University of Chicago' },
          { id: '9', name: 'University of Pennsylvania' },
          { id: '10', name: 'Cornell University' }
        ];
      }
    } catch(e) { 
      console.error('Error fetching schools:', e);
      // Fallback data if API fails
      console.log('API failed, using fallback schools');
      apiCache.schools = [
        { id: '1', name: 'Harvard University' },
        { id: '2', name: 'Stanford University' },
        { id: '3', name: 'MIT' },
        { id: '4', name: 'University of California, Berkeley' },
        { id: '5', name: 'Yale University' },
        { id: '6', name: 'Princeton University' },
        { id: '7', name: 'Columbia University' },
        { id: '8', name: 'University of Chicago' },
        { id: '9', name: 'University of Pennsylvania' },
        { id: '10', name: 'Cornell University' }
      ];
    }
    return apiCache.schools;
  }

  async function fetchCourses(){
    if (apiCache.courses) return apiCache.courses;
    try {
      console.log('Fetching courses from API...');
      const res = await fetch('https://getcourses-p3vlbtsdwa-uc.a.run.app/?country=us');
      console.log('Courses API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Courses API raw response:', data);
      
      // API returns {courses: [...]} not an array directly
      const coursesArray = data.courses || data;
      console.log('Courses API data received:', coursesArray?.length || 0, 'courses');
      
      if (Array.isArray(coursesArray) && coursesArray.length > 0) {
        // API returned valid data
        apiCache.courses = coursesArray;
        console.log('Using real API data for courses');
      } else {
        // API returned empty or invalid data
        console.log('API returned empty/invalid data, using fallback courses');
        apiCache.courses = [
          { id: '1', name: 'BIOL 110 - Introduction to Biology' },
          { id: '2', name: 'CHEM 101 - General Chemistry' },
          { id: '3', name: 'PHYS 201 - Physics I' },
          { id: '4', name: 'MATH 221 - Calculus I' },
          { id: '5', name: 'PSYC 110 - Introduction to Psychology' },
          { id: '6', name: 'HIST 205 - World History' },
          { id: '7', name: 'ENGL 101 - English Composition' },
          { id: '8', name: 'ECON 201 - Microeconomics' },
          { id: '9', name: 'COMP 101 - Computer Science Fundamentals' },
          { id: '10', name: 'IBUS 330 - International Business' }
        ];
      }
    } catch(e) { 
      console.error('Error fetching courses:', e);
      // Fallback data if API fails
      console.log('API failed, using fallback courses');
      apiCache.courses = [
        { id: '1', name: 'BIOL 110 - Introduction to Biology' },
        { id: '2', name: 'CHEM 101 - General Chemistry' },
        { id: '3', name: 'PHYS 201 - Physics I' },
        { id: '4', name: 'MATH 221 - Calculus I' },
        { id: '5', name: 'PSYC 110 - Introduction to Psychology' },
        { id: '6', name: 'HIST 205 - World History' },
        { id: '7', name: 'ENGL 101 - English Composition' },
        { id: '8', name: 'ECON 201 - Microeconomics' },
        { id: '9', name: 'COMP 101 - Computer Science Fundamentals' },
        { id: '10', name: 'IBUS 330 - International Business' }
      ];
    }
    return apiCache.courses;
  }

  async function fetchCoursesBySchool(schoolId){
    if (!schoolId) return [];
    if (apiCache.coursesBySchool.has(schoolId)) return apiCache.coursesBySchool.get(schoolId);
    try {
      console.log('Fetching courses for school:', schoolId);
      const res = await fetch(`https://getcoursesbyschool-p3vlbtsdwa-uc.a.run.app/?schoolId=${encodeURIComponent(schoolId)}`);
      console.log('Courses by school API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Courses by school API raw response:', data);
      
      // API returns {courses: [...]} not an array directly
      const coursesArray = data.courses || data;
      console.log('Courses by school API data received:', coursesArray?.length || 0, 'courses for school', schoolId);
      
      const list = Array.isArray(coursesArray) ? coursesArray : [];
      apiCache.coursesBySchool.set(schoolId, list);
      return list;
    } catch(e){ 
      console.error('Error fetching courses by school:', e);
      apiCache.coursesBySchool.set(schoolId, []); 
      return []; 
    }
  }

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
    const computedPct = (stepIndex-1)/TOTAL_STEPS * 100;
    const remaining = Math.max(0, TOTAL_STEPS - (stepIndex-1));
    if (stepsRemainingEl) {
      stepsRemainingEl.textContent = `${remaining} step${remaining===1?'':'s'} remaining`;
    }

    // Step 1: animate from 0% to START_OFFSET_PCT on first load only
    if (stepIndex === 1) {
      if (!initProgressAnimated) {
        progressFill.style.width = '0%';
        if (progressAvatar) progressAvatar.style.left = 'calc(0% - 20px)';
        // allow layout to apply, then animate
        setTimeout(() => {
          progressFill.style.width = START_OFFSET_PCT + '%';
          if (progressAvatar) progressAvatar.style.left = `calc(${START_OFFSET_PCT}% - 20px)`;
        }, 50);
        initProgressAnimated = true;
      } else {
        progressFill.style.width = START_OFFSET_PCT + '%';
        if (progressAvatar) progressAvatar.style.left = `calc(${START_OFFSET_PCT}% - 20px)`;
      }
      return;
    }

    // Other steps: set based on computed percentage
    progressFill.style.width = computedPct + '%';
    if (progressAvatar) {
      progressAvatar.style.left = `calc(${computedPct}% - 20px)`;
    }
  }

  function render() {
    updateProgress();
    switch(stepIndex){
      case 1: return renderCourse();
      case 'addCourse': return renderAddCourse();
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
      `    <img class="search-icon" src="../images/search.png" alt="Search" aria-hidden="true" />`+
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

    // Redirect to add-course screen when the field is focused or clicked
    const openAddCourse = (e)=>{
      e.preventDefault();
      stepIndex = 'addCourse';
      render();
    };
    search.addEventListener('focus', openAddCourse);
    search.addEventListener('click', openAddCourse);

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
      const cta = document.getElementById('coursesCta');
      const wasSelected = item.classList.contains('selected');
      list.querySelectorAll('.course-row').forEach(r=>r.classList.remove('selected'));
      if (wasSelected) {
        // Deselect if clicking an already selected course
        state.course = '';
        if (cta) cta.classList.add('hidden');
      } else {
        item.classList.add('selected');
        state.course = item.dataset.course;
        if (cta) cta.classList.remove('hidden');
      }
    });

    document.getElementById('coursesContinue').addEventListener('click', ()=>{
      if(state.course) next();
    });
  }

  // Add Course screen
  function renderAddCourse(){
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">Add course</h1>`+
      `<div class="input-stack">`+
      `  <div class="input-field" id="schoolField">`+
      `    <input id="schoolName" class="text-input" placeholder="School name" aria-label="School name" autocomplete="off" />`+
      `    <div class="suggest-popover" id="schoolPopover" role="listbox"></div>`+
      `  </div>`+
      `  <div class="input-field" id="courseField">`+
      `    <input id="newCourseName" class="text-input" placeholder="Course name (e.g. BIO 110)" aria-label="Course name" autocomplete="off" />`+
      `    <div class="suggest-popover" id="coursePopover" role="listbox"></div>`+
      `  </div>`+
      `</div>`;

    const schoolName = document.getElementById('schoolName');
    const newCourseName = document.getElementById('newCourseName');
    const schoolPopover = document.getElementById('schoolPopover');
    const coursePopover = document.getElementById('coursePopover');
    schoolName.value = state.school || '';
    newCourseName.value = state.course || '';

    const persist = ()=>{
      state.school = schoolName.value.trim();
      state.course = newCourseName.value.trim();
    };
    schoolName.addEventListener('input', persist);
    newCourseName.addEventListener('input', persist);

    function renderList(pop, items, nameKey, onSelect){
      console.log('renderList called with:', items.length, 'items');
      if (!items || items.length === 0){ 
        console.log('No items to display, hiding popover');
        pop.style.display = 'none'; 
        pop.innerHTML = ''; 
        return; 
      }
      pop.innerHTML = items.slice(0, 8).map(it=>{
        const id = it.id || it.schoolId || it.courseId || '';
        const name = it[nameKey] || it.name || '';
        return `<div class="suggest-item" data-id="${String(id)}" data-name="${name.replace(/"/g,'&quot;')}">${name}</div>`;
      }).join('');
      console.log('Showing popover with', items.slice(0, 8).length, 'items');
      pop.style.display = 'block';
      pop.onclick = (e)=>{
        const item = e.target.closest('.suggest-item');
        if(!item) return;
        onSelect({ 
          id: item.getAttribute('data-id'), 
          name: item.getAttribute('data-name'),
          displayName: item.getAttribute('data-name') // For backward compatibility
        });
      };
    }

    const filterByQuery = (arr, q, prop)=>{
      const s = (q||'').trim().toLowerCase();
      if (!s) return arr.slice(0, 20); // Show first 20 items when no query
      return arr.filter(x=> String(x[prop]||x.name||'').toLowerCase().includes(s));
    };

    // Special filter for courses that searches both code and name
    const filterCoursesByQuery = (courses, q)=>{
      const s = (q||'').trim().toLowerCase();
      
      // Prepare courses with display names (code + name)
      const coursesWithDisplay = courses.map(course => ({
        ...course,
        displayName: `${course.code || ''} - ${course.name || ''}`.trim()
      }));
      
      if (!s) return coursesWithDisplay.slice(0, 20); // Show first 20 items when no query
      
      // Filter by either code or name
      return coursesWithDisplay.filter(course => {
        const code = String(course.code || '').toLowerCase();
        const name = String(course.name || '').toLowerCase();
        const subject = String(course.subject || '').toLowerCase();
        return code.includes(s) || name.includes(s) || subject.includes(s);
      });
    };

    // Schools
    const updateSchool = debounce(async ()=>{
      try {
        const all = await fetchSchools();
        console.log('Schools loaded:', all.length, 'schools');
        const items = filterByQuery(all, schoolName.value, 'name');
        console.log('Filtered schools:', items.length, 'matches for:', schoolName.value);
        renderList(schoolPopover, items, 'name', (sel)=>{
          state.schoolId = sel.id || '';
          state.school = sel.name;
          schoolName.value = sel.name;
          schoolPopover.style.display = 'none';
          // warm courses by school
          fetchCoursesBySchool(state.schoolId).then(()=>{});
        });
      } catch (e) {
        console.error('Error in updateSchool:', e);
      }
    }, 250);
    schoolName.addEventListener('input', ()=>{ state.schoolId = ''; updateSchool(); });
    schoolName.addEventListener('focus', updateSchool);

    // Courses - always load all courses
    const updateCourse = debounce(async ()=>{
      try {
        const list = await fetchCourses();
        console.log('All courses loaded:', list.length, 'courses');
        
        // Filter courses that match the query in either code or name
        const items = filterCoursesByQuery(list, newCourseName.value);
        console.log('Filtered courses:', items.length, 'matches for:', newCourseName.value);
        
        renderList(coursePopover, items, 'displayName', (sel)=>{
          // Store the full course code and name
          state.course = sel.displayName;
          newCourseName.value = sel.displayName;
          coursePopover.style.display = 'none';
        });
      } catch (e) {
        console.error('Error in updateCourse:', e);
      }
    }, 250);
    newCourseName.addEventListener('input', updateCourse);
    newCourseName.addEventListener('focus', updateCourse);

    // Close popovers when clicking outside
    const handleDocClick = (e) => {
      if (!e.target.closest('#schoolField')) schoolPopover.style.display = 'none';
      if (!e.target.closest('#courseField')) coursePopover.style.display = 'none';
    };
    document.addEventListener('click', handleDocClick);
    
    // Back navigation uses the existing back button
    backBtn.onclick = ()=>{ 
      document.removeEventListener('click', handleDocClick);
      persist(); 
      stepIndex = 1; 
      render(); 
    };
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
      if(all){
        // Toggle all: if everything is selected, clear; otherwise select all
        if (Array.isArray(state.goals) && state.goals.length === goals.length) {
          state.goals = [];
        } else {
          state.goals = goals.slice();
        }
        renderList();
        return;
      }
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
      if(all){
        if (Array.isArray(state.concepts) && state.concepts.length === concepts.length) {
          state.concepts = [];
        } else {
          state.concepts = concepts.slice();
        }
        renderList();
        return;
      }
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

  // Step 4: Knowledge state (single select)
  function renderKnowledge(){
    const options = [
      'Not at all, start from scratch',
      'Somewhat, speed me along',
      'Very, I just want extra practice',
      "I don’t know, help me diagnose"
    ];
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">How confident are you feeling already?</h1>`+
      `<div class="course-list-card" id="knowledgeList"></div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="knowledgeContinue" disabled>Continue</button></div>`;
    const list = document.getElementById('knowledgeList');
    const knowledgeContinue = document.getElementById('knowledgeContinue');
    function renderRows(){
      list.innerHTML = options.map(o=>`
        <div class="course-row ${state.knowledge===o?'selected':''}" data-k="${o}">
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text"><div class="course-title">${escapeHtml(o)}</div></div>
        </div>`).join('');
    }
    renderRows();
    list.addEventListener('click', (e)=>{
      const row = e.target.closest('.course-row');
      if(!row) return;
      const selected = row.getAttribute('data-k');
      if (state.knowledge === selected) {
        // Deselect current selection
        state.knowledge = '';
        renderRows();
        knowledgeContinue.disabled = true;
        knowledgeContinue.parentElement.classList.add('hidden');
      } else {
        state.knowledge = selected;
        renderRows();
        knowledgeContinue.disabled = false;
        knowledgeContinue.parentElement.classList.remove('hidden');
      }
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


