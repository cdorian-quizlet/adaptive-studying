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

// Expose on window for non-module scripts
window.QuizletApi = {
  getSubjects,
  getFlashcardsBySubject,
  getFlashcardsBySubjectAndSubcategory,
  searchFlashcards,
  mapApiCardsToQuestions,
};

