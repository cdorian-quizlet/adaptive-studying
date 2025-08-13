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
    courseSelected: false, // Track if course was selected from results vs just typed
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
  
  // Cache will be populated on first API call

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
      `<div class="course-cta hidden" id="coursesCta"><button class="primary-btn" id="coursesContinue">Continue</button></div>`;

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
      `      <img src="../images/clear.png" alt="Clear" />`+
      `    </button>`+
      `  </div>`+
      `  <div id="schoolSuggestions" class="location-section" style="display: none; margin-top: 8px;"></div>`+
      `  <div class="input-field" id="courseField" style="display: none;">`+
      `    <input id="newCourseName" class="text-input" placeholder="Course name (e.g. BIO 110)" aria-label="Course name" autocomplete="off" />`+
      `    <button id="courseClearBtn" class="input-clear-btn" style="display: none;" aria-label="Clear course name">`+
      `      <img src="../images/clear.png" alt="Clear" />`+
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
    if (state.course) {
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
    
    // Immediately request location access when screen loads
    requestLocationAccess();
    
    function requestLocationAccess() {
      if (locationRequested) return;
      locationRequested = true;
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            console.log('Location access granted:', position);
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
            console.log('Location access denied or failed:', error);
            showLocationSchools(); // Show fallback schools if location fails
          },
          { 
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        showLocationSchools(); // Show fallback schools without location context
      }
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
          
          // For nearby schools, show location if < 1 mile, otherwise show distance
          let displayLocation;
          if (nearbySchools && school.distance !== undefined) {
            if (school.distance < 1) {
              // Show actual location for very close schools
              const cityState = school.city && school.state ? `${toTitleCase(school.city)}, ${school.state.toUpperCase()}` : '';
              displayLocation = cityState || school.location || school.address || 'Nearby location';
            } else {
              // Show distance for schools that are 1+ miles away
              displayLocation = `${school.distanceText} away`;
            }
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
              
              // For nearby schools, show location if < 1 mile, otherwise show distance
              let displayLocation;
              if (nearbySchools && school.distance !== undefined) {
                if (school.distance < 1) {
                  // Show actual location for very close schools
                  const cityState = school.city && school.state ? `${toTitleCase(school.city)}, ${school.state.toUpperCase()}` : '';
                  displayLocation = cityState || school.location || school.address || 'Nearby location';
                } else {
                  // Show distance for schools that are 1+ miles away
                  displayLocation = `${school.distanceText} away`;
                }
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
    
    function showPopularCourses(schoolName) {
      const displayName = toTitleCase(schoolName);
      locationSection.innerHTML = `
        <div class="location-header">
          <img class="location-icon" src="../images/upward-graph.png" alt="Popular" aria-hidden="true" />
          <span>Popular at ${displayName}</span>
        </div>
        <div class="location-schools">
          ${popularCourses.slice(0, 6).map(course => `
            <div class="location-school-item" data-course="${course.name}">
              <div class="location-school-name">${course.name}</div>
              <div class="location-school-address">${course.description}</div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Show the location section and hide course suggestions
      locationSection.style.display = 'block';
      courseSuggestions.style.display = 'none';
      
      // Add click handlers for popular courses
      locationSection.querySelectorAll('.location-school-item').forEach(item => {
        item.addEventListener('click', () => {
          const courseName = item.getAttribute('data-course');
          newCourseName.value = courseName;
          state.course = courseName;
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
    
    function showCourseResults(courses) {
      courseSuggestions.innerHTML = `
        <div class="location-schools">
          ${courses.slice(0, 8).map(course => {
            const courseName = course.displayName || course.name || '';
            const courseDescription = course.description || course.subject || 'Course description';
            return `
              <div class="location-school-item" data-course="${courseName}">
                <div class="location-school-name">${courseName}</div>
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
          const courseName = item.getAttribute('data-course');
          newCourseName.value = courseName;
          state.course = courseName;
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
      
      // Immediately hide school suggestions and prevent them from showing again
      schoolSuggestions.style.display = 'none';
      
      // Show clear button
      schoolClearBtn.style.display = 'flex';
      
      // Replace location section with popular courses
      showPopularCourses(titleCaseSchoolName);
      
      // Show course input when school is selected
      courseField.style.display = 'flex';
      updateAddCourseButton();
      
      // Focus on course input
      setTimeout(() => {
        newCourseName.focus();
      }, 100);
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

    function renderList(container, items, nameKey, onSelect, useCardLayout = false){
      console.log('renderList called with:', items.length, 'items');
      if (!items || items.length === 0){ 
        console.log('No items to display, hiding container');
        container.style.display = 'none'; 
        container.innerHTML = ''; 
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
              const titleCaseName = toTitleCase(name);
              return `
                <div class="location-school-item" data-id="${String(id)}" data-name="${name.replace(/"/g,'&quot;')}">
                  <div class="location-school-name">${titleCaseName}</div>
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
      }
    }, 250);
    // Clear button functionality
    schoolClearBtn.addEventListener('click', () => {
      schoolName.value = '';
      state.schoolId = '';
      state.school = '';
      schoolClearBtn.style.display = 'none';
      schoolSuggestions.style.display = 'none';
      courseSuggestions.style.display = 'none';
      
      // Clear course input and hide course field
      newCourseName.value = '';
      state.course = '';
      courseClearBtn.style.display = 'none';
      courseField.style.display = 'none';
      
      // Show location section again
      locationSection.style.display = 'block';
      
      // Restore location schools instead of popular courses
      renderLocationSection();
      // Re-request location to get fresh nearby schools if available
      if (userLocation) {
        getNearbySchools(userLocation.latitude, userLocation.longitude)
          .then(nearbySchools => showLocationSchools(nearbySchools));
      } else {
        requestLocationAccess();
      }
      
      updateAddCourseButton();
      schoolName.focus();
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

    // Courses - always load all courses
    const updateCourse = debounce(async ()=>{
      try {
        const query = newCourseName.value.trim();
        
        // If course input is empty and school is selected, show popular courses
        if (!query && state.schoolId) {
          showPopularCourses(state.school);
          return;
        }
        
        // If there's a query, show course search results
        if (query) {
          const list = await fetchCourses();
          console.log('All courses loaded:', list.length, 'courses');
          
          // Filter courses that match the query in either code or name
          const items = filterCoursesByQuery(list, query);
          console.log('Filtered courses:', items.length, 'matches for:', query);
          
          if (items.length > 0) {
            showCourseResults(items);
          } else {
            // Hide both sections if no results
            courseSuggestions.style.display = 'none';
            locationSection.style.display = 'none';
          }
        } else {
          // Hide course suggestions if no query
          courseSuggestions.style.display = 'none';
          if (state.schoolId) {
            showPopularCourses(state.school);
          }
        }
      } catch (e) {
        console.error('Error in updateCourse:', e);
      }
    }, 250);
    
    // Course clear button functionality
    courseClearBtn.addEventListener('click', () => {
      newCourseName.value = '';
      state.course = '';
      state.courseSelected = false; // Reset selection state when cleared
      courseClearBtn.style.display = 'none';
      courseSuggestions.style.display = 'none';
      
      // Show popular courses if school is selected
      if (state.schoolId) {
        showPopularCourses(state.school);
      }
      
      updateAddCourseButton();
      newCourseName.focus();
    });

    newCourseName.addEventListener('input', ()=>{
      state.course = newCourseName.value.trim();
      state.courseSelected = false; // Reset selection state when user types
      
      // Show/hide clear button based on content
      if (newCourseName.value.trim()) {
        courseClearBtn.style.display = 'flex';
      } else {
        courseClearBtn.style.display = 'none';
      }
      
      updateAddCourseButton();
      updateCourse();
    });
    
    newCourseName.addEventListener('focus', ()=>{
      // Show popular courses when focusing on empty input with selected school
      if (!newCourseName.value.trim() && state.schoolId) {
        showPopularCourses(state.school);
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
          // Add the new course to the currentCourses list if not already present
          if (!currentCourses.includes(state.course)) {
            currentCourses.push(state.course);
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
  function toTitleCase(str){ 
    return String(str||'').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Events
  backBtn.addEventListener('click', prev);
  render();
})();


