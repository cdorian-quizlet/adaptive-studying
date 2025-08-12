// Wrapper that loads the old study-path.js for compatibility
document.addEventListener('DOMContentLoaded', function(){
  const s = document.createElement('script');
  s.src = '../js/study-path.js';
  document.body.appendChild(s);
});

