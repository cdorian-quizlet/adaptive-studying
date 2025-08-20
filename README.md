# Study App - Development Documentation

## Project Overview
A mobile-first study application with adaptive question flow, featuring a home screen and interactive study sessions. The app includes progress tracking, feedback systems, and a modern UI design.

## File Structure
```
study-app/
├── index.html          # Home screen
├── study.html          # Study session screen
├── styles.css          # Home screen styles
├── study-styles.css    # Study screen styles
├── script.js           # Home screen functionality
├── study.js            # Study session functionality
└── images/             # Image assets
    ├── penguin.png
    ├── quizlet-plus.png
    ├── thumbnails.png
    └── home-gradient.png
```

## Home Screen Features

### Visual Design
- **Color Scheme**: Light theme with white background (#ffffff)
- **Typography**: Figtree font family with semibold (600) weight
- **Layout**: Mobile-first design with max-width 414px container

### Header Section
- **Status Bar**: Time display with network/battery icons
- **Search Bar**: 
  - Pill-shaped design matching avatar height
  - 1px stroke border (#D8E5F8)
  - Search text and icon color: #586380
  - 60px top padding from screen edge
  - 48px padding between search and "Jump back in" section

### Jump Back In Section
- **Title**: "Jump back in" in #282E3E color
- **Progress Card**:
  - Shadow: `box-shadow: var(--shadow-offset-none, 0) var(--shadow-offset-medium, 4px) var(--shadow-blur-large, 32px) var(--shadow-spread-none, 0) var(--color-other-shadow, rgba(40, 46, 62, 0.10))`
  - Progress bar: #18AE79 (filled), #EDEFF4 (empty), 16px height
  - Continue button: Pill-shaped, #4255FF background
- **48px padding** between "Jump back in" and "Recents" sections

### Studying Something New Section
- **Title**: "Studying something new?"
- **Layout**: 2x2 grid of pill-shaped buttons
- **Button Styling**:
  - `border-radius: var(--radius-full, 200px)`
  - `background: var(--interactive-bg-secondary-default, #EDEFFF)`
  - Blue text (#4255FF)
  - 16px semibold font
- **Options**:
  - Make a study plan
  - Cram for a test
  - Quickly review
  - Memorize terms

### Recents Section
- **Title**: "Recents" in #282E3E color
- **Cards**: White background with hover state #F6F7FB
- **Thumbnails**: Using thumbnails.png image
- **Tight spacing** between title and metadata

### Bottom Navigation
- **Active state**: #4255FF color for text and icons
- **Inactive state**: #586380 color
- **Icons**: Material Icons Round and Material Symbols Rounded
- **Items**: Home, Create, Library, Free trial (with quizlet-plus.png)

### Icons and Assets
- **Material Icons**: 32x32px size
- **Profile Avatar**: penguin.png with proper sizing
- **Q+ Icon**: quizlet-plus.png with #586380 color
- **Home/Library Icons**: Material Symbols Rounded with proper font-variation-settings

### Interactive Elements
- **Focus States**: Applied to parent containers to prevent content shift
- **Search Focus**: Removes blue square, highlights pill shape only
- **Haptic Feedback**: 10ms vibration on mobile devices
- **Toast Notifications**: Positioned at bottom 100px

### Debug Features
- **Bottom Sheet**: Triggered by more options (three dots) button
- **Reset Progress**: Clears localStorage and resets progress to 0%
- **Accessibility**: ARIA labels and proper focus management

## Study Screen Features

### Header Design
- **Layout**: Two-row structure
  - Top row: Close (X) and Settings icons
  - Bottom row: Progress bar with pill indicators
- **No border** on header (removed grey underline)

### Progress Bar
- **Track**: Light gray (#EDEFF4), 6px height, rounded ends
- **Fill**: Green (#18AE79) with smooth transitions
- **Left Pill (Current)**:
  - Light mint green background (#C8F7E2)
  - Dark gray text (#282E3E)
  - 4px 20px padding, 12px border-radius
  - Positioned with 8px gap from progress bar
- **Right Pill (Total)**:
  - Light gray background (#EDEFF4)
  - Dark gray text (#282E3E)
  - Same padding and styling as left pill

### Question Layout
- **Text Alignment**: All text left-aligned
- **Question Text**: 28px semibold, #282E3E color
- **Question Prompt**: 16px, #586380 color, 12px margin above answers
- **Answer Options**: 320px max-width, 20px gap between buttons

### Answer Feedback System
- **Inline Feedback**: Shows on same screen as question (no separate screen)
- **Correct Answer**:
  - White background (#FFFFFF)
  - 2px dashed green border (#12815A)
  - Green checkmark icon with proper vertical alignment
  - "Excellent!" feedback text in green (#12815A)
  - Auto-advance after 1.5 seconds
- **Incorrect Answer**:
  - White background
  - 2px solid orange border (#FFC38C)
  - Orange X icon with proper vertical alignment
  - "No worries, learning is a process!" feedback text in orange
  - Manual continue button appears after 2 seconds
- **Icon Alignment**:
  - Correct icon: `top: -2px` (slightly higher)
  - Incorrect icon: `top: 1px` (slightly lower)
  - Both use `vertical-align: middle`, `display: inline-block`, `line-height: 1`

### Answer Button Styling
- **Default**: White background, 1px solid #EDEFF4 border, 12px border-radius
- **Padding**: 20px 24px
- **Typography**: 16px semibold, left-aligned text
- **Hover**: Subtle background change and transform effects

### Adaptive Question Flow
- **Question Types**: Multiple choice, text input, true/false
- **Difficulty Adaptation**:
  - Correct answer → harder question type next time
  - Incorrect answer → easier question type next time
- **Progress Tracking**: 7 questions per session
- **State Management**: Tracks attempts, correct answers, and difficulty levels

### Navigation
- **Close Button**: Confirms before ending session
- **Settings Button**: Placeholder for future functionality
- **Auto-advance**: For correct answers only
- **Manual Continue**: For incorrect answers

## Technical Implementation

### CSS Custom Properties
- Uses design system variables for consistency
- Fallback values for cross-browser compatibility
- Modular styling approach

### JavaScript Features
- **Event Handling**: Comprehensive click and keyboard support
- **State Management**: Question progression and difficulty adaptation
- **Local Storage**: Progress persistence and reset functionality
- **Performance**: Debounced scroll events and optimized animations
- **Accessibility**: ARIA labels, keyboard navigation, focus management

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: 768px and 1024px for larger screens
- **Touch Support**: Gesture recognition and haptic feedback

### Browser Support
- **Modern CSS**: Flexbox, Grid, CSS custom properties
- **Progressive Enhancement**: Graceful degradation for older browsers
- **PWA Ready**: Service worker registration included

## Development Notes

### Key Design Decisions
1. **Inline Feedback**: Eliminates screen transitions for better UX
2. **Adaptive Difficulty**: Personalized learning experience
3. **Consistent Spacing**: 8px, 12px, 16px, 20px, 24px, 32px, 48px system
4. **Color Consistency**: Design system colors throughout
5. **Icon Alignment**: Precise positioning for visual harmony

### Performance Considerations
- **Image Optimization**: Proper sizing and loading
- **CSS Efficiency**: Minimal reflows and repaints
- **JavaScript**: Debounced events and efficient DOM manipulation
- **Animations**: Hardware-accelerated transforms

### Accessibility Features
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color combinations

### Future Enhancements
- **Settings Panel**: Additional configuration options
- **Progress Analytics**: Detailed performance tracking
- **Offline Support**: Enhanced PWA capabilities
- **Multi-language**: Internationalization support
- **Advanced Animations**: Micro-interactions and transitions

## Installation and Setup

1. **Clone Repository**: Download all files to local directory
2. **Serve Files**: Use local server (e.g., `python -m http.server 8000`)
3. **Open Browser**: Navigate to `index.html`
4. **Test Features**: Verify all interactions and responsive behavior

## Browser Compatibility
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## Contributing
- Follow existing code style and patterns
- Test on multiple devices and browsers
- Maintain accessibility standards
- Update documentation for new features 

## Progress Bar Component

A reusable progress bar component with counters that can be used across all question screens.

### Files

- `css/components/progress-bar.css` — The reusable component styles

### Usage

#### 1. Import the component

Add this line to your HTML file's `<head>` section:

```html
<link rel="stylesheet" href="css/components/progress-bar.css">
```

#### 2. Use the HTML structure

```html
<div class="progress-bar">
  <div class="progress-fill" id="progressFill"></div>
  <div class="progress-counter" id="progressCounter">
    <span id="currentQuestion">1</span>
  </div>
</div>
```

#### 3. Update progress via JavaScript

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

### Features

- **Full Width**: Progress bar spans the full width of the container
- **Counters**: Left and right counters show current/total progress
- **Responsive**: Works on all screen sizes
- **Smooth Animation**: Progress fill animates smoothly
- **Consistent Styling**: Matches the app's design system

### Styling

The component includes:
- Progress bar with rounded corners
- Green progress fill
- Left counter (current question)
- Right counter (total questions)
- Proper spacing and positioning

### Current Implementation

This component is now used by:
- ✅ Regular study screens (`html/study.html`)
- ✅ Diagnostic Test 1 (`html/diagnostic-1.html`)
- ✅ Diagnostic Test 2 (`html/diagnostic-2.html`)
- ✅ Diagnostic Test 3 (`html/diagnostic-3.html`)

### Future Updates

To update the progress bar styling across all screens, modify `css/components/progress-bar.css`. All screens will automatically inherit the changes.