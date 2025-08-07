# Progress Bar Component

A reusable progress bar component with counters that can be used across all question screens.

## Files

- `progress-bar.css` - The reusable component styles
- `PROGRESS-BAR-README.md` - This documentation

## Usage

### 1. Import the component

Add this line to your HTML file's `<head>` section:

```html
<link rel="stylesheet" href="progress-bar.css">
```

### 2. Use the HTML structure

```html
<div class="progress-info">
    <div class="progress-bar">
        <div class="progress-number" id="currentQuestion">1</div>
        <div class="progress-fill" id="progressFill"></div>
        <div class="progress-total" id="totalQuestions">10</div>
    </div>
</div>
```

### 3. Update progress via JavaScript

```javascript
const progressFill = document.getElementById('progressFill');
const currentQuestion = document.getElementById('currentQuestion');
const totalQuestions = document.getElementById('totalQuestions');

// Update progress
const progress = (current / total) * 100;
progressFill.style.width = `${progress}%`;
currentQuestion.textContent = current;
totalQuestions.textContent = total;
```

## Features

- **Full Width**: Progress bar spans the full width of the container
- **Counters**: Left and right counters show current/total progress
- **Responsive**: Works on all screen sizes
- **Smooth Animation**: Progress fill animates smoothly
- **Consistent Styling**: Matches the app's design system

## Styling

The component includes:
- Progress bar with rounded corners
- Green progress fill
- Left counter (current question)
- Right counter (total questions)
- Proper spacing and positioning

## Current Implementation

This component is now used by:
- ✅ Regular study screens (`study.html`)
- ✅ Diagnostic Test 1 (`diagnostic-1.html`)
- ✅ Diagnostic Test 2 (`diagnostic-2.html`)
- ✅ Diagnostic Test 3 (`diagnostic-3.html`)

## Future Updates

To update the progress bar styling across all screens, simply modify `progress-bar.css`. All screens will automatically inherit the changes. 