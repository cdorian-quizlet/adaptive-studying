# Audio Assets

This directory contains audio files for UI interactions and feedback.

## File Naming Convention
Use descriptive, kebab-case names:
- `button-click.mp3` - Standard button press sound
- `success.mp3` - Success/completion sounds
- `error.mp3` - Error/failure sounds
- `round-complete.mp3` - Round completion celebration
- `level-up.mp3` - Progress advancement sounds

## Usage
Reference these files in your JavaScript using:
```javascript
const audio = new Audio('../audio/button-click.mp3');
audio.play();
```

## Format
All audio files should be in MP3 format for maximum browser compatibility.
