#Android Download Manager Clone
A web-based clone of Internet Download Manager (IDM) designed for Android phones, focusing on media extraction from web pages.

Features

🎯 Core Functionality
URL-based Media Scanning: Enter any webpage URL to find downloadable media
Deep Crawling: Advanced search through linked pages for hidden media
Multi-format Support: Videos, images, and audio files
Smart Detection: AI-powered media extraction using ZAI SDK

📱 Android-style Interface
Material Design: Clean, modern UI with Android-inspired aesthetics
Responsive Layout: Works perfectly on mobile and desktop
Tabbed Navigation: Organized sections for Scanner, Downloads, and Library
Progress Tracking: Real-time download progress with speed indicators

⚡ Advanced Features
Batch Downloads: Select multiple files for simultaneous downloading
Media Preview: Preview files before downloading
Download Management: Pause, resume, and manage downloads
Media Library: Organized view of completed downloads
Smart Filtering: Automatic categorization by media type

🔍 Scanning Options
Quick Scan: Fast surface-level media detection
Deep Scan: Comprehensive crawling through:
Internal links and subpages
External media platforms
CDN and streaming URLs
Embedded players and galleries

Technology Stack
Frontend: Next.js 15 with TypeScript
UI Components: shadcn/ui with Tailwind CSS
AI Integration: ZAI Web Dev SDK for intelligent media extraction
Web Search: Advanced search capabilities for media discovery
State Management: React hooks with local state

How to Use
Enter a URL: Paste any webpage URL in the scanner
Choose Scan Type:
Use "Scan" for quick results
Use "Deep Scan" for comprehensive search
Review Found Media: Browse through discovered media files
Select & Download: Choose individual files or batch download
Manage Downloads: Monitor progress in the Downloads tab
Access Library: View completed downloads in the Library tab

API Endpoints
POST /api/scan-media - Quick media scanning
POST /api/deep-scan - Comprehensive media crawling
POST /api/download - Initiate downloads
GET /api/download - Get download status

Key Features
Media Detection
Video files (MP4, WebM, AVI, MOV)
Image files (JPG, PNG, GIF, WebP)
Audio files (MP3, WAV, OGG)
Streaming URLs and playlists
CDN-hosted media assets
Download Management
Real-time progress tracking
Pause/resume functionality
Speed monitoring
Error handling
Queue management
User Experience
Android-style design language
Smooth animations and transitions
Intuitive navigation
Responsive touch targets
Accessibility support
Development
bash

Line Wrapping

1 npm run dev      # Start development server
2 npm run lint     # Check code quality
3 npm run build    # Build for production
Note
This is a demonstration project that simulates download functionality. In a production environment, actual file downloading would require server-side storage and proper file handling infrastructure.
