(function(){
  // Fade-in on load
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.classList.add('page-enter');
    requestAnimationFrame(()=>{
      document.body.classList.add('page-enter-active');
    });
    
    // Ensure Material Icons are visible once fonts load
    function makeFontsVisible() {
      const icons = document.querySelectorAll('.material-icons-round, .material-symbols-rounded');
      icons.forEach(icon => {
        icon.classList.add('loaded');
      });
    }
    
    // Try to detect when fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(makeFontsVisible);
    } else {
      // Fallback: just show icons after a short delay
      setTimeout(makeFontsVisible, 100);
    }
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
    courseDescription: '',
    school: '',
    schoolId: '',
    courseSelected: false, // Track if course was selected from results vs just typed
    goals: [],
    concepts: [],
    knowledge: '',
    dueDate: '',
    goalType: '' // 'study-plan', 'cram', or 'memorize'
  };

  // Read goal type from URL parameter
  function getGoalTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const goalParam = urlParams.get('goal');
    return goalParam || 'study-plan'; // Default to study-plan if no parameter
  }
  
  // Initialize goal type from URL
  state.goalType = getGoalTypeFromURL();

  // Debounce helper for typeahead
  function debounce(fn, wait){
    let timeout; return function(...args){ clearTimeout(timeout); timeout = setTimeout(()=>fn.apply(this,args), wait); };
  }

  // Simple in-memory caches
  const apiCache = { schools: null, courses: null, coursesBySchool: new Map(), goalsByCourse: new Map(), conceptsByCourse: new Map() };
  
  // Cache will be populated on first API call
  
  // Debug flag to enable/disable API calls - can be toggled in console
  window.debugApiMode = true; // Set to false to disable API calls for testing

  // Helper function to process schools and improve location display
  function expandSchoolLocations(schools) {
    const processedSchools = [];
    
    schools.forEach((school, index) => {
      // Handle location display
      let location;
      if (school.city === "Multiple Locations") {
        // For schools with multiple locations, show a cleaner message
        location = school.state ? `Multiple locations in ${school.state.toUpperCase()}` : 'Multiple campus locations';
      } else {
        // For schools with specific locations, apply title case to city and uppercase to state
        const city = school.city ? toTitleCase(school.city) : '';
        const state = school.state ? school.state.toUpperCase() : '';
        const fallbackLocation = school.location ? toTitleCase(school.location) : 'Location not specified';
        
        location = city && state ? `${city}, ${state}` :
                  city || state || fallbackLocation;
      }
      
      processedSchools.push({
        ...school,
        name: school.name || school.fullName || 'Unknown School',
        location: location
      });
    });
    
    console.log(`Processing complete: ${processedSchools.length} schools processed`);
    return processedSchools;
  }

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
        // API returned valid data - process schools for better display
        const processedSchools = expandSchoolLocations(schoolsArray);
        apiCache.schools = processedSchools;
        console.log('Using real API data for schools, processed to', processedSchools.length, 'entries');
      } else {
        // API returned empty or invalid data
        console.log('API returned empty/invalid data, using fallback schools');
        apiCache.schools = [
          { id: '1', name: 'Harvard University', location: 'Cambridge, MA' },
          { id: '2', name: 'Stanford University', location: 'Stanford, CA' },
          { id: '3', name: 'MIT', location: 'Cambridge, MA' },
          { id: '4', name: 'University of California, Berkeley', location: 'Berkeley, CA' },
          { id: '5', name: 'Yale University', location: 'New Haven, CT' },
          { id: '6', name: 'Princeton University', location: 'Princeton, NJ' },
          { id: '7', name: 'Columbia University', location: 'New York, NY' },
          { id: '8', name: 'University of Chicago', location: 'Chicago, IL' },
          { id: '9', name: 'University of Pennsylvania', location: 'Philadelphia, PA' },
          { id: '10', name: 'Cornell University', location: 'Ithaca, NY' },
          { id: '11', name: 'Arizona State University - Tempe', location: 'Tempe, AZ' },
          { id: '12', name: 'Arizona State University - Downtown Phoenix', location: 'Phoenix, AZ' },
          { id: '13', name: 'Arizona State University - West', location: 'Glendale, AZ' },
          { id: '14', name: 'University of California - Los Angeles', location: 'Los Angeles, CA' },
          { id: '15', name: 'University of California - San Diego', location: 'San Diego, CA' }
        ];
      }
    } catch(e) { 
      console.error('Error fetching schools:', e);
      // Fallback data if API fails
      console.log('API failed, using fallback schools');
      apiCache.schools = [
        { id: '1', name: 'Harvard University', location: 'Cambridge, MA' },
        { id: '2', name: 'Stanford University', location: 'Stanford, CA' },
        { id: '3', name: 'MIT', location: 'Cambridge, MA' },
        { id: '4', name: 'University of California, Berkeley', location: 'Berkeley, CA' },
        { id: '5', name: 'Yale University', location: 'New Haven, CT' },
        { id: '6', name: 'Princeton University', location: 'Princeton, NJ' },
        { id: '7', name: 'Columbia University', location: 'New York, NY' },
        { id: '8', name: 'University of Chicago', location: 'Chicago, IL' },
        { id: '9', name: 'University of Pennsylvania', location: 'Philadelphia, PA' },
        { id: '10', name: 'Cornell University', location: 'Ithaca, NY' },
        { id: '11', name: 'Arizona State University - Tempe', location: 'Tempe, AZ' },
        { id: '12', name: 'Arizona State University - Downtown Phoenix', location: 'Phoenix, AZ' },
        { id: '13', name: 'Arizona State University - West', location: 'Glendale, AZ' },
        { id: '14', name: 'University of California - Los Angeles', location: 'Los Angeles, CA' },
        { id: '15', name: 'University of California - San Diego', location: 'San Diego, CA' }
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

  async function fetchGoalsByCourse(courseName, schoolId) {
    // Use school name from state for the new API
    const schoolName = state.school;
    
    // Validate that we have both school and course
    if (!schoolName || !courseName) {
      console.error('Missing required parameters for goals API:', {
        schoolName: schoolName || 'MISSING',
        courseName: courseName || 'MISSING'
      });
      return []; // Return empty array if missing required params
    }
    
    const cacheKey = `${schoolName}-${courseName}`;
    
    if (apiCache.goalsByCourse.has(cacheKey)) {
      return apiCache.goalsByCourse.get(cacheKey);
    }
    
    try {
      console.log('Fetching goals for course:', courseName, 'at school:', schoolName);
      console.log('🔍 DEBUG: Original course name being used for goals API:', courseName);
      
      // Use the new hierarchical API
      const response = await window.QuizletApi.getGoalsBySchoolAndCourse(schoolName, courseName);
      
      // Extract goals from the metadata.availableGoals structure
      const availableGoals = response?.metadata?.availableGoals || [];
      console.log('Goals API returned:', availableGoals.length, 'goals');
      
      // Process API response to match expected format
      const processedGoals = availableGoals.map(goal => ({
        id: goal.id || `api-${Math.random().toString(36).substr(2, 9)}`,
        name: goal.name || 'Unnamed Goal',
        type: 'exam',
        hasContent: goal.hasContent !== false,
        source: 'api'
      }));
      
      // Cache the processed goals
      apiCache.goalsByCourse.set(cacheKey, processedGoals);
      return processedGoals;
      
    } catch(e) { 
      console.error('Error fetching goals by course:', e);
      // API failed - return empty array, will show fallback goals
      const emptyGoals = [];
      apiCache.goalsByCourse.set(cacheKey, emptyGoals);
      return emptyGoals;
    }
  }

  async function fetchConceptsByCourse(courseName, schoolId, goals) {
    // Use school name from state for the new API
    const schoolName = state.school;
    
    // Validate that we have required parameters
    if (!schoolName || !courseName || !goals || goals.length === 0) {
      console.error('Missing required parameters for concepts API:', {
        schoolName: schoolName || 'MISSING',
        courseName: courseName || 'MISSING',
        goals: goals || 'MISSING'
      });
      return [];
    }
    
    const cacheKey = `${schoolName}-${courseName}-${goals.join(',')}`;
    
    if (apiCache.conceptsByCourse.has(cacheKey)) {
      return apiCache.conceptsByCourse.get(cacheKey);
    }
    
    try {
      // Since concepts are per goal, we need to fetch for each goal and combine
      const allConcepts = [];
      const conceptsSet = new Set(); // To avoid duplicates
      
      for (const goal of goals) {
        // Use the new hierarchical API for each goal
        const response = await window.QuizletApi.getConceptsByGoal(schoolName, courseName, goal);
        
        // Extract concepts from the metadata.availableConcepts structure
        const availableConcepts = response?.metadata?.availableConcepts || [];
        console.log(`Concepts API returned ${availableConcepts.length} concepts for goal: ${goal}`);
        
        // Debug: Log first concept structure to understand API response
        if (availableConcepts.length > 0) {
          console.log('First concept structure:', availableConcepts[0]);
        }
        
        // Process and add unique concepts using major_topic
        availableConcepts.forEach(concept => {
          const conceptName = concept.major_topic || concept.name || 'Unnamed Concept';
          const conceptId = concept.id || conceptName;
          if (!conceptsSet.has(conceptId)) {
            conceptsSet.add(conceptId);
            allConcepts.push({
              id: concept.id || `api-${Math.random().toString(36).substr(2, 9)}`,
              name: conceptName,
              description: concept.description || '',
              source: 'api',
              goal: goal, // Track which goal this concept is from
              major_topic: concept.major_topic // Keep original major_topic field
            });
          }
        });
      }
      
      // Cache the processed concepts
      apiCache.conceptsByCourse.set(cacheKey, allConcepts);
      return allConcepts;
      
    } catch(e) { 
      console.error('Error fetching concepts by course:', e);
      // API failed - return empty array, will show fallback/search interface
      const emptyConcepts = [];
      apiCache.conceptsByCourse.set(cacheKey, emptyConcepts);
      return emptyConcepts;
    }
  }

  // Common exam fallbacks for when API returns empty
  const defaultGoals = ['Exam 1', 'Exam 2', 'Exam 3', 'Final exam'];
  
  // Store course descriptions by course name
  const courseDescriptions = {
    'BIOL 210': 'Human anatomy and physiology',
    'IBUS 330': 'International Business and Multicultural...',
    'PSYC 110': 'Introduction to Psychology',
    'CHEM 101': 'General chemistry fundamentals',
    'HIST 205': 'World history since 1500',
    'MATH 221': 'Calculus I'
  };

  const knowledgeToPill = {
    'Not at all, start from scratch': 'Not confident',
    'Somewhat, speed me along': 'Somewhat confident',
    'Very, I just want extra practice': 'Very confident',
    "I don't know, help me diagnose": "Not sure",
    // Legacy mappings for backwards compatibility
    'Not at all': 'Not confident',
    'Somewhat': 'Somewhat confident',
    'Very': 'Very confident',
    "I don't know": "Not sure",
    'start from scratch': 'Start from scratch',
    'speed me along': 'Speed me along',
    'I just want extra practice': 'Extra practice',
    'help me diagnose': 'Help me diagnose'
  };

  const knowledgeToHeadline = {
    'Not at all, start from scratch': "We'll build a strong foundation step by step and cover everything you need to know.",
    'Somewhat, speed me along': "We'll move fast, fine-tune weak areas, and review test-style questions.",
    'Very, I just want extra practice': "We'll skip the basics and give you targeted drills for extra confidence.",
    "I don't know, help me diagnose": "We'll figure it out together and adapt as we go.",
    // Legacy mappings for backwards compatibility
    'Not at all': "We'll build a strong foundation step by step and cover everything you need to know.",
    'Somewhat': "We'll move fast, fine-tune weak areas, and review test-style questions.",
    'Very': "We'll skip the basics and give you targeted drills for extra confidence.",
    "I don't know": "We'll figure it out together and adapt as we go.",
    'start from scratch': "We'll teach core concepts and ramp up gently.",
    'speed me along': "We'll accelerate with targeted practice and checkpoints.",
    'I just want extra practice': "We'll emphasize practice problems and recall.",
    'help me diagnose': "We'll start with a quick diagnostic to find gaps."
  };

  function updateBackButtonIcon() {
    const backBtnIcon = document.querySelector('#flowBackBtn span');
    if (!backBtnIcon) return;
    
    if (stepIndex === 1 || stepIndex === 'addCourse') {
      // First step and add course screen: use close icon from Material Symbols Rounded
      backBtnIcon.className = 'material-symbols-rounded loaded';
      backBtnIcon.textContent = 'close';
    } else {
      // All other steps: use back arrow from Material Icons Round
      backBtnIcon.className = 'material-icons-round loaded';
      backBtnIcon.textContent = 'arrow_back';
    }
  }

  function disableAllButtons() {
    // Disable all buttons in the flow content, but keep header buttons enabled
    const flowContent = document.getElementById('flowContent');
    if (!flowContent) return;
    
    const flowButtons = flowContent.querySelectorAll('button');
    flowButtons.forEach(button => {
      if (!button.hasAttribute('data-original-disabled')) {
        button.setAttribute('data-original-disabled', button.disabled);
      }
      button.disabled = true;
    });
  }

  function enableCurrentStepButtons() {
    // Remove buttons from completed steps and re-enable current step buttons
    const flowContent = document.getElementById('flowContent');
    if (!flowContent) return;
    
    // Remove all buttons except the back button from the flow content
    const allButtons = flowContent.querySelectorAll('button:not(#flowBackBtn)');
    allButtons.forEach(button => {
      // Check if this button belongs to a completed step
      if (isButtonFromCompletedStep(button)) {
        button.remove();
      } else {
        // Re-enable current step buttons, respecting their original disabled state
        const originalDisabled = button.getAttribute('data-original-disabled');
        if (originalDisabled === 'true') {
          button.disabled = true;
        } else {
          button.disabled = false;
        }
        button.removeAttribute('data-original-disabled');
      }
    });
  }

  function isButtonFromCompletedStep(button) {
    // Check if button belongs to a completed step by examining its context
    const buttonId = button.id;
    const currentStep = stepIndex;
    
    // Step 1 buttons
    if ((buttonId === 'coursesContinue') && currentStep > 1) {
      return true;
    }
    
    // Step 2 buttons  
    if ((buttonId === 'goalsContinue') && currentStep > 2) {
      return true;
    }
    
    // Step 3 buttons
    if ((buttonId === 'conceptsContinue') && currentStep > 3) {
      return true;
    }
    
    // Step 4 buttons
    if ((buttonId === 'knowledgeContinue' || buttonId === 'diagnosticBtn') && currentStep > 4) {
      return true;
    }
    
    // Step 5 buttons
    if ((buttonId === 'startBtn' || buttonId === 'skipBtn') && currentStep > 5) {
      return true;
    }
    
    // Add course screen buttons
    if ((buttonId === 'addCourseBtn' || buttonId === 'addCourseClose') && stepIndex !== 'addCourse') {
      return true;
    }
    
    return false;
  }

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

  async function render() {
    // Disable all buttons during render to prevent double-clicks
    disableAllButtons();
    
    updateProgress();
    updateBackButtonIcon();
    
    switch(stepIndex){
      case 1: 
        renderCourse();
        break;
      case 'addCourse': 
        renderAddCourse();
        // Add course screen doesn't need button re-enabling since it manages its own buttons
        return;
      case 2: 
        await renderGoals();
        break;
      case 3: 
        await renderConcepts();
        break;
      case 4: 
        renderKnowledge();
        break;
      case 5: 
        renderDate();
        break;
      case 6: 
        renderLoading();
        // Loading screen doesn't need button re-enabling
        return;
    }
    
    // Re-enable buttons after render completes (except for special screens)
    setTimeout(enableCurrentStepButtons, 100);
  }

  function next(){ stepIndex = Math.min(6, stepIndex+1); render(); }
  function prev(){ if(stepIndex>1){ stepIndex--; render(); } else { window.history.back(); } }

  // Step 1: Course selection (single select, auto next)
  function renderCourse(){
    // Get the appropriate headline based on goal type
    let headline = 'Let\'s make a plan. What are you studying?'; // Default
    if (state.goalType === 'cram') {
      headline = 'Let\'s cram. What are you studying?';
    } else if (state.goalType === 'memorize') {
      headline = 'Let\'s memorize terms. What are you studying?';
    }
    
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">${headline}</h1>`+
      `<div class="search-row">`+
      `  <div class="search-field">`+
      `    <img class="search-icon" src="../images/search.png" alt="Search" aria-hidden="true" />`+
      `    <input id="courseSearch" class="search-input" placeholder="Find a course (e.g. BIO 110)" aria-label="Find a course" />`+
      `  </div>`+
      `  <div id="courseDropdown" class="dropdown"></div>`+
      `</div>`+
      `<div class="subtle">Your courses</div>`+
      `<div class="course-list-card" id="courseList"></div>`+
      `<div class="course-cta hidden" id="coursesCta"><button class="primary-btn" id="coursesContinue">Continue</button></div>`;

    const search = document.getElementById('courseSearch');
    const dropdown = document.getElementById('courseDropdown');
    const list = document.getElementById('courseList');

    async function populateList(){
      try {
        // Try to get courses from localStorage (recently added courses) first
        const recentCourses = JSON.parse(localStorage.getItem('recent_courses') || '[]');
        
        // If we have recent courses, use them; otherwise show message to add course
        if (recentCourses.length > 0) {
          list.innerHTML = recentCourses.map(c => {
            const originalCourseName = c.originalName || c.name || c; // Prefer originalName for API calls
            const displayCourseName = c.displayName || normalizeCourseDisplay(originalCourseName); // Normalize for display
            
            console.log('🔍 DEBUG: Loading saved course - Original:', originalCourseName, 'Display:', displayCourseName);
            
                      return `
            <div class="course-row" data-course="${originalCourseName}" data-course-display="${displayCourseName}">
              <div class="course-check" aria-hidden="true"></div>
              <div class="course-text">
                <div class="course-title">${escapeHtml(displayCourseName)}</div>
                <div class="course-subtitle">${escapeHtml(toTitleCase(c.school || 'School name'))}</div>
              </div>
            </div>
          `;
          }).join('');
        } else {
          // Show message to add course if no recent courses
          list.innerHTML = `
            <div class="course-row" style="cursor: default; opacity: 0.6;">
              <div class="course-check" aria-hidden="true"></div>
              <div class="course-text">
                <div class="course-title">No courses yet</div>
                <div class="course-subtitle">Tap "Find a course" above to add your first course</div>
              </div>
            </div>
          `;
        }
        
        // Restore prior selection if any
        if(state.course){
          // Look for course by original name (data-course attribute)
          const sel = list.querySelector(`[data-course="${CSS.escape(state.course)}"]`);
          if(sel){ 
            sel.classList.add('selected'); 
            console.log('🔍 DEBUG: Restored course selection:', state.course);
          } else {
            console.log('🔍 DEBUG: Could not find saved course to restore:', state.course);
          }
          const cta = document.getElementById('coursesCta');
          if(cta) cta.classList.toggle('hidden', !state.course);
        }
      } catch (error) {
        console.error('Error populating course list:', error);
        list.innerHTML = `
          <div class="course-row" style="cursor: default; opacity: 0.6;">
            <div class="course-check" aria-hidden="true"></div>
            <div class="course-text">
              <div class="course-title">Unable to load courses</div>
              <div class="course-subtitle">Please try refreshing the page</div>
            </div>
          </div>
        `;
      }
    }
    populateList();

    // Redirect to add-course screen when the field is focused or clicked
    const openAddCourse = (e)=>{
      e.preventDefault();
      
      // Start transition out
      flowContent.classList.add('transitioning-out');
      
      // Wait for transition to complete, then render new content
      setTimeout(() => {
        stepIndex = 'addCourse';
        render();
        
        // Start transition in
        flowContent.classList.add('transitioning-in');
        
        // Remove transition classes after animation
        requestAnimationFrame(() => {
          flowContent.classList.remove('transitioning-out', 'transitioning-in');
        });
      }, 300); // Match CSS transition duration
    };
    search.addEventListener('focus', openAddCourse);
    search.addEventListener('click', openAddCourse);

    // Remove static course search - redirect to add course screen instead
    search.addEventListener('input', () => {
      // All course search now happens in the add course screen
      // This input is just for visual feedback
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
        // Use the original course name for API calls (same pattern as API courses)
        const originalCourseName = item.getAttribute('data-course');
        const displayCourseName = item.getAttribute('data-course-display') || originalCourseName;
        
        // Find the saved course object to get school information
        try {
          const recentCourses = JSON.parse(localStorage.getItem('recent_courses') || '[]');
          const savedCourse = recentCourses.find(c => 
            (c.originalName || c.name) === originalCourseName
          );
          
          if (savedCourse) {
            // Restore ALL the course and school state
            state.course = originalCourseName; // Store original name for API calls
            state.school = savedCourse.school; // Restore school name for API calls
            state.schoolId = savedCourse.schoolId; // Restore school ID
            state.courseDescription = savedCourse.description;
            
            console.log('🔍 DEBUG: Selected saved course with school info:', {
              course: originalCourseName,
              school: state.school,
              schoolId: state.schoolId
            });
          } else {
            console.warn('Could not find saved course data for:', originalCourseName);
            state.course = originalCourseName;
          }
        } catch (error) {
          console.error('Error restoring saved course data:', error);
          state.course = originalCourseName;
        }
        
        if (cta) cta.classList.remove('hidden');
      }
    });

    document.getElementById('coursesContinue').addEventListener('click', ()=>{
      if(state.course) next();
    });
  }

  // Add Course screen
  function renderAddCourse(){
    // Hide the main header with progress bar
    const header = document.querySelector('.flow-header');
    if (header) header.style.display = 'none';
    
    flowContent.innerHTML = ''+
      `<div class="add-course-header">`+
      `  <button class="close-btn" id="addCourseClose" aria-label="Close">`+
      `    <span class="material-icons-round">close</span>`+
      `  </button>`+
      `  <h1 class="add-course-title">Add course</h1>`+
      `</div>`+
      `<div class="input-stack">`+
      `  <div class="input-field" id="schoolField">`+
      `    <input id="schoolName" class="text-input" placeholder="School name" aria-label="School name" autocomplete="off" />`+
      `    <button id="schoolClearBtn" class="input-clear-btn" style="display: none;" aria-label="Clear school name">`+
      `      <span class="material-symbols-rounded">cancel</span>`+
      `    </button>`+
      `  </div>`+
      `  <div id="schoolSuggestions" class="location-section" style="display: none; margin-top: 8px;"></div>`+
      `  <div class="input-field" id="courseField" style="display: none;">`+
      `    <input id="newCourseName" class="text-input" placeholder="Course name (e.g. BIO 110)" aria-label="Course name" autocomplete="off" />`+
      `    <button id="courseClearBtn" class="input-clear-btn" style="display: none;" aria-label="Clear course name">`+
      `      <span class="material-symbols-rounded">cancel</span>`+
      `    </button>`+
      `  </div>`+
      `  <div id="courseSuggestions" class="location-section" style="display: none; margin-top: 8px;"></div>`+
      `  <div id="locationSection" class="location-section" style="margin-top: 8px;"></div>`+
      `</div>`+
      `<div class="add-course-cta hidden" id="addCourseCta">`+
      `  <button class="primary-btn" id="addCourseBtn">Add course</button>`+
      `</div>`;

    const schoolName = document.getElementById('schoolName');
    const newCourseName = document.getElementById('newCourseName');
    const schoolSuggestions = document.getElementById('schoolSuggestions');
    const schoolClearBtn = document.getElementById('schoolClearBtn');
    const courseClearBtn = document.getElementById('courseClearBtn');
    const courseSuggestions = document.getElementById('courseSuggestions');
    const courseField = document.getElementById('courseField');
    const locationSection = document.getElementById('locationSection');
    
    schoolName.value = state.school || '';
    newCourseName.value = state.course || '';
    
    // Initialize clear button states
    if (state.school && state.schoolId) {
      schoolClearBtn.style.display = 'flex';
    }
    if (state.course && state.courseSelected) {
      courseClearBtn.style.display = 'flex';
    }
    
    // Mock location-based schools (Arizona State campuses from the design)
    const locationSchools = [
      {
        id: 'asu-tempe',
        name: 'Arizona State University - Tempe',
        address: 'Tempe, AZ'
      },
      {
        id: 'asu-downtown',
        name: 'Arizona State University - Downtown Phoenix',
        address: 'Phoenix, AZ'
      },
      {
        id: 'asu-west',
        name: 'Arizona State University - West',
        address: 'Glendale, AZ'
      }
    ];

    // Mock popular courses data with descriptions
    const popularCourses = [
      { name: 'BIO 201 - Human Anatomy & Physiology', description: 'Study of human body structure and function' },
      { name: 'CHEM 101 - General Chemistry I', description: 'Introduction to chemical principles and reactions' },
      { name: 'MATH 210 - Calculus I', description: 'Differential and integral calculus fundamentals' },
      { name: 'PSYC 101 - Introduction to Psychology', description: 'Basic principles of human behavior and cognition' },
      { name: 'ENG 101 - English Composition', description: 'Academic writing and communication skills' },
      { name: 'HIST 102 - World History', description: 'Global historical developments and civilizations' },
      { name: 'PHYS 121 - University Physics I', description: 'Mechanics, waves, and thermodynamics' },
      { name: 'ECON 211 - Microeconomics', description: 'Individual and firm economic decision-making' }
    ];

    // State to track if we've requested location yet
    let locationRequested = false;
    let userLocation = null;
    let cachedPermissionState = null;
    
    // Function to calculate distance between two coordinates in miles
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    
    // Function to get nearby schools based on user location
    async function getNearbySchools(latitude, longitude, maxDistance = 50) {
      try {
        const allSchools = await fetchSchools();
        const nearbySchools = [];
        
        for (const school of allSchools) {
          // Try to extract coordinates from school data
          let schoolLat, schoolLon;
          
          if (school.latitude && school.longitude) {
            schoolLat = parseFloat(school.latitude);
            schoolLon = parseFloat(school.longitude);
          } else if (school.coords && school.coords.latitude && school.coords.longitude) {
            schoolLat = parseFloat(school.coords.latitude);
            schoolLon = parseFloat(school.coords.longitude);
          } else if (school.location_coordinates) {
            const coords = school.location_coordinates.split(',');
            if (coords.length === 2) {
              schoolLat = parseFloat(coords[0].trim());
              schoolLon = parseFloat(coords[1].trim());
            }
          }
          
          if (schoolLat && schoolLon && !isNaN(schoolLat) && !isNaN(schoolLon)) {
            const distance = calculateDistance(latitude, longitude, schoolLat, schoolLon);
            if (distance <= maxDistance) {
              nearbySchools.push({
                ...school,
                distance: distance,
                distanceText: `${Math.round(distance)} miles`
              });
            }
          }
        }
        
        // Sort by distance and return top 6
        nearbySchools.sort((a, b) => a.distance - b.distance);
        return nearbySchools.slice(0, 6);
        
      } catch (error) {
        console.error('Error fetching nearby schools:', error);
        return [];
      }
    }
    
    // Initialize location section - show shimmer placeholders initially
    function renderLocationSection() {
      // Show shimmer placeholders for location schools
      locationSection.innerHTML = `
        <div class="location-header">
          <img class="location-icon" src="../images/location.png" alt="Location" aria-hidden="true" />
          <span>Based on your location</span>
        </div>
        <div class="location-schools">
          ${Array(3).fill(0).map((_, index) => `
            <div class="location-school-item shimmer" data-shimmer-index="${index}">
              <div class="location-school-name"></div>
              <div class="location-school-address"></div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Initialize the location section with shimmer placeholders
    renderLocationSection();
    
    // Check location permission and request if needed
    checkAndRequestLocation();
    
    async function checkAndRequestLocation() {
      if (locationRequested) return;
      
      // Check if geolocation is supported
      if (!('geolocation' in navigator)) {
        console.log('Geolocation not supported, showing fallback schools');
        showLocationSchools();
        locationRequested = true;
        return;
      }
      
      // Check current permission status using Permissions API
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          console.log('Current geolocation permission status:', permission.state);
          cachedPermissionState = permission.state;
          
          if (permission.state === 'granted') {
            // Permission already granted - get location without prompting
            console.log('Location permission already granted, getting position silently...');
            locationRequested = true;
            getCurrentLocationSilently();
          } else if (permission.state === 'denied') {
            // Permission explicitly denied - show fallback immediately
            console.log('Location permission denied, showing fallback schools');
            locationRequested = true;
            showLocationSchools();
          } else {
            // Permission state is 'prompt' - ask for permission
            console.log('Location permission not yet determined, requesting...');
            locationRequested = true;
            requestLocationAccess();
          }
        } catch (error) {
          console.log('Permissions API not supported or failed, requesting location directly:', error);
          locationRequested = true;
          requestLocationAccess();
        }
      } else {
        // Permissions API not supported - request location directly
        console.log('Permissions API not supported, requesting location directly');
        locationRequested = true;
        requestLocationAccess();
      }
    }
    
    function getCurrentLocationSilently() {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
          console.log('Location obtained silently:', position);
            userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            // Fetch nearby schools based on user location
            const nearbySchools = await getNearbySchools(
              position.coords.latitude, 
              position.coords.longitude
            );
            
            showLocationSchools(nearbySchools);
          },
          (error) => {
          console.log('Failed to get location silently:', error);
            showLocationSchools(); // Show fallback schools if location fails
          },
          { 
            timeout: 5000, // Shorter timeout for silent requests
            enableHighAccuracy: false,
            maximumAge: 600000 // 10 minutes - use cached location if available
        }
      );
    }
    
    function requestLocationAccess() {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Location access granted after request:', position);
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Fetch nearby schools based on user location
          const nearbySchools = await getNearbySchools(
            position.coords.latitude, 
            position.coords.longitude
          );
          
          showLocationSchools(nearbySchools);
        },
        (error) => {
          console.log('Location access denied or failed after request:', error);
          showLocationSchools(); // Show fallback schools if location fails
        },
        { 
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
    
    function showLocationSchools(nearbySchools = null) {
      // Use API data if available, otherwise fallback to mock data
      const schoolsToShow = nearbySchools && nearbySchools.length > 0 ? nearbySchools : locationSchools;
      
      // Replace shimmer placeholders with actual school data
      const schoolsContainer = locationSection.querySelector('.location-schools');
      if (schoolsContainer) {
        // Replace shimmer items with actual schools
        schoolsContainer.innerHTML = schoolsToShow.map(school => {
          const schoolId = school.id || school.schoolId || '';
          const schoolName = school.name || school.fullName || '';
          
          // Always show city/location for nearby schools, never distance
          let displayLocation;
          if (nearbySchools && school.distance !== undefined) {
            // Always show actual location for nearby schools
            const cityState = school.city && school.state ? `${toTitleCase(school.city)}, ${school.state.toUpperCase()}` : '';
            displayLocation = cityState || school.location || school.address || 'Nearby location';
          } else {
            // Fallback for non-location-based schools
            displayLocation = school.address || school.location || school.city || 'Location not available';
          }
          
          return `
            <div class="location-school-item" data-school-id="${schoolId}" data-school-name="${schoolName}">
              <div class="location-school-name">${toTitleCase(schoolName)}</div>
              <div class="location-school-address">${displayLocation}</div>
            </div>
          `;
        }).join('');
        
        // Add click handlers for location schools
        schoolsContainer.querySelectorAll('.location-school-item').forEach(item => {
          item.addEventListener('click', () => {
            const schoolId = item.getAttribute('data-school-id');
            const schoolName = item.getAttribute('data-school-name');
            selectSchool(schoolId, schoolName);
          });
        });
      } else {
        // Fallback: render the entire section if shimmer wasn't properly initialized
        const headerText = nearbySchools && nearbySchools.length > 0 ? 
          'Based on your location' : 
          'Popular schools';
          
        locationSection.innerHTML = `
          <div class="location-header">
            <img class="location-icon" src="../images/location.png" alt="Location" aria-hidden="true" />
            <span>${headerText}</span>
          </div>
          <div class="location-schools">
            ${schoolsToShow.map(school => {
              const schoolId = school.id || school.schoolId || '';
              const schoolName = school.name || school.fullName || '';
              
              // Always show city/location for nearby schools, never distance
              let displayLocation;
              if (nearbySchools && school.distance !== undefined) {
                // Always show actual location for nearby schools
                const cityState = school.city && school.state ? `${toTitleCase(school.city)}, ${school.state.toUpperCase()}` : '';
                displayLocation = cityState || school.location || school.address || 'Nearby location';
              } else {
                // Fallback for non-location-based schools
                displayLocation = school.address || school.location || school.city || 'Location not available';
              }
              
              return `
                <div class="location-school-item" data-school-id="${schoolId}" data-school-name="${schoolName}">
                  <div class="location-school-name">${toTitleCase(schoolName)}</div>
                  <div class="location-school-address">${displayLocation}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        
        // Add click handlers for location schools
        locationSection.querySelectorAll('.location-school-item').forEach(item => {
          item.addEventListener('click', () => {
            const schoolId = item.getAttribute('data-school-id');
            const schoolName = item.getAttribute('data-school-name');
            selectSchool(schoolId, schoolName);
          });
        });
      }
    }
    
    async function showPopularCourses(schoolId, schoolName) {
      const displayName = toTitleCase(schoolName);
      
      // Show loading state
      locationSection.innerHTML = `
        <div class="location-header">
          <img class="location-icon" src="../images/upward-graph.png" alt="Loading" aria-hidden="true" />
          <span>Loading courses for ${displayName}...</span>
        </div>
        <div class="location-schools">
          <div class="loading-placeholder">Fetching available courses...</div>
        </div>
      `;
      locationSection.style.display = 'block';
      courseSuggestions.style.display = 'none';
      
      try {
        // Fetch courses from API using schoolId first, schoolName as fallback
        const response = await window.QuizletApi.getCoursesBySchool(schoolId, schoolName);
        
        if (!response || !response.courses || response.courses.length === 0) {
          // No courses found, show fallback with hardcoded popular courses
          showFallbackPopularCourses(displayName);
          return;
        }
        
        const courses = response.courses;
        
        // Determine what to show based on number of courses
        let coursesToShow = [];
        let headerText = '';
        
        if (courses.length <= 2) {
          // Show all courses if only 1-2 available
          coursesToShow = courses;
          headerText = `Available at ${displayName}`;
        } else if (courses.length <= 5) {
          // Show all courses if 3-5 available
          coursesToShow = courses;
          headerText = `Courses at ${displayName}`;
        } else {
          // Show first 6 courses if more than 5 available (popular ones)
          coursesToShow = courses.slice(0, 6);
          headerText = `Popular at ${displayName}`;
        }
        
        // Render the courses
        locationSection.innerHTML = `
          <div class="location-header">
            <img class="location-icon" src="../images/upward-graph.png" alt="Courses" aria-hidden="true" />
            <span>${headerText}</span>
          </div>
          <div class="location-schools">
            ${coursesToShow.map(course => {
              // Handle API course structure: { id, name, subject }
              const courseName = course.name || 'Unknown Course';
              const courseDescription = course.subject || 'Course subject';
              const normalizedName = normalizeCourseDisplay(courseName);
              
            return `
              <div class="location-school-item" data-course="${courseName}" data-course-display="${normalizedName}">
                <div class="location-school-name">${normalizedName}</div>
                  <div class="location-school-address">${courseDescription}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
        
      } catch (error) {
        console.error('Error fetching courses for school:', error);
        // Show fallback with hardcoded popular courses
        showFallbackPopularCourses(displayName);
        return;
      }
      
      // Show the location section and hide course suggestions
      locationSection.style.display = 'block';
      courseSuggestions.style.display = 'none';
      
      // Add click handlers for courses
      locationSection.querySelectorAll('.location-school-item').forEach(item => {
        item.addEventListener('click', () => {
          const originalCourseName = item.getAttribute('data-course'); // Original API name for API calls
          const displayCourseName = item.getAttribute('data-course-display') || originalCourseName; // Display name for UI
          const courseDescription = item.querySelector('.location-school-address').textContent;
          
          newCourseName.value = displayCourseName; // Show display name to user
          state.course = originalCourseName; // Store original name for API calls
          state.courseDescription = courseDescription; // Store the description
          state.courseSelected = true; // Mark course as selected from results
          
          // Show clear button after selection
          courseClearBtn.style.display = 'flex';
          
          updateAddCourseButton();
          
          // Hide popular courses after selection
          locationSection.style.display = 'none';
          courseSuggestions.style.display = 'none';
        });
      });
    }
    
    function showFallbackPopularCourses(displayName) {
      // Fallback to hardcoded popular courses when API fails
      locationSection.innerHTML = `
        <div class="location-header">
          <img class="location-icon" src="../images/upward-graph.png" alt="Popular" aria-hidden="true" />
          <span>Popular at ${displayName}</span>
        </div>
        <div class="location-schools">
          ${popularCourses.slice(0, 6).map(course => {
            const originalName = course.name;
            const normalizedName = normalizeCourseDisplay(course.name);
            return `
              <div class="location-school-item" data-course="${originalName}" data-course-display="${normalizedName}">
                <div class="location-school-name">${normalizedName}</div>
                <div class="location-school-address">${course.description}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    function showCourseResults(courses) {
      if (!courses || courses.length === 0) {
        showNoResults(courseSuggestions, 'No courses found');
        // Hide popular courses
        locationSection.style.display = 'none';
        return;
      }

      courseSuggestions.innerHTML = `
        <div class="location-schools">
          ${courses.slice(0, 8).map(course => {
            const originalCourseName = course.displayName || course.name || '';
            const normalizedCourseName = normalizeCourseDisplay(originalCourseName);
            const courseDescription = course.description || course.subject || 'Course description';
            return `
              <div class="location-school-item" data-course="${originalCourseName}" data-course-display="${normalizedCourseName}">
                <div class="location-school-name">${normalizedCourseName}</div>
                <div class="location-school-address">${courseDescription}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      
      // Show course suggestions and hide popular courses
      courseSuggestions.style.display = 'block';
      locationSection.style.display = 'none';
      
      // Add click handlers for course results
      courseSuggestions.querySelectorAll('.location-school-item').forEach(item => {
        item.addEventListener('click', () => {
          const originalCourseName = item.getAttribute('data-course'); // Original API name for API calls
          const displayCourseName = item.getAttribute('data-course-display') || originalCourseName; // Display name for UI
          const courseDescription = item.querySelector('.location-school-address').textContent;
          
          newCourseName.value = displayCourseName; // Show display name to user
          state.course = originalCourseName; // Store original name for API calls
          state.courseDescription = courseDescription; // Store the description
          state.courseSelected = true; // Mark course as selected from results
          
          // Show clear button after selection
          courseClearBtn.style.display = 'flex';
          
          updateAddCourseButton();
          
          // Hide course suggestions after selection
          courseSuggestions.style.display = 'none';
        });
      });
    }

    function selectSchool(schoolId, schoolName) {
      state.schoolId = schoolId;
      state.school = schoolName;
      
      // Use title case for the input display
      const titleCaseSchoolName = toTitleCase(schoolName);
      document.getElementById('schoolName').value = titleCaseSchoolName;
      
      // Smooth transition sequence
      // 1. Hide school suggestions immediately
      schoolSuggestions.style.display = 'none';
      
      // 2. Start transition out for location section
      locationSection.classList.add('transitioning-out');
      
      // 3. Show clear button
      schoolClearBtn.style.display = 'flex';
      
      // 4. After transition out completes, replace content and transition in
      setTimeout(() => {
        // Replace location section with popular courses
        showPopularCourses(schoolId, titleCaseSchoolName);
        
        // Start transition in for location section (now with popular courses)
        locationSection.classList.add('transitioning-in');
        
        // 5. Show course input with transition
        if (courseField.style.display === 'none') {
          courseField.classList.add('transitioning-in');
          courseField.style.display = 'flex';
        }
        
        // 6. Clean up transition classes and update UI
        requestAnimationFrame(() => {
          locationSection.classList.remove('transitioning-out', 'transitioning-in');
          courseField.classList.remove('transitioning-in');
          updateAddCourseButton();
          
          // Focus on course input after animations complete
          setTimeout(() => {
            newCourseName.focus();
          }, 50);
        });
      }, 300); // Match CSS transition duration
    }

    const persist = ()=>{
      state.course = newCourseName.value.trim();
      // Show/hide the Add course button based on whether both fields are filled
      updateAddCourseButton();
    };
    
    const updateAddCourseButton = ()=>{
      const addCourseCta = document.getElementById('addCourseCta');
      const courseInput = document.getElementById('newCourseName');
      const courseField = document.getElementById('courseField');
      const hasSelectedSchool = state.schoolId && state.schoolId.trim().length > 0;
      const hasCourseSelected = state.courseSelected; // Only show button when course is actually selected
      
      // Show/hide course input based on actual school selection (not just typing)
      if (courseField) {
        if (hasSelectedSchool) {
          courseField.style.display = 'flex';
          if (courseInput) {
            courseInput.disabled = false;
            courseInput.placeholder = 'Course name (e.g. BIO 110)';
          }
        } else {
          courseField.style.display = 'none';
          if (courseInput) {
            courseInput.value = '';
            state.course = '';
            state.courseDescription = ''; // Clear description too
            state.courseSelected = false;
          }
        }
      }
      
      // Show/hide Add course button - only when course is actually selected from results
      if (addCourseCta) {
        if (hasSelectedSchool && hasCourseSelected) {
          addCourseCta.classList.remove('hidden');
        } else {
          addCourseCta.classList.add('hidden');
        }
      }
    };
    
    newCourseName.addEventListener('input', persist);

    // Helper functions for search states
    function showSearchLoading(container) {
      container.innerHTML = `
        <div class="search-loading-container">
          ${Array(3).fill(0).map(() => `
            <div class="search-loading-item">
              <div class="loading-name"></div>
              <div class="loading-description"></div>
            </div>
          `).join('')}
        </div>
      `;
      container.style.display = 'block';
    }

    function showNoResults(container, message) {
      container.innerHTML = `
        <div class="no-results-container">
          <div class="no-results-item">
            <div class="no-results-text">${message}</div>
          </div>
        </div>
      `;
      container.style.display = 'block';
    }

    function renderList(container, items, nameKey, onSelect, useCardLayout = false){
      console.log('renderList called with:', items.length, 'items');
      if (!items || items.length === 0){ 
        console.log('No items to display, showing no results');
        const isSchoolSearch = container === schoolSuggestions;
        const isCourseSearch = container === courseSuggestions;
        
        if (isSchoolSearch) {
          showNoResults(container, 'No schools found');
        } else if (isCourseSearch) {
          showNoResults(container, 'No courses found');
        } else {
          container.style.display = 'none'; 
          container.innerHTML = '';
        }
        return; 
      }
      
      if (useCardLayout) {
        // Use card layout for schools (like location schools)
        container.innerHTML = `
          <div class="location-schools">
            ${items.slice(0, 8).map(it=>{
              const id = it.id || it.schoolId || it.courseId || '';
              const name = it[nameKey] || it.name || '';
              const location = it.location || 'School location'; // Use processed location from expandSchoolLocations
              // For courses, normalize the display name; for schools, use title case
              const displayName = nameKey === 'name' && (it.code || it.subject) ? 
                normalizeCourseDisplay(name) : toTitleCase(name);
              return `
                <div class="location-school-item" data-id="${String(id)}" data-name="${name.replace(/"/g,'&quot;')}">
                  <div class="location-school-name">${displayName}</div>
                  <div class="location-school-address">${location}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        
        console.log('Showing card layout with', items.slice(0, 8).length, 'items');
        container.style.display = 'block';
        
        container.onclick = (e)=>{
          const item = e.target.closest('.location-school-item');
          if(!item) return;
          onSelect({ 
            id: item.getAttribute('data-id'), 
            name: item.getAttribute('data-name'),
            displayName: item.getAttribute('data-name')
          });
        };
      } else {
        // Legacy popover support (not used anymore, but keeping for compatibility)
        container.innerHTML = items.slice(0, 8).map(it=>{
          const id = it.id || it.schoolId || it.courseId || '';
          const name = it[nameKey] || it.name || '';
          return `<div class="suggest-item" data-id="${String(id)}" data-name="${name.replace(/"/g,'&quot;')}">${name}</div>`;
        }).join('');
        console.log('Showing popover with', items.slice(0, 8).length, 'items');
        container.style.display = 'block';
        container.onclick = (e)=>{
          const item = e.target.closest('.suggest-item');
          if(!item) return;
          onSelect({ 
            id: item.getAttribute('data-id'), 
            name: item.getAttribute('data-name'),
            displayName: item.getAttribute('data-name')
          });
        };
      }
    }

    const filterByQuery = (arr, q, prop)=>{
      const s = (q||'').trim().toLowerCase();
      if (!s) return arr.slice(0, 20); // Show first 20 items when no query
      return arr.filter(x=> String(x[prop]||x.name||'').toLowerCase().includes(s));
    };

    // Special filter for courses that searches both code and name
    const filterCoursesByQuery = (courses, q)=>{
      const s = (q||'').trim().toLowerCase();
      
      // Prepare courses with display names (code + name) and normalize
      const coursesWithDisplay = courses.map(course => ({
        ...course,
        displayName: normalizeCourseDisplay(`${course.code || ''} - ${course.name || ''}`.trim())
      }));
      
      // Filter by either code or name
      let filteredCourses;
      if (!s) {
        filteredCourses = coursesWithDisplay.slice(0, 20); // Show first 20 items when no query
      } else {
        filteredCourses = coursesWithDisplay.filter(course => {
          const code = String(course.code || '').toLowerCase();
          const name = String(course.name || '').toLowerCase();
          const subject = String(course.subject || '').toLowerCase();
          return code.includes(s) || name.includes(s) || subject.includes(s);
        });
      }
      
      // Deduplicate courses by code (keep first occurrence)
      const seenCodes = new Set();
      const deduplicatedCourses = [];
      
      for (const course of filteredCourses) {
        const courseCode = String(course.code || '').trim().toUpperCase();
        if (courseCode && !seenCodes.has(courseCode)) {
          seenCodes.add(courseCode);
          deduplicatedCourses.push(course);
        } else if (!courseCode) {
          // Keep courses without codes (but they're less likely to be duplicates)
          deduplicatedCourses.push(course);
        }
      }
      
      console.log(`Course filtering: ${courses.length} total → ${filteredCourses.length} filtered → ${deduplicatedCourses.length} deduplicated`);
      return deduplicatedCourses;
    };

    // Schools
    const updateSchool = debounce(async ()=>{
      try {
        // Don't show suggestions if a school is already selected
        if (state.schoolId) {
          schoolSuggestions.style.display = 'none';
          return;
        }
        
        // Only show suggestions if user has typed something
        const query = schoolName.value.trim();
        if (!query) {
          schoolSuggestions.style.display = 'none';
          // Show location section when input is empty
          locationSection.style.display = 'block';
          return;
        }
        
        // Hide location section when user is typing
        locationSection.style.display = 'none';
        
        // Show loading state while fetching
        showSearchLoading(schoolSuggestions);
        
        const all = await fetchSchools();
        console.log('Schools loaded:', all.length, 'schools');
        const items = filterByQuery(all, query, 'name');
        console.log('Filtered schools:', items.length, 'matches for:', query);
        renderList(schoolSuggestions, items, 'name', (sel)=>{
          selectSchool(sel.id || '', sel.name);
          // warm courses by school
          fetchCoursesBySchool(state.schoolId).then(()=>{});
        }, true); // Use card layout for schools
      } catch (e) {
        console.error('Error in updateSchool:', e);
        showNoResults(schoolSuggestions, 'Error loading schools');
      }
    }, 250);
    // Clear button functionality
    schoolClearBtn.addEventListener('click', () => {
      // Start smooth transition out
      locationSection.classList.add('transitioning-out');
      courseField.classList.add('transitioning-out');
      
      // Clear state immediately
      schoolName.value = '';
      state.schoolId = '';
      state.school = '';
      schoolClearBtn.style.display = 'none';
      schoolSuggestions.style.display = 'none';
      courseSuggestions.style.display = 'none';
      
      // Clear course input
      newCourseName.value = '';
      state.course = '';
      state.courseDescription = ''; // Clear description too
      courseClearBtn.style.display = 'none';
      
      // After transition out completes, restore original state
      setTimeout(() => {
        // Hide course field and restore location section
        courseField.style.display = 'none';
        locationSection.style.display = 'block';
        
        // Restore location schools instead of popular courses
        renderLocationSection();
        
        // Start transition in for location section
        locationSection.classList.add('transitioning-in');
        
        // Re-request location to get fresh nearby schools if available
        if (userLocation) {
          getNearbySchools(userLocation.latitude, userLocation.longitude)
            .then(nearbySchools => showLocationSchools(nearbySchools));
        } else {
          // Reset location request flag and cached permission state so we can check again
          locationRequested = false;
          cachedPermissionState = null;
          checkAndRequestLocation();
        }
        
        // Clean up transition classes
        requestAnimationFrame(() => {
          locationSection.classList.remove('transitioning-out', 'transitioning-in');
          courseField.classList.remove('transitioning-out');
          updateAddCourseButton();
          schoolName.focus();
        });
      }, 300); // Match CSS transition duration
    });

    schoolName.addEventListener('input', ()=>{ 
      state.schoolId = ''; // Clear selected school when user types
      state.school = schoolName.value.trim();
      
      // Hide clear button when typing (will show again when school is selected)
      schoolClearBtn.style.display = 'none';
      
      updateAddCourseButton(); // Hide course field when school selection is cleared
      updateSchool();
      
      // Show/hide location section based on input
      if (schoolName.value.trim()) {
        locationSection.style.display = 'none';
      } else {
        locationSection.style.display = 'block';
      }
    });
    schoolName.addEventListener('focus', () => {
      // Don't show typeahead results until user starts typing
    });

    // Courses - use school-specific courses when school is selected
    const updateCourse = debounce(async ()=>{
      try {
        const query = newCourseName.value.trim();
        
        // If course input is empty and school is selected, show popular courses
        if (!query && state.schoolId) {
          showPopularCourses(state.schoolId, state.school);
          return;
        }
        
        // If there's a query, show course search results
        if (query) {
          // Show loading state while fetching
          showSearchLoading(courseSuggestions);
          // Hide popular courses while searching
          locationSection.style.display = 'none';
          
          // Use school-specific courses if school is selected, otherwise use general courses
          let list;
          if (state.schoolId) {
            console.log('🏫 Using school-specific courses for:', state.school, '(ID:', state.schoolId, ')');
            list = await fetchCoursesBySchool(state.schoolId);
            console.log('🏫 School-specific courses loaded:', list.length, 'courses');
          } else {
            console.log('🌐 Using general courses (no school selected)');
            list = await fetchCourses();
            console.log('🌐 All courses loaded:', list.length, 'courses');
          }
          
          // Filter courses that match the query in either code or name
          const items = filterCoursesByQuery(list, query);
          console.log('🔍 Filtered courses:', items.length, 'matches for:', query);
          
          showCourseResults(items); // This now handles empty results internally
        } else {
          // Hide course suggestions if no query
          courseSuggestions.style.display = 'none';
          if (state.schoolId) {
            showPopularCourses(state.schoolId, state.school);
          }
        }
      } catch (e) {
        console.error('Error in updateCourse:', e);
        showNoResults(courseSuggestions, 'Error loading courses');
        locationSection.style.display = 'none';
      }
    }, 250);
    
    // Course clear button functionality
    courseClearBtn.addEventListener('click', () => {
      newCourseName.value = '';
      state.course = '';
      state.courseDescription = ''; // Clear description too
      state.courseSelected = false; // Reset selection state when cleared
      courseClearBtn.style.display = 'none';
      courseSuggestions.style.display = 'none';
      
      // Show popular courses if school is selected
      if (state.schoolId) {
        showPopularCourses(state.schoolId, state.school);
      }
      
      updateAddCourseButton();
      newCourseName.focus();
    });

    newCourseName.addEventListener('input', ()=>{
      state.course = newCourseName.value.trim();
      state.courseDescription = ''; // Clear description when user types manually
      state.courseSelected = false; // Reset selection state when user types
      
      // Hide clear button when user types (only show when course is selected from results)
      courseClearBtn.style.display = 'none';
      
      updateAddCourseButton();
      updateCourse();
    });
    
    newCourseName.addEventListener('focus', ()=>{
      // Show popular courses when focusing on empty input with selected school
      if (!newCourseName.value.trim() && state.schoolId) {
        showPopularCourses(state.schoolId, state.school);
      } else if (newCourseName.value.trim()) {
        updateCourse();
      }
    });

    // Close suggestions when clicking outside
    const handleDocClick = (e) => {
      if (!e.target.closest('#schoolField') && 
          !e.target.closest('#schoolSuggestions') && 
          !e.target.closest('#schoolClearBtn')) {
        schoolSuggestions.style.display = 'none';
      }
      if (!e.target.closest('#courseField') && 
          !e.target.closest('#courseSuggestions') &&
          !e.target.closest('#locationSection') &&
          !e.target.closest('#courseClearBtn')) {
        courseSuggestions.style.display = 'none';
        // Don't hide locationSection here since it might contain popular courses
      }
    };
    document.addEventListener('click', handleDocClick);
    
    // Close button functionality
    const closeBtn = document.getElementById('addCourseClose');
    const goBack = ()=>{ 
      // Start transition out
      flowContent.classList.add('transitioning-out');
      
      // Wait for transition to complete, then render new content
      setTimeout(() => {
        // Restore the main header
        const header = document.querySelector('.flow-header');
        if (header) header.style.display = 'flex';
        
        document.removeEventListener('click', handleDocClick);
        persist(); 
        stepIndex = 1; 
        render();
        
        // Start transition in
        flowContent.classList.add('transitioning-in');
        
        // Remove transition classes after animation
        requestAnimationFrame(() => {
          flowContent.classList.remove('transitioning-out', 'transitioning-in');
        });
      }, 300); // Match CSS transition duration
    };
    
    if (closeBtn) {
      closeBtn.addEventListener('click', goBack);
    }
    
    // Add course button functionality
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
      addCourseBtn.addEventListener('click', ()=>{
        if (state.school && state.course) {
          try {
            // Get existing recent courses from localStorage
            const recentCourses = JSON.parse(localStorage.getItem('recent_courses') || '[]');
            
            // Create course object with both original and display names
            const courseObj = {
              name: state.course, // Keep for backward compatibility
              originalName: state.course, // Original API name for API calls
              displayName: normalizeCourseDisplay(state.course), // Display name for UI
              description: state.courseDescription || 'Course description',
              school: state.school,
              schoolId: state.schoolId,
              addedAt: Date.now()
            };
            
            console.log('🔍 DEBUG: Saving course with formats - Original:', state.course, 'Display:', courseObj.displayName);
            
            // Remove if already exists (to avoid duplicates)
            const filteredCourses = recentCourses.filter(c => 
              (c.name || c) !== state.course
            );
            
            // Add to beginning so newest appears first
            filteredCourses.unshift(courseObj);
            
            // Keep only last 10 courses
            const limitedCourses = filteredCourses.slice(0, 10);
            
            // Save to localStorage
            localStorage.setItem('recent_courses', JSON.stringify(limitedCourses));
            
            console.log('Course saved to localStorage:', courseObj);
          } catch (error) {
            console.error('Error saving course to localStorage:', error);
          }
          
          // The course is already set in state.course, so it will be selected when we go back
          // Course added successfully, go back to main flow
          goBack();
        }
      });
    }
    
    // Initialize button visibility
    updateAddCourseButton();
  }

  // Step 2: Goal selection (multi, Continue visible when >=1)
  async function renderGoals(){
    // Extract course code part (handle various separators)
    let courseCode = state.course;
    
    // Split on various possible separators and take first part
    if (courseCode.includes(' - ')) {
      courseCode = courseCode.split(' - ')[0];
    } else if (courseCode.includes(', ')) {
      courseCode = courseCode.split(', ')[0];
    } else if (courseCode.includes(' ')) {
      // For cases like "NURS 320 Adults with Health Alterations"
      // Extract course code pattern (letters followed by numbers)
      const match = courseCode.match(/^([A-Z]{2,6}\s*\d+)/i);
      if (match) {
        courseCode = match[1];
      }
    }
    
    // Show loading state first
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What should be included from ${escapeHtml(courseCode)}?</h1>`+
      `<div class="subtle">Exams and goals</div>`+
      `<div class="course-list-card" id="goalList">`+
      `  <div class="course-row" style="justify-content: center;">`+
      `    <svg class="loading-spinner-small" width="24" height="24" viewBox="0 0 24 24">`+
      `      <circle class="spinner-path-small" cx="12" cy="12" r="10" fill="none" stroke="var(--color-gray-500)" stroke-width="2" stroke-linecap="round"></circle>`+
      `    </svg>`+
      `  </div>`+
      `</div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;

    try {
      // Fetch goals from API using course and school info
      const apiGoals = await fetchGoalsByCourse(state.course, state.schoolId);
      
      // Keep full goal objects for badge logic, but extract names for compatibility
      let goalObjects = apiGoals;
      let goals = apiGoals.map(goal => goal.name);
      
      // If no goals returned from API, show common exam suggestions as fallback
      if (goals.length === 0) {
        
        // Use default goals as suggestions since API returned no data
        goalObjects = defaultGoals.map((goal, index) => ({
          id: `suggested-${index}`,
          name: goal,
          type: 'exam',
          source: 'suggested'
        }));
        goals = goalObjects.map(goal => goal.name);
        
        flowContent.innerHTML = ''+
          `<h1 class="flow-title">What should be included from ${escapeHtml(courseCode)}?</h1>`+
          `<div class="subtle">Exams and goals</div>`+
          `<div class="course-list-card" id="goalList"></div>`+
          `<div class="course-list-card" id="addGoalCard">`+
          `  <div class="course-row" id="addGoalRow">`+
          `    <div class="course-check add" aria-hidden="true"></div>`+
          `    <div class="course-text"><div class="course-title">Add custom exam or goal</div></div>`+
          `  </div>`+
          `</div>`+
          `<div class="cta-row hidden"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;
      } else {
        // Show regular goal list with API data
        flowContent.innerHTML = ''+
          `<h1 class="flow-title">What should be included from ${escapeHtml(courseCode)}?</h1>`+
          `<div class="subtle">Exams and goals</div>`+
          `<div class="course-list-card" id="goalList"></div>`+
          `<div class="course-list-card" id="addGoalCard">`+
          `  <div class="course-row" id="addGoalRow">`+
          `    <div class="course-check add" aria-hidden="true"></div>`+
          `    <div class="course-text"><div class="course-title">Add exam or goal</div></div>`+
          `  </div>`+
          `</div>`+
          `<div class="cta-row hidden"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;
      }
      
      const list = document.getElementById('goalList');
      function rowHtml(text, attrs, goalId){
        const selected = Array.isArray(state.goals) && state.goals.includes(text);
        return `<div class="course-row ${selected?'selected':''}" ${attrs}>
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text"><div class="course-title" id="goal-title-${goalId}">${escapeHtml(text)}</div></div>
        </div>`;
      }
      function renderList(){
        const allSelected = state.goals.length === goals.length && goals.length>0;
        const allRow = goals.length >= 2 ? `<div class="course-row ${allSelected?'selected':''}" data-select-all="1">
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text"><div class="course-title">All</div></div>
        </div>` : '';
        const items = goals.map((g, index) => {
          const goal = goalObjects[index];
          return rowHtml(g, `data-goal="${g}"`, goal.id);
        }).join('');
        list.innerHTML = allRow + items;
        
        // Add badges after DOM is updated
        goalObjects.forEach((goal, index) => {
          const titleElement = document.getElementById(`goal-title-${goal.id}`);
          if (titleElement && goal.source !== 'api') {
            // Remove any existing badges
            titleElement.querySelectorAll('.static-badge, .api-badge').forEach(b => b.remove());
            // Add appropriate badge
            if (goal.source === 'static-error') {
              const badge = createStaticBadge();
              badge.textContent = 'STATIC';
              titleElement.appendChild(badge);
            } else if (goal.source === 'static') {
              titleElement.appendChild(createStaticBadge());
            }
          }
        });
        
        const goalsCta = document.getElementById('goalsContinue').parentElement;
        const disabled = state.goals.length===0;
        document.getElementById('goalsContinue').disabled = disabled;
        goalsCta.classList.toggle('hidden', disabled);
      }
      
      // Render the list if we have goals (from API or suggested)
      if (goals.length > 0) {
        renderList();
      }

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
      if(name){ 
        const trimmed = name.trim(); 
        if(trimmed && !goals.includes(trimmed)){ 
          goals.push(trimmed);
          // Also add to goalObjects for consistency
          goalObjects.push({
            id: `custom-${goalObjects.length}`,
            name: trimmed,
            type: 'exam',
            source: 'custom'
          });
        }
      }
      renderList();
    });

      document.getElementById('goalsContinue').addEventListener('click', next);
      
    } catch (error) {
      console.error('Error loading goals from API:', error);
      
      // Don't use static fallbacks - just show error state and allow manual addition
      flowContent.innerHTML = ''+
        `<h1 class="flow-title">What should be included from ${escapeHtml(courseCode)}?</h1>`+
        `<div class="subtle">Exams and goals</div>`+
        `<div class="course-list-card" id="goalList">`+
        `  <div class="course-row" style="cursor: default; opacity: 0.6;">`+
        `    <div class="course-check" aria-hidden="true"></div>`+
        `    <div class="course-text">`+
        `      <div class="course-title">Unable to load goals from server</div>`+
        `      <div class="course-subtitle">Add your own exams or goals below</div>`+
        `    </div>`+
        `  </div>`+
        `</div>`+
        `<div class="course-list-card" id="addGoalCard">`+
        `  <div class="course-row" id="addGoalRow">`+
        `    <div class="course-check add" aria-hidden="true"></div>`+
        `    <div class="course-text"><div class="course-title">Add exam or goal</div></div>`+
        `  </div>`+
        `</div>`+
        `<div class="cta-row hidden"><button class="primary-btn" id="goalsContinue" disabled>Continue</button></div>`;
      
      // Set up event handlers for manual goal addition only
      const goals = []; // Empty goals array for error state
      const goalObjects = []; // Empty objects array for error state
      
      document.getElementById('addGoalRow').addEventListener('click', ()=>{
        const name = prompt('Exam or goal name (e.g. "Exam 1", "Final Exam", "Quiz 3")');
        if(name){ 
          const trimmed = name.trim(); 
          if(trimmed && !state.goals.includes(trimmed)){ 
            state.goals.push(trimmed);
            // Update continue button state
            const goalsCta = document.getElementById('goalsContinue').parentElement;
            const disabled = state.goals.length === 0;
            document.getElementById('goalsContinue').disabled = disabled;
            goalsCta.classList.toggle('hidden', disabled);
          }
        }
      });

      document.getElementById('goalsContinue').addEventListener('click', next);
    }
  }

  // Step 3: Concept selection (multi with expandable terms)
  async function renderConcepts(){
    // Extract course code part (handle various separators)
    let courseCode = state.course;
    
    // Split on various possible separators and take first part
    if (courseCode.includes(' - ')) {
      courseCode = courseCode.split(' - ')[0];
    } else if (courseCode.includes(', ')) {
      courseCode = courseCode.split(', ')[0];
    } else if (courseCode.includes(' ')) {
      // For cases like "NURS 320 Adults with Health Alterations"
      // Extract course code pattern (letters followed by numbers)
      const match = courseCode.match(/^([A-Z]{2,6}\s*\d+)/i);
      if (match) {
        courseCode = match[1];
      }
    }
    
    // Format goals with proper grammar
    let goalsText = '';
    if (state.goals && state.goals.length > 0) {
      if (state.goals.length === 1) {
        goalsText = state.goals[0];
      } else if (state.goals.length === 2) {
        goalsText = `${state.goals[0]} and ${state.goals[1]}`;
      } else {
        // 3+ goals: "Exam 1, Exam 2 and Exam 3"
        const lastGoal = state.goals[state.goals.length - 1];
        const otherGoals = state.goals.slice(0, -1);
        goalsText = `${otherGoals.join(', ')} and ${lastGoal}`;
      }
    } else {
      goalsText = courseCode;
    }
    
    // Show loading state first
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">What's going to be on ${escapeHtml(goalsText)}?</h1>`+
      `<div class="subtle">Concepts</div>`+
      `<div class="course-list-card" id="conceptList">`+
      `  <div class="course-row" style="justify-content: center;">`+
      `    <svg class="loading-spinner-small" width="24" height="24" viewBox="0 0 24 24">`+
      `      <circle class="spinner-path-small" cx="12" cy="12" r="10" fill="none" stroke="var(--color-gray-500)" stroke-width="2" stroke-linecap="round"></circle>`+
      `    </svg>`+
      `  </div>`+
      `</div>`+
      `<div class="cta-row hidden"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;

    try {
      // Fetch concepts from API using course, school, and goals info
      const goals = state.goals || [];
      const apiConcepts = await fetchConceptsByCourse(state.course, state.schoolId, goals);
      
      // Keep full concept objects for badge logic, but extract names for compatibility
      const conceptObjects = apiConcepts;
      const concepts = apiConcepts.map(concept => concept.name);
      
      // If no concepts returned from API, show manual addition interface
      if (concepts.length === 0) {
      flowContent.innerHTML = ''+
        `<h1 class="flow-title">What's going to be on ${escapeHtml(goalsText)}?</h1>`+
        `<div class="course-list-card" id="addConceptCard" style="margin-top: 16px;">`+
        `  <div class="course-row" id="addConceptRow">`+
        `    <div class="course-check add" aria-hidden="true"></div>`+
        `    <div class="course-text"><div class="course-title">Add new concept</div></div>`+
        `  </div>`+
        `</div>`+
        `<div class="cta-row hidden"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;
        
        // Set up manual concept addition for empty state
        function updateContinueButton() {
          const conceptsCta = document.getElementById('conceptsContinue').parentElement;
          const disabled = state.concepts.length === 0;
          document.getElementById('conceptsContinue').disabled = disabled;
          conceptsCta.classList.toggle('hidden', disabled);
        }
        
        // Set up add concept row click handler
        document.getElementById('addConceptRow').addEventListener('click', () => {
          const name = prompt('Concept name');
          if (name) { 
            const trimmed = name.trim();
            if (trimmed && !state.concepts.includes(trimmed)) { 
              state.concepts.push(trimmed);
              updateContinueButton();
            }
          }
        });
        
        // Initialize continue button state
        updateContinueButton();

        document.getElementById('conceptsContinue').addEventListener('click', next);
        
      } else {
        // Show concept list with API data
        flowContent.innerHTML = ''+
          `<h1 class="flow-title">What's going to be on ${escapeHtml(goalsText)}?</h1>`+
          `<div class="subtle">Concepts</div>`+
          `<div class="course-list-card" id="conceptList"></div>`+
          `<div class="course-list-card" id="addConceptCard">`+
          `  <div class="course-row" id="addConceptRow">`+
          `    <div class="course-check add" aria-hidden="true"></div>`+
          `    <div class="course-text"><div class="course-title">Add new concept</div></div>`+
          `  </div>`+
          `</div>`+
          `<div class="cta-row hidden"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;
      }
      
      const list = document.getElementById('conceptList');
      function rowHtml(text, attrs, conceptId){
        const selected = Array.isArray(state.concepts) && state.concepts.includes(text);
        return `<div class="course-row ${selected?'selected':''}" ${attrs}>
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text"><div class="course-title" id="concept-title-${conceptId}">${escapeHtml(text)}</div></div>
        </div>`;
      }
      
      function renderList(){
        const allSelected = state.concepts.length === concepts.length && concepts.length>0;
        const allRow = concepts.length >= 2 ? `<div class="course-row ${allSelected?'selected':''}" data-select-all="1">
          <div class="course-check" aria-hidden="true"></div>
          <div class="course-text"><div class="course-title">All</div></div>
        </div>` : '';
        const items = concepts.map((c, index) => {
          const concept = conceptObjects[index];
          return rowHtml(c, `data-concept="${c}"`, concept.id);
        }).join('');
        list.innerHTML = allRow + items;
        
        // Add badges after DOM is updated
        conceptObjects.forEach((concept, index) => {
          const titleElement = document.getElementById(`concept-title-${concept.id}`);
          if (titleElement && concept.source !== 'api') {
            // Remove any existing badges
            titleElement.querySelectorAll('.static-badge, .api-badge').forEach(b => b.remove());
            // Add appropriate badge
            if (concept.source === 'static-error') {
              const badge = createStaticBadge();
              badge.textContent = 'STATIC';
              titleElement.appendChild(badge);
            } else if (concept.source === 'static') {
              titleElement.appendChild(createStaticBadge());
            }
          }
        });
        
        const cta = document.getElementById('conceptsContinue').parentElement;
        const disabled = state.concepts.length===0;
        document.getElementById('conceptsContinue').disabled = disabled;
        cta.classList.toggle('hidden', disabled);
      }


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
        if(name){ 
          const trimmed = name.trim();
          if(trimmed && !concepts.includes(trimmed)){ 
            concepts.push(trimmed);
            // Also add to conceptObjects for consistency
            conceptObjects.push({
              id: `custom-${conceptObjects.length}`,
              name: trimmed,
              description: 'User-added concept',
              terms: [],
              source: 'custom'
            });
          }
        }
        renderList();
      });

      document.getElementById('conceptsContinue').addEventListener('click', next);
      
      // Select all concepts by default
      if (concepts.length > 0) {
        state.concepts = concepts.slice();
      }
      
      // Initial render
      renderList();
      
    } catch (error) {
      console.error('Error loading concepts:', error);
      // Show error state with manual addition only
      flowContent.innerHTML = ''+
        `<h1 class="flow-title">What's going to be on ${escapeHtml(goalsText)}?</h1>`+
        `<div class="course-list-card" id="addConceptCard" style="margin-top: 16px;">`+
        `  <div class="course-row" id="addConceptRow">`+
        `    <div class="course-check add" aria-hidden="true"></div>`+
        `    <div class="course-text"><div class="course-title">Add concept</div></div>`+
        `  </div>`+
        `</div>`+
        `<div class="cta-row hidden"><button class="primary-btn" id="conceptsContinue" disabled>Continue</button></div>`;
      
      // Set up manual concept addition for error state  
      function updateContinueButton() {
        const conceptsCta = document.getElementById('conceptsContinue').parentElement;
        const disabled = state.concepts.length === 0;
        document.getElementById('conceptsContinue').disabled = disabled;
        conceptsCta.classList.toggle('hidden', disabled);
      }
      
      // Set up add concept row click handler
      document.getElementById('addConceptRow').addEventListener('click', () => {
        const name = prompt('Concept name');
        if (name) { 
          const trimmed = name.trim();
          if (trimmed && !state.concepts.includes(trimmed)) { 
            state.concepts.push(trimmed);
            updateContinueButton();
          }
        }
      });
      
      // Initialize continue button state
      updateContinueButton();

      document.getElementById('conceptsContinue').addEventListener('click', next);
    }
  }

  // Step 4: Knowledge state (slider)  
  function renderKnowledge(){
    const sliderOptions = [
      'Not at all, start from scratch',
      'Somewhat, speed me along',
      'Very, I just want extra practice'
    ];
    
    flowContent.innerHTML = ''+
      `<h1 class="flow-title">How confident are you feeling already?</h1>`+
      `<div class="knowledge-slider-container">`+
      `  <div class="knowledge-selected-text" id="knowledgeSelectedText">Somewhat, speed me along</div>`+
      `  <div class="knowledge-slider-track">`+
      `    <div class="slider-dots">`+
      `      <div class="slider-dot"></div>`+
      `      <div class="slider-dot"></div>`+
      `      <div class="slider-dot"></div>`+
      `    </div>`+
      `    <input type="range" id="knowledgeSlider" class="knowledge-slider" min="0" max="2" step="0.01" value="1" />`+
      `  </div>`+
      `  <div class="knowledge-slider-labels">`+
      `    <div class="knowledge-slider-label left">Not</div>`+
      `    <div class="knowledge-slider-label">Somewhat</div>`+
      `    <div class="knowledge-slider-label right">Very</div>`+
      `  </div>`+
      `</div>`+
      `<div class="cta-row" id="knowledgeCta">`+
      `  <button class="primary-btn" id="knowledgeContinue">Continue</button>`+
      `  <button class="diagnostic-btn" id="diagnosticBtn">I don't know, help me diagnose</button>`+
      `</div>`;

    const slider = document.getElementById('knowledgeSlider');
    const selectedText = document.getElementById('knowledgeSelectedText');
    const knowledgeContinue = document.getElementById('knowledgeContinue');
    const diagnosticBtn = document.getElementById('diagnosticBtn');
    
    const knowledgeCta = document.getElementById('knowledgeCta');
    
    // Set default state
    state.knowledge = sliderOptions[1]; // "Somewhat, speed me along"
    selectedText.classList.add('selected');
    
    // Update gradient fill based on slider position
    function updateGradientFill(value) {
      const percentage = (parseFloat(value) / 2) * 100; // Convert 0-2 range to 0-100%
      const track = document.querySelector('.knowledge-slider-track');
      if (track) {
        track.style.setProperty('--fill-width', `${percentage}%`);
      }
    }
    
    // Snap to nearest whole number
    function snapToNearestPosition(value) {
      return Math.round(parseFloat(value));
    }
    
    // Update text and state when slider snaps to position
    function updateSliderSelection(snappedValue) {
      if (snappedValue !== null && snappedValue !== undefined) {
        state.knowledge = sliderOptions[snappedValue];
        selectedText.textContent = sliderOptions[snappedValue];
        selectedText.classList.add('selected');
        // Clear diagnostic selection
        diagnosticBtn.classList.remove('selected');
      }
    }

    let isDragging = false;
    let lastSnappedValue = 1; // Start with middle position
    
    // Initialize gradient fill with default position
    updateGradientFill(1);
    
    // Handle smooth dragging with threshold-based snapping
    slider.addEventListener('input', (e) => {
      isDragging = true;
      const currentValue = parseFloat(e.target.value);
      const potentialSnap = snapToNearestPosition(currentValue);
      
      // Update gradient fill in real-time during drag
      updateGradientFill(currentValue);
      
      // Define snap thresholds (snap when crossing 25% past center of each zone)
      const snapThresholds = [0.25, 1.25]; // Snap points between positions
      
      // Check if we've crossed a threshold for snapping
      let shouldSnap = false;
      let newSnappedValue = potentialSnap;
      
      if (currentValue <= snapThresholds[0]) {
        newSnappedValue = 0;
        shouldSnap = lastSnappedValue !== 0;
      } else if (currentValue >= snapThresholds[1]) {
        newSnappedValue = 2;
        shouldSnap = lastSnappedValue !== 2;
      } else {
        newSnappedValue = 1;
        shouldSnap = lastSnappedValue !== 1;
      }
      
      // Update text immediately when crossing threshold
      if (shouldSnap && newSnappedValue !== lastSnappedValue) {
        lastSnappedValue = newSnappedValue;
        updateSliderSelection(newSnappedValue);
      }
    });
    
    // Handle final snap when user releases
    slider.addEventListener('change', (e) => {
      isDragging = false;
      const snappedValue = snapToNearestPosition(e.target.value);
      e.target.value = snappedValue; // Snap slider position visually
      lastSnappedValue = snappedValue;
      updateSliderSelection(snappedValue);
      updateGradientFill(snappedValue); // Update gradient fill to final position
    });
    
    // Handle diagnostic button
    diagnosticBtn.addEventListener('click', () => {
      state.knowledge = "I don't know, help me diagnose";
      selectedText.textContent = "I don't know, help me diagnose";
      selectedText.classList.add('selected');
      diagnosticBtn.classList.add('selected');
      // Reset slider to middle position
      slider.value = 1;
      updateGradientFill(1);
      // Automatically advance to next step
      next();
    });
    
    // Initialize from existing state if any, otherwise keep default
    if (state.knowledge && state.knowledge !== sliderOptions[1]) {
      const sliderIndex = sliderOptions.indexOf(state.knowledge);
      if (sliderIndex !== -1) {
        slider.value = sliderIndex;
        selectedText.textContent = sliderOptions[sliderIndex];
        updateSliderSelection(sliderIndex);
        updateGradientFill(sliderIndex);
      } else if (state.knowledge === "I don't know, help me diagnose") {
        diagnosticBtn.classList.add('selected');
        selectedText.textContent = state.knowledge;
        selectedText.classList.add('selected');
        // Clear slider value when diagnostic is selected
        slider.value = 1; // Reset to default position
        updateGradientFill(1);
      }
    }
    
    knowledgeContinue.addEventListener('click', ()=>{ if(!knowledgeContinue.disabled) next(); });
  }

  // Step 5: Date selection
  function renderDate(){
    // Extract course code part (handle various separators)
    let courseCode = state.course;
    
    // Split on various possible separators and take first part
    if (courseCode.includes(' - ')) {
      courseCode = courseCode.split(' - ')[0];
    } else if (courseCode.includes(', ')) {
      courseCode = courseCode.split(', ')[0];
    } else if (courseCode.includes(' ')) {
      // For cases like "NURS 320 Adults with Health Alterations"
      // Extract course code pattern (letters followed by numbers)
      const match = courseCode.match(/^([A-Z]{2,6}\s*\d+)/i);
      if (match) {
        courseCode = match[1];
      }
    }
    
    const goalText = state.goals[0] || courseCode;
    
    flowContent.innerHTML = ''+
      `<h1 class="flow-title" id="dateTitle">When do you need to be ready for ${escapeHtml(goalText)}?</h1>`+
      `<div class="custom-date-picker">`+
      `  <button class="date-picker-btn" id="datePickerBtn">`+
      `    <div class="date-picker-content">`+
      `      <div class="date-picker-icon">`+
      `        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">`+
      `          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>`+
      `          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>`+
      `          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>`+
      `          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>`+
      `        </svg>`+
      `      </div>`+
      `      <div class="date-picker-text" id="datePickerText">Select date</div>`+
      `    </div>`+
      `  </button>`+
      `  <input id="dueDate" class="date-input-hidden" type="date" />`+
      `</div>`+
      `<div class="cta-row" style="display:flex; flex-direction:column; gap:16px;">
        <button class="primary-btn hidden" id="startBtn">Start studying</button>
        <button class="text-btn" id="skipBtn">Skip for now</button>
      </div>`;
    
    const hiddenInput = document.getElementById('dueDate');
    const datePickerBtn = document.getElementById('datePickerBtn');
    const datePickerText = document.getElementById('datePickerText');
    const dateTitle = document.getElementById('dateTitle');
    const startBtn = document.getElementById('startBtn');
    
    // Function to format date for display (without days away text)
    function formatDateDisplay(dateString) {
      const date = new Date(dateString + 'T00:00:00');
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
    
    // Function to calculate days away
    function calculateDaysAway(dateString) {
      const date = new Date(dateString + 'T00:00:00');
      const today = new Date();
      const diffTime = date - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Function to update title with days away text
    function updateTitle(dateString = null) {
      const newText = dateString ? (() => {
        const daysAway = calculateDaysAway(dateString);
        let timeText = '';
        
        if (daysAway === 0) timeText = 'today';
        else if (daysAway === 1) timeText = 'tomorrow';
        else if (daysAway > 1) timeText = `in ${daysAway} days`;
        else if (daysAway === -1) timeText = 'yesterday';
        else if (daysAway < -1) timeText = `${Math.abs(daysAway)} days ago`;
        
        return `You need to be ready for ${goalText} ${timeText}. Let's get started!`;
      })() : `When do you need to be ready for ${goalText}?`;
      
      // Only animate if the text is actually changing
      if (dateTitle.textContent !== newText) {
        // Start fade out
        dateTitle.classList.add('updating');
        
        // Wait for fade out, then change text and fade in
        setTimeout(() => {
          dateTitle.textContent = newText;
          dateTitle.classList.remove('updating');
        }, 150); // Half of the transition duration for smooth crossfade
      }
    }
    
    // Detect mobile browsers
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
    
    // For mobile browsers, replace the button with a styled date input
    if (isMobile) {
      console.log('Mobile detected, using direct date input approach');
      replaceBtnWithDateInput();
      } else {
      // Desktop: Click handler to open native date picker
      datePickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Date picker button clicked (desktop)');
        
        // Try showPicker for desktop browsers
        if (typeof hiddenInput.showPicker === 'function') {
          try {
            hiddenInput.showPicker();
            console.log('showPicker() succeeded');
            return;
          } catch (error) {
            console.log('showPicker() failed:', error);
          }
        }
        
        // Desktop fallback
        hiddenInput.focus();
        hiddenInput.click();
      });
    }
    
    // Replace button with styled date input for mobile
    function replaceBtnWithDateInput() {
      // Create a date input that looks exactly like the button
      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = hiddenInput.value;
      dateInput.className = 'mobile-date-input';
      
      // Style for when date is selected
      if (dateInput.value) {
        dateInput.style.boxShadow = 'var(--shadow-interactive)';
        dateInput.style.color = 'var(--sys-text-primary)';
      } else {
        dateInput.style.color = 'var(--sys-text-secondary)';
      }
      
      // Replace the button with the input
      datePickerBtn.style.display = 'none';
      datePickerBtn.parentNode.insertBefore(dateInput, datePickerBtn.nextSibling);
      
      console.log('Button replaced with mobile date input');
      
      // Handle date changes
      dateInput.addEventListener('change', () => {
        console.log('Mobile date selected:', dateInput.value);
        hiddenInput.value = dateInput.value;
        state.dueDate = dateInput.value;
        
        // Update styling when date is selected
        if (dateInput.value) {
          dateInput.style.boxShadow = 'var(--shadow-interactive)';
          dateInput.style.color = 'var(--sys-text-primary)';
        }
        
        // Update the title and show start button
        if (state.dueDate) {
          datePickerText.textContent = formatDateDisplay(state.dueDate);
          updateTitle(state.dueDate);
          
          // Show the start button
          startBtn.classList.remove('hidden');
          startBtn.classList.add('show');
        } else {
          datePickerText.textContent = 'Select date';
          updateTitle();
          
          // Hide the start button
          startBtn.classList.add('hidden');
          startBtn.classList.remove('show');
        }
      });
      
      // Focus/blur styling is now handled by CSS
    }
    
    // Handle date selection
    hiddenInput.addEventListener('input', () => {
      state.dueDate = hiddenInput.value;
      if (state.dueDate) {
        datePickerText.textContent = formatDateDisplay(state.dueDate);
        datePickerBtn.classList.add('selected');
        updateTitle(state.dueDate);
        
        // Animate in the start button
        startBtn.classList.remove('hidden');
        startBtn.classList.add('show');
      } else {
        datePickerText.textContent = 'Select date';
        datePickerBtn.classList.remove('selected');
        updateTitle();
        
        // Hide the start button
        startBtn.classList.add('hidden');
        startBtn.classList.remove('show');
      }
    });
    
    // Initialize with existing date if any
    if (state.dueDate) {
      hiddenInput.value = state.dueDate;
      datePickerText.textContent = formatDateDisplay(state.dueDate);
      datePickerBtn.classList.add('selected');
      updateTitle(state.dueDate);
      
      // Show the start button if date already exists
      startBtn.classList.remove('hidden');
      startBtn.classList.add('show');
    }
    
    document.getElementById('skipBtn').addEventListener('click', goLoading);
    startBtn.addEventListener('click', goLoading);
  }

  function goLoading(){ stepIndex = 6; render(); }

  // Step 6: Loading
  function renderLoading(){
    // Hide the header with progress bar
    const header = document.querySelector('.flow-header');
    if (header) header.style.display = 'none';
    
    // Get tailored copy based on entry point
    let loadingText = 'Generating study plan';
    if (state.goalType === 'cram') {
      loadingText = 'Generating cram session';
    } else if (state.goalType === 'memorize') {
      loadingText = 'Generating memorization plan';
    }
    
    flowContent.innerHTML = ''+
      `<div class="loading-screen">
         <div class="loading-content">
           <div class="loading-spinner">
             <svg class="material-spinner" width="148" height="148" viewBox="0 0 148 148">
               <circle class="spinner-path" cx="74" cy="74" r="66" fill="none" stroke="var(--color-twilight-500)" stroke-width="16" stroke-linecap="round"></circle>
             </svg>
           </div>
           <div class="loading-text">${loadingText}</div>
         </div>
       </div>`;
    


    // Persist for bottom sheet
    const pill = knowledgeToPill[state.knowledge] || 'Somewhat confident';
    const headline = knowledgeToHeadline[state.knowledge] || knowledgeToHeadline['Somewhat'];
    try {
      localStorage.setItem('onboarding_sheet_open','true');
      localStorage.setItem('onboarding_knowledge_pill', pill);
      localStorage.setItem('onboarding_knowledge_headline', headline);
      if(state.school) localStorage.setItem('onboarding_school', state.school);
      if(state.course) localStorage.setItem('onboarding_course', state.course);
      if(state.goals && state.goals.length>0) localStorage.setItem('onboarding_goals', JSON.stringify(state.goals));
      if(state.concepts && state.concepts.length>0) localStorage.setItem('onboarding_concepts', JSON.stringify(state.concepts));
      if(state.dueDate) localStorage.setItem('plan_due_date', state.dueDate);
      if(state.goalType) localStorage.setItem('onboarding_goal_type', state.goalType);
    } catch(_){}

    setTimeout(()=>{ window.location.href = '../html/study-plan.html'; }, 6000);
  }

  // Helpers
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
  function cssId(str){ return String(str||'').replace(/\s+/g,'-').replace(/[^a-zA-Z0-9_-]/g,''); }
  function toTitleCase(str){ 
    return String(str||'').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Normalize course display names by replacing em dashes and long dashes with commas
  function normalizeCourseDisplay(courseName) {
    if (!courseName) return '';
    
    return String(courseName)
      // Remove leading dash and whitespace
      .replace(/^[-\s]+/, '')
      // Replace em dash (–) and en dash (—) with comma and space
      .replace(/\s*[–—]\s*/g, ', ')
      // Replace regular dash between course code and name with comma and space
      // Only if it's separating what looks like a course code from a course name
      .replace(/^([A-Z]{2,6}\s*\d+)\s*[-]\s*(.+)$/i, '$1, $2')
      // Clean up any double commas or extra spaces
      .replace(/,\s*,/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Badge helpers for goals
  function createStaticBadge() {
    const badge = document.createElement('span');
    badge.className = 'static-badge';
    badge.textContent = 'STATIC';
    badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #586380;
        background: #EDEFF4;
        vertical-align: middle;
    `;
    return badge;
  }

  function createApiBadge() {
    const badge = document.createElement('span');
    badge.className = 'api-badge';
    badge.textContent = 'API';
    badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #4255FF;
        background: #EDEFFF;
        vertical-align: middle;
    `;
    return badge;
  }

  // Add API debug function to global scope for easy testing
  window.normalizeCourseDisplay = normalizeCourseDisplay;
  
  // Debug functions for testing API responses in console
  window.testGoalsAPI = async function(courseId, schoolId) {
    console.log('Testing goals API with:', { courseId, schoolId });
    try {
      const goals = await fetchGoalsByCourse(courseId, schoolId);
      console.log('Goals API test result:', goals);
      return goals;
    } catch (error) {
      console.error('Goals API test failed:', error);
      return null;
    }
  };

  window.testConceptsAPI = async function(courseId, schoolId, goals) {
    console.log('Testing concepts API with:', { courseId, schoolId, goals });
    try {
      const concepts = await fetchConceptsByCourse(courseId, schoolId, goals);
      console.log('Concepts API test result:', concepts);
      console.log('Major topics found:', concepts.map(c => c.major_topic).filter(Boolean));
      return concepts;
    } catch (error) {
      console.error('Concepts API test failed:', error);
      return null;
    }
  };

  // Clear API cache for testing
  window.clearAPICache = function() {
    apiCache.goalsByCourse.clear();
    apiCache.conceptsByCourse.clear();
    console.log('API cache cleared');
  };

  // Test step 2 specifically with current state
  window.testStep2API = function() {
    console.log('Testing Step 2 API call with current state...');
    console.log('Current state:', { 
        course: state.course,
        schoolId: state.schoolId,
      school: state.school 
    });
    
    const courseId = state.course || state.course?.split(' - ')[0];
    const schoolId = state.schoolId;
    
    console.log('Will call API with:', { courseId, schoolId });
    
    return window.testGoalsAPI(courseId, schoolId);
  };

  // Test course deduplication
  window.testCourseDuplicates = async function(query = '') {
    console.log('Testing course duplicates for query:', query || '(empty)');
    try {
      const allCourses = await fetchCourses();
      console.log('Total courses from API:', allCourses.length);
      
      // Show duplicates by code
      const codeCount = {};
      allCourses.forEach(course => {
        const code = String(course.code || '').trim().toUpperCase();
        if (code) {
          codeCount[code] = (codeCount[code] || 0) + 1;
        }
      });
      
      const duplicates = Object.entries(codeCount).filter(([code, count]) => count > 1);
      console.log('Duplicate course codes found:', duplicates);
      
      // Test filtering with the query
      const filtered = filterCoursesByQuery(allCourses, query);
      console.log('Filtered and deduplicated results:', filtered.length);
      
      return { allCourses, duplicates, filtered };
    } catch (error) {
      console.error('Error testing course duplicates:', error);
      return null;
    }
  };

  // Debug specific course visibility
  window.findCourse = async function(courseCode) {
    console.log(`🔍 Searching for course: "${courseCode}"`);
    try {
      // Step 1: Check raw API data
      const allCourses = await fetchCourses();
      console.log('📡 Step 1: Raw API courses loaded:', allCourses.length);
      
      // Find exact matches in raw data
      const exactMatches = allCourses.filter(course => {
        const code = String(course.code || '').trim().toUpperCase();
        return code === courseCode.toUpperCase();
      });
      console.log('📡 Exact matches in raw API:', exactMatches.length);
      if (exactMatches.length > 0) {
        console.log('📡 Raw API matches:', exactMatches);
      }
      
      // Find partial matches in raw data
      const partialMatches = allCourses.filter(course => {
        const code = String(course.code || '').trim().toUpperCase();
        const name = String(course.name || '').trim().toUpperCase();
        const searchTerm = courseCode.toUpperCase();
        return code.includes(searchTerm) || name.includes(searchTerm);
      });
      console.log('📡 Partial matches in raw API:', partialMatches.length);
      
      // Step 2: Test filtering pipeline
      console.log('🔄 Step 2: Testing filtering pipeline...');
      const filtered = filterCoursesByQuery(allCourses, courseCode);
      console.log('🔄 After filtering and deduplication:', filtered.length);
      
      const filteredMatches = filtered.filter(course => {
        const code = String(course.code || '').trim().toUpperCase();
        return code === courseCode.toUpperCase();
      });
      console.log('🔄 Exact matches after filtering:', filteredMatches.length);
      if (filteredMatches.length > 0) {
        console.log('🔄 Filtered matches:', filteredMatches);
      }
      
      // Step 3: Check course data structure
      if (partialMatches.length > 0) {
        console.log('📋 Step 3: Course data structure analysis:');
        console.log('📋 Sample course object:', partialMatches[0]);
        console.log('📋 Available fields:', Object.keys(partialMatches[0]));
      }
      
      return {
        rawApiTotal: allCourses.length,
        exactInRaw: exactMatches,
        partialInRaw: partialMatches,
        filteredTotal: filtered.length,
        exactInFiltered: filteredMatches,
        sampleStructure: partialMatches[0] || null
      };
    } catch (error) {
      console.error('❌ Error searching for course:', error);
      return null;
    }
  };

  // Test the entire course search pipeline
  window.debugCourseSearch = async function(searchTerm = 'NURS') {
    console.log(`🧪 Testing complete course search pipeline for: "${searchTerm}"`);
    
    try {
      // Simulate the exact process that happens in the UI
      console.log('🔄 Step 1: Fetching all courses...');
      const allCourses = await fetchCourses();
      
      console.log('🔄 Step 2: Applying course filter...');
      const filtered = filterCoursesByQuery(allCourses, searchTerm);
      
      console.log('🔄 Step 3: Checking what would be displayed...');
      console.log(`Results that would show in UI:`, filtered.slice(0, 8));
      
      return filtered;
    } catch (error) {
      console.error('❌ Error in course search pipeline:', error);
      return null;
    }
  };

  // Debug school-specific courses
  window.debugSchoolCourses = async function(schoolName, searchTerm = '') {
    console.log(`🏫 Testing school-specific courses for: "${schoolName}"`);
    
    try {
      // Step 1: Find the school ID
      console.log('🔍 Step 1: Finding school...');
      const allSchools = await fetchSchools();
      
      const schoolMatches = allSchools.filter(school => {
        const name = String(school.name || '').toLowerCase();
        return name.includes(schoolName.toLowerCase());
      });
      
      console.log('🔍 School matches found:', schoolMatches.length);
      if (schoolMatches.length > 0) {
        console.log('🔍 School matches:', schoolMatches);
      } else {
        console.log('❌ No schools found matching:', schoolName);
        return null;
      }
      
      // Step 2: Get courses for each matching school
      for (const school of schoolMatches) {
        console.log(`\n🏫 Testing courses for: ${school.name} (ID: ${school.id})`);
        
        const schoolCourses = await fetchCoursesBySchool(school.id);
        console.log(`📚 Total courses for ${school.name}:`, schoolCourses.length);
        
        if (searchTerm) {
          const nurseCourses = schoolCourses.filter(course => {
            const code = String(course.code || '').toUpperCase();
            const name = String(course.name || '').toUpperCase();
            const subject = String(course.subject || '').toUpperCase();
            const term = searchTerm.toUpperCase();
            return code.includes(term) || name.includes(term) || subject.includes(term);
          });
          console.log(`📚 ${searchTerm} courses for ${school.name}:`, nurseCourses.length);
          if (nurseCourses.length > 0) {
            console.log(`📚 ${searchTerm} course details:`, nurseCourses);
          }
        } else {
          console.log(`📚 Sample courses:`, schoolCourses.slice(0, 5));
        }
      }
      
      return schoolMatches;
    } catch (error) {
      console.error('❌ Error testing school courses:', error);
      return null;
    }
  };

  // Test specific school course filtering (matches UI behavior)
  window.testSchoolCourseFiltering = async function(schoolId, searchTerm = 'NURS') {
    console.log(`🧪 Testing school course filtering for schoolId: ${schoolId}, search: "${searchTerm}"`);
    
    try {
      // This matches the exact logic used in the Add Course screen
      console.log('🔄 Step 1: Fetching courses by school...');
      const schoolCourses = await fetchCoursesBySchool(schoolId);
      console.log('📚 Raw school courses:', schoolCourses.length);
      
      console.log('🔄 Step 2: Applying general course filter...');
      const generalCourses = await fetchCourses();
      const filtered = filterCoursesByQuery(generalCourses, searchTerm);
      console.log('📚 General filtered courses:', filtered.length);
      
      console.log('🔄 Step 3: Checking if school-specific courses are used...');
      // The current logic uses general courses, not school-specific ones
      console.log('⚠️  Current implementation uses general courses API, not school-specific courses');
      console.log('⚠️  School-specific courses are fetched but not used in search');
      
      return {
        schoolSpecific: schoolCourses,
        generalFiltered: filtered,
        schoolId: schoolId
      };
    } catch (error) {
      console.error('❌ Error testing school course filtering:', error);
      return null;
    }
  };

  // Force reload step 2 to test API
  window.forceReloadStep2 = function() {
    if (stepIndex === 2) {
      console.log('Forcing reload of step 2...');
    render();
    } else {
      console.log('Navigate to step 2 first, then call this function');
    }
  };

  // Debug concept API response structure
  window.debugConceptAPI = async function(schoolName, courseName, goal) {
    console.log('🧬 Debugging concept API response structure...');
    try {
      const response = await window.QuizletApi.getConceptsByGoal(schoolName, courseName, goal);
      console.log('🧬 Raw API response:', response);
      
      const availableConcepts = response?.metadata?.availableConcepts || [];
      console.log('🧬 Available concepts array:', availableConcepts);
      
      if (availableConcepts.length > 0) {
        console.log('🧬 First concept object:', availableConcepts[0]);
        console.log('🧬 First concept fields:', Object.keys(availableConcepts[0]));
        console.log('🧬 Major topic field:', availableConcepts[0].major_topic);
        console.log('🧬 Name field:', availableConcepts[0].name);
      }
      
      return { response, availableConcepts };
    } catch (error) {
      console.error('🧬 Error debugging concept API:', error);
      return null;
    }
  };

  // Test concept search functionality
  window.testConceptSearch = function(query = 'cell biology', includeResults = true) {
    if (stepIndex !== 3) {
      console.log('Navigate to step 3 (concepts) first, then call this function');
      return;
    }
    
    const conceptSearch = document.getElementById('conceptSearch');
    const conceptSearchResults = document.getElementById('conceptSearchResults');
    const addConceptBtn = document.getElementById('addConceptBtn');
    
    if (!conceptSearch) {
      console.log('Concept search not available - try this on the empty concepts screen');
      return;
    }
    
    // Simulate search
    conceptSearch.value = query;
    
    if (includeResults) {
      // Show mock results
      const mockResults = [
        { name: 'Cell Biology', description: 'Study of cellular structure and function' },
        { name: 'Cellular Respiration', description: 'Process of energy production in cells' },
        { name: 'Cell Membrane', description: 'Boundary structure of cells' }
      ];
      
      conceptSearchResults.innerHTML = `
        <div class="location-schools">
          ${mockResults.map(result => `
            <div class="location-school-item concept-result-item" data-concept="${result.name}">
              <div class="location-school-name">${result.name}</div>
              <div class="location-school-address">${result.description}</div>
            </div>
          `).join('')}
        </div>
      `;
      conceptSearchResults.style.display = 'block';
      addConceptBtn.style.display = 'none';
      
      // Add click handlers
      conceptSearchResults.querySelectorAll('.concept-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const conceptName = item.getAttribute('data-concept');
          console.log('Would add concept:', conceptName);
          // Add the concept
          if (!state.concepts.includes(conceptName)) {
            state.concepts.push(conceptName);
            console.log('Added concept:', conceptName);
            console.log('Current concepts:', state.concepts);
          }
        });
      });
      
      console.log('Mock search results displayed. Click on any result to add it.');
    } else {
      // Show no results - just display plus button
      conceptSearchResults.style.display = 'none';
      addConceptBtn.style.display = 'flex';
      console.log('No results - Plus button should be visible for adding.');
    }
  };

  // Events
  backBtn.addEventListener('click', prev);
  render();
})();


