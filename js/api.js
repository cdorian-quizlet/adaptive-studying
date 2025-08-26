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
  // Save to localStorage for persistence
  try {
    localStorage.setItem('currentCourseId', courseId);
    localStorage.setItem('currentCourseTimestamp', Date.now().toString());
    
    // Also fetch and cache course details
    const courseDetails = await getCourseById(courseId);
    if (courseDetails) {
      localStorage.setItem('currentCourseDetails', JSON.stringify(courseDetails));
    }
    
    return courseDetails;
  } catch (error) {
    console.error('Error setting current course:', error);
    throw error;
  }
}

async function getCurrentCourse() {
  try {
    // Check localStorage first
    const courseId = localStorage.getItem('currentCourseId');
    const cachedDetails = localStorage.getItem('currentCourseDetails');
    const timestamp = localStorage.getItem('currentCourseTimestamp');
    
    // Use cached data if it's less than 1 hour old
    if (courseId && cachedDetails && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < 3600000) { // 1 hour in milliseconds
        return JSON.parse(cachedDetails);
      }
    }
    
    // If no cached data or expired, try to fetch fresh data
    if (courseId) {
      const courseDetails = await getCourseById(courseId);
      if (courseDetails) {
        localStorage.setItem('currentCourseDetails', JSON.stringify(courseDetails));
        localStorage.setItem('currentCourseTimestamp', Date.now().toString());
        return courseDetails;
      }
    }
    
    // Fallback: try to get user's first enrolled course
    const userCourses = await getUserCourses('current'); // 'current' as default user
    if (userCourses && userCourses.length > 0) {
      return await setCurrentCourse(userCourses[0].id);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current course:', error);
    // Return cached data even if expired, as fallback
    const cachedDetails = localStorage.getItem('currentCourseDetails');
    return cachedDetails ? JSON.parse(cachedDetails) : null;
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

// Auto-initialize course when API loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCourse);
  } else {
    // DOM already loaded
    setTimeout(initializeCourse, 100);
  }
}

