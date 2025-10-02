// Simple API client for Quizlet Demo API
// Base URL
const QUIZLET_API_BASE = 'https://us-central1-quizlet-demo-api.cloudfunctions.net';

function buildUrl(path, params = {}) {
  const url = new URL(path, QUIZLET_API_BASE + '/');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function apiGet(url) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`API request failed (${resp.status}): ${text || resp.statusText}`);
    }
    return resp.json();
  } catch (error) {
    // Handle network errors, CORS errors, etc.
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to API');
    }
    throw error;
  }
}

async function getSubjects() {
  const url = buildUrl('subjects');
  return apiGet(url);
}

async function getFlashcardsBySubject(subject) {
  const url = buildUrl('getSubject', { subject });
  return apiGet(url);
}

async function getFlashcardsBySubjectAndSubcategory(subject, subcategory) {
  const url = buildUrl('getSubcategory', { subject, subcategory });
  return apiGet(url);
}

async function searchFlashcards(query) {
  const url = buildUrl('search', { q: query });
  return apiGet(url);
}

// New API endpoints for course management
async function getCourses() {
  const url = buildUrl('courses');
  return apiGet(url);
}

async function getCourseById(courseId) {
  const url = buildUrl('courses', { id: courseId });
  return apiGet(url);
}

async function getCoursesBySubject(subject) {
  const url = buildUrl('courses', { subject });
  return apiGet(url);
}

async function getUserCourses(userId) {
  const url = buildUrl('user-courses', { userId });
  return apiGet(url);
}

async function setCurrentCourse(courseId) {
  // Save to localStorage for persistence (avoid external API calls)
  try {
    localStorage.setItem('currentCourseId', courseId);
    localStorage.setItem('currentCourseTimestamp', Date.now().toString());
    
    // Use onboarding data instead of making API calls
    const courseName = localStorage.getItem('onboarding_course');
    const schoolName = localStorage.getItem('onboarding_school');
    
    if (courseName) {
      const courseDetails = {
        id: courseId,
        name: courseName,
        school: schoolName,
        displayName: courseName,
        source: 'onboarding'
      };
      
      localStorage.setItem('currentCourseDetails', JSON.stringify(courseDetails));
      console.log('Set current course using onboarding data (no API call)');
      return courseDetails;
    }
    
    console.log('Course set but no details available');
    return null;
  } catch (error) {
    console.log('Error setting current course, continuing without it');
    return null;
  }
}

async function getCurrentCourse() {
  try {
    // Use onboarding data instead of making API calls to avoid CORS errors
    const courseName = localStorage.getItem('onboarding_course');
    const schoolName = localStorage.getItem('onboarding_school');
    
    if (courseName) {
      // Create a course object from onboarding data (no external API call needed)
      const courseObject = {
        id: 'onboarding-course',
        name: courseName,
        school: schoolName,
        displayName: courseName,
        source: 'onboarding'
      };
      
      console.log('Using onboarding course data (no API call):', courseObject.name);
      return courseObject;
    }
    
    // Fallback: check legacy localStorage but don't make API calls
    const cachedDetails = localStorage.getItem('currentCourseDetails');
    if (cachedDetails) {
      console.log('Using cached course details (no API call)');
      return JSON.parse(cachedDetails);
    }
    
    console.log('No course information available');
    return null;
  } catch (error) {
    console.log('Course info not available, continuing without it');
    return null;
  }
}

// Map unknown API card shape to internal question shape
function mapApiCardsToQuestions(cards) {
  if (!Array.isArray(cards)) return [];
  return cards.map((card, idx) => {
    const term = card.term || card.question || card.front || card.word || card.title || '';
    const definition = card.definition || card.answer || card.back || card.meaning || card.description || '';
    return {
      id: idx + 1,
      question: String(term || '').trim() || 'Untitled',
      correctAnswer: String(definition || '').trim(),
      options: [],
      difficulty: 'flashcard',
      attempts: 0,
      correct: 0,
      currentFormat: 'flashcard',
      subcategory: card.subcategory || card.topic || null,
      _raw: card
    };
  });
}

// Utility functions for course management
function formatCourseDisplay(course) {
  if (!course) return 'No Course Selected';
  
  // Handle different course object structures
  const courseCode = course.code || course.courseCode || course.subject || '';
  const courseName = course.name || course.title || course.courseName || '';
  const courseNumber = course.number || course.courseNumber || '';
  
  if (courseCode && courseNumber) {
    return `${courseCode} ${courseNumber}`;
  }
  if (courseCode && courseName) {
    return `${courseCode}: ${courseName}`;
  }
  if (courseName) {
    return courseName;
  }
  if (courseCode) {
    return courseCode;
  }
  
  return 'Unknown Course';
}

function getCachedCourseDisplay() {
  try {
    const cachedDetails = localStorage.getItem('currentCourseDetails');
    if (cachedDetails) {
      const course = JSON.parse(cachedDetails);
      return formatCourseDisplay(course);
    }
  } catch (error) {
    console.error('Error getting cached course display:', error);
  }
  return 'No Course Selected';
}

// Initialize course on page load
async function initializeCourse() {
  try {
    const currentCourse = await getCurrentCourse();
    if (currentCourse) {
      console.log('Current course loaded:', formatCourseDisplay(currentCourse));
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('courseLoaded', { 
        detail: { course: currentCourse } 
      }));
      
      return currentCourse;
    } else {
      console.warn('No current course found');
      return null;
    }
  } catch (error) {
    console.error('Error initializing course:', error);
    return null;
  }
}

// New hierarchical API endpoints
async function getSchools() {
  console.log('Fetching schools from API');
  const url = 'https://getschools-p3vlbtsdwa-uc.a.run.app';
  console.log('Schools API URL:', url);
  try {
    const response = await apiGet(url);
    console.log('getSchools API raw response:', response);
    return response;
  } catch (error) {
    console.error('getSchools API error:', error);
    throw error;
  }
}

async function getCoursesBySchool(schoolId, schoolName = null) {
  // Try with schoolId first, fallback to schoolName if needed
  let url;
  if (schoolId) {
    url = `https://getcoursesbyschool-p3vlbtsdwa-uc.a.run.app?schoolId=${encodeURIComponent(schoolId)}`;
  } else if (schoolName) {
    url = `https://getcoursesbyschool-p3vlbtsdwa-uc.a.run.app?schoolName=${encodeURIComponent(schoolName)}`;
  } else {
    throw new Error('Either schoolId or schoolName is required');
  }
  
  try {
    const response = await apiGet(url);
    return response;
  } catch (error) {
    console.error('getCoursesBySchool API error:', error);
    
    // If schoolId failed and we have schoolName, try with schoolName
    if (schoolId && schoolName && (error.message.includes('School ID') || error.message.includes('400'))) {
      try {
        const fallbackUrl = `https://getcoursesbyschool-p3vlbtsdwa-uc.a.run.app?schoolName=${encodeURIComponent(schoolName)}`;
        const fallbackResponse = await apiGet(fallbackUrl);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

async function getUnifiedContent(schoolName, courseName = null, goal = null, concept = null) {
  let url = `https://getunifiedcontent-p3vlbtsdwa-uc.a.run.app?schoolName=${encodeURIComponent(schoolName)}`;
  
  if (courseName) {
    url += `&courseName=${encodeURIComponent(courseName)}`;
  }
  if (goal) {
    url += `&goal=${encodeURIComponent(goal)}`;
  }
  if (concept) {
    url += `&concept=${encodeURIComponent(concept)}`;
  }
  
  return apiGet(url);
}

// Helper function to get goals for a specific school and course
async function getGoalsBySchoolAndCourse(schoolName, courseName) {
  return getUnifiedContent(schoolName, courseName);
}

// Helper function to get concepts for a specific school, course, and goal
async function getConceptsByGoal(schoolName, courseName, goal) {
  return getUnifiedContent(schoolName, courseName, goal);
}

// Helper function to get questions for a specific concept
async function getQuestionsByConcept(schoolName, courseName, goal, concept) {
  return getUnifiedContent(schoolName, courseName, goal, concept);
}

// Helper function to get question count for a specific concept without fetching all questions
async function getQuestionCountByConcept(schoolName, courseName, goal, concept) {
  try {
    const response = await getUnifiedContent(schoolName, courseName, goal, concept);
    const questions = response?.content?.questions || [];
    return questions.length;
  } catch (error) {
    console.warn('Error fetching question count for concept:', concept, error);
    return 0; // Return 0 if we can't get the count
  }
}

// Helper function to get question counts for multiple concepts
async function getQuestionCountsForConcepts(schoolName, courseName, goals, concepts) {
  const conceptCounts = {};
  
  for (const concept of concepts) {
    let totalQuestions = 0;
    
    // Sum questions across all goals for this concept
    for (const goal of goals) {
      const count = await getQuestionCountByConcept(schoolName, courseName, goal, concept);
      totalQuestions += count;
    }
    
    conceptCounts[concept] = totalQuestions;
    console.log(`Concept "${concept}" has ${totalQuestions} total questions across all goals`);
  }
  
  return conceptCounts;
}

// Expose on window for non-module scripts
window.QuizletApi = {
  // Original endpoints
  getSubjects,
  getFlashcardsBySubject,
  getFlashcardsBySubjectAndSubcategory,
  searchFlashcards,
  mapApiCardsToQuestions,
  
  // New course management endpoints
  getCourses,
  getCourseById,
  getCoursesBySubject,
  getUserCourses,
  setCurrentCourse,
  getCurrentCourse,
  
  // New hierarchical API endpoints
  getSchools,
  getCoursesBySchool,
  getUnifiedContent,
  getGoalsBySchoolAndCourse,
  getConceptsByGoal,
  getQuestionsByConcept,
  getQuestionCountByConcept,
  getQuestionCountsForConcepts,
  
  // Utility functions
  formatCourseDisplay,
  getCachedCourseDisplay,
  initializeCourse,
};

// Test functions for debugging course API
window.testCourseAPI = {
  async testGetCourses() {
    console.log('Testing getCourses...');
    try {
      const courses = await getCourses();
      console.log('Available courses:', courses);
      return courses;
    } catch (error) {
      console.error('getCourses failed:', error);
      return null;
    }
  },
  
  async testGetSchools() {
    console.log('Testing getSchools...');
    try {
      const schools = await getSchools();
      console.log('Available schools:', schools);
      return schools;
    } catch (error) {
      console.error('getSchools failed:', error);
      return null;
    }
  },
  
  async testGetCoursesBySchool(schoolId, schoolName = null) {
    console.log(`Testing getCoursesBySchool for ID: ${schoolId}, Name: ${schoolName}`);
    try {
      const courses = await getCoursesBySchool(schoolId, schoolName);
      console.log('Courses for school:', courses);
      return courses;
    } catch (error) {
      console.error('getCoursesBySchool failed:', error);
      return null;
    }
  },
  
  async testSetCourse(courseId) {
    console.log(`Testing setCurrentCourse with ID: ${courseId}`);
    try {
      const course = await setCurrentCourse(courseId);
      console.log('Course set successfully:', course);
      console.log('Display name:', formatCourseDisplay(course));
      return course;
    } catch (error) {
      console.error('setCurrentCourse failed:', error);
      return null;
    }
  },
  
  async testGetCurrentCourse() {
    console.log('Testing getCurrentCourse...');
    try {
      const course = await getCurrentCourse();
      console.log('Current course:', course);
      console.log('Display name:', formatCourseDisplay(course));
      return course;
    } catch (error) {
      console.error('getCurrentCourse failed:', error);
      return null;
    }
  },
  
  testCachedDisplay() {
    console.log('Testing cached course display...');
    const display = getCachedCourseDisplay();
    console.log('Cached display:', display);
    return display;
  }
};

// Auto-initialize course when API loads - DISABLED FOR LOCAL TESTING
// Commented out to prevent CORS errors during local development
/*
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCourse);
  } else {
    // DOM already loaded
    setTimeout(initializeCourse, 100);
  }
}
*/

