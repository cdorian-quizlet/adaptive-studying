# File Upload Feature Documentation

## Overview
The AI Coach now supports file and photo uploads, allowing users to create flashcard sets from their study materials (notes, images, documents).

## User Flow

### 1. Initiate Upload
- User clicks the "+" button in the AI input area
- A bottom sheet appears with two options:
  - **Upload a photo** - Opens camera/photo gallery
  - **Select a file** - Opens file picker for documents

### 2. File Selection
- **Images**: Accepts all image formats (.jpg, .png, .gif, etc.)
- **Documents**: Accepts .pdf, .doc, .docx, .txt, .ppt, .pptx

### 3. Preview State
After selecting a file, an attachment preview appears above the input:
- **Image preview**: Thumbnail of the uploaded image
- **Document preview**: Document icon with filename
- Shows file size and name
- Includes a remove button (X) to clear the attachment

### 4. Submit to AI
- User can add a message along with the file (optional)
- Click the submit button to send
- File is uploaded to the AI Coach for analysis

### 5. AI Response
The AI will:
- Analyze the uploaded content
- Offer to create flashcard sets from the material
- Generate study materials based on the uploaded content

## Implementation Details

### Frontend Components

#### HTML (ai-coach.html)
- Upload bottom sheet with two action buttons
- Hidden file input elements for photo and document selection
- Attachment preview row in the input container

#### CSS (ai-coach-styles.css)
- `.input-row-attachments` - Container for attachment previews
- `.attachment-preview` - Preview card styling
- `.attachment-icon` - File icon or image thumbnail
- `.attachment-info` - File name and size display
- `.attachment-remove` - Remove button styling

#### JavaScript (ai-coach.js)
Key functions:
- `showUploadSheet()` - Displays the upload bottom sheet
- `hideUploadSheet()` - Closes the upload bottom sheet
- `handleFileSelected(file, type)` - Processes selected files
- `displayAttachmentPreview()` - Shows file preview in input
- `removeAttachment()` - Clears the attachment
- `formatFileSize(bytes)` - Formats file size for display

State management:
- `currentAttachment` - Stores the current file object with metadata

### Backend API (ai-coach-endpoint.js)

#### Dependencies
- **multer**: Handles multipart/form-data file uploads
- Configured with memory storage (10MB limit)

#### Upload Handling
The `/api/ai-coach` endpoint now accepts:
- Regular JSON requests (for text-only messages)
- FormData requests (for file uploads)

#### File Processing
- **Images**: Converted to base64 and sent to OpenAI's vision API
- **Documents**: Metadata sent to AI with acknowledgment prompt

## Installation

### Update Backend Dependencies
```bash
cd api
npm install multer
```

The package.json has been updated to include multer as a dependency.

## Usage Example

### Example 1: Upload Photo of Notes
1. User clicks "+" button
2. Selects "Upload a photo"
3. Chooses a photo of handwritten notes
4. Adds message: "Create flashcards from these notes"
5. AI analyzes the image and offers to generate flashcards

### Example 2: Upload Study Document
1. User clicks "+" button
2. Selects "Select a file"
3. Chooses a PDF study guide
4. AI acknowledges the file and offers to create study materials

## Future Enhancements
- PDF text extraction for better content analysis
- Multiple file uploads
- Drag-and-drop file upload
- File preview before sending
- OCR for handwritten notes

