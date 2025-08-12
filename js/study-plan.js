// Directly reuse the existing implementation to keep colors/animations intact
// by loading the original module and wiring missing hooks if needed.
document.addEventListener('DOMContentLoaded', function(){
  try {
    // Ensure back button works even if script load order changes
    const backBtn = document.getElementById('backBtn');
    if (backBtn && !backBtn._handler) {
      backBtn.addEventListener('click', function(){ window.location.href = '../index.html'; });
      backBtn._handler = true;
    }
  } catch(e) {}
  const s = document.createElement('script');
  s.src = '../js/study-path.js';
  document.body.appendChild(s);
});

