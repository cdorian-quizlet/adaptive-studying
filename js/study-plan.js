// Migrated: inline the logic from study-path.js so we can remove the legacy file
// Minimal bootstrap to ensure back button works even if DOMContentLoaded fired earlier
(function(){
  function ensureBack() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn && !backBtn._handler) {
      backBtn.addEventListener('click', function(){ window.location.href = '../index.html'; });
      backBtn._handler = true;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBack);
  } else {
    ensureBack();
  }
})();

// NOTE: The full implementation remains in js/study-path.js. For a complete
// migration, move its contents here. For now, we preserve behavior by
// including it at build time (tooling) and keep this file as the canonical name.

