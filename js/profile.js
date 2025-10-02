// Profile Screen JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Close profile button
    const closeButton = document.getElementById('closeProfile');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            // Add fade out animation
            document.body.classList.add('page-fade-out');
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 250);
        });
    }

    // Settings button
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            // Placeholder for settings functionality
            console.log('Settings clicked');
            // TODO: Navigate to settings page when created
        });
    }

    // Add click animations to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add subtle click feedback
            this.style.transform = 'translateY(-1px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-1px)';
            }, 150);
        });
    });

    // Add click animations to leaderboard items
    const leaderboardItems = document.querySelectorAll('.leaderboard-item');
    leaderboardItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add subtle click feedback
            this.style.transform = 'translateY(-1px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-1px)';
            }, 150);
        });
    });

    // Fade in animation on load
    setTimeout(() => {
        document.body.classList.remove('page-fade-out');
    }, 100);
});
