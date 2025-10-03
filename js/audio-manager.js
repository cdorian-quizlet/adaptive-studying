// Audio Manager for Design System
// Centralized audio playback system for UI interactions

class AudioManager {
    constructor() {
        this.audioCache = new Map();
        this.isMuted = localStorage.getItem('audioMuted') === 'true';
        this.volume = parseFloat(localStorage.getItem('audioVolume')) || 0.7;
        this.audioMode = localStorage.getItem('debugAudioMode') || 'single'; // 'single' or 'build'
    }

    // Preload audio files for better performance
    preload(soundName, filePath) {
        if (!this.audioCache.has(soundName)) {
            const audio = new Audio(filePath);
            audio.volume = this.volume;
            audio.preload = 'auto';
            this.audioCache.set(soundName, audio);
        }
    }

    // Play a sound by name
    play(soundName) {
        if (this.isMuted) {
            console.log(`🔇 Audio muted, skipping: ${soundName}`);
            return;
        }
        
        const audio = this.audioCache.get(soundName);
        if (audio) {
            // Reset to beginning and play
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.warn(`🚫 Could not play audio "${soundName}":`, error.message);
            });
        } else {
            console.warn(`🚫 Audio not found: ${soundName}. Available sounds:`, Array.from(this.audioCache.keys()));
        }
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('audioVolume', this.volume.toString());
        
        // Update volume for all cached audio
        this.audioCache.forEach(audio => {
            audio.volume = this.volume;
        });
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('audioMuted', this.isMuted.toString());
        return this.isMuted;
    }

    // Initialize common UI sounds
    initializeUISounds() {
        // Streak-based correct answer sounds (build mode)
        this.preload('correct1', '../audio/correct-1.wav');
        this.preload('correct2', '../audio/correct-2.wav');
        this.preload('correct3', '../audio/correct-3.wav');
        this.preload('correct4', '../audio/correct-4.wav');
        this.preload('correct5', '../audio/correct-5.wav');
        
        // Single correct answer sounds (single mode)
        this.preload('correctSingle', '../audio/correct-short.mp3');
        this.preload('correctLong', '../audio/correct-long.mp3');
        
        // Other sounds
        this.preload('progressLoop', '../audio/progress-loop.mp3');
        
        // Commented out until files are added:
        // this.preload('buttonClick', '../audio/button-click.mp3');
        // this.preload('success', '../audio/success.mp3');
        // this.preload('error', '../audio/error.mp3');
        // this.preload('roundComplete', '../audio/round-complete.mp3');
        // this.preload('levelUp', '../audio/level-up.mp3');
        // this.preload('incorrectAnswer', '../audio/incorrect-answer.mp3');
    }

    // Set audio mode for correct answers
    setAudioMode(mode) {
        if (mode === 'single' || mode === 'build') {
            this.audioMode = mode;
            localStorage.setItem('debugAudioMode', mode);
            console.log(`🎵 Audio mode set to: ${mode}`);
        } else {
            console.warn(`🚫 Invalid audio mode: ${mode}. Use 'single' or 'build'.`);
        }
    }

    // Get current audio mode
    getAudioMode() {
        return this.audioMode;
    }

    // Play correct answer audio based on current mode
    playCorrectAnswer(streak = 1, isLastQuestion = false) {
        if (this.audioMode === 'single') {
            // In single mode, use correct-long.mp3 for the last question, correct-short.mp3 for others
            if (isLastQuestion) {
                this.play('correctLong');
            } else {
                this.play('correctSingle');
            }
        } else {
            // Build mode - use streak-based audio (capped at 5)
            const audioStreak = Math.min(streak, 5);
            const audioKey = `correct${audioStreak}`;
            this.play(audioKey);
        }
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    audioManager.initializeUISounds();
});

// Export for use in other files
if (typeof window !== 'undefined') {
    window.audioManager = audioManager;
}

// Example usage:
// audioManager.play('buttonClick');
// audioManager.play('success');
// audioManager.setVolume(0.5);
// audioManager.toggleMute();
