# Audizor

Audizor is an AI-powered audio and video transcription platform that provides accurate transcription services with an intuitive interface for managing, reviewing, and interacting with transcribed content.

![Audizor Logo](/public/placeholder-logo.svg)

## Features

### 🎙️ Smart Transcription
- Upload audio and video files for AI-powered transcription
- Support for multiple file formats (MP3, WAV, MP4, MOV, etc.)
- 99%+ accuracy in multiple languages
- Speaker diarization (speaker identification)

### 📂 File Management
- Intuitive dashboard for media organization
- Create folders and subfolders
- Sort and filter by date, name, size, type
- Grid and list view options
- Track processing status

### 🎧 Interactive Player
- Synchronized transcript that highlights text as audio/video plays
- Click on transcript segments to jump to specific audio positions
- Time-stamped and speaker-labeled segments
- Copy transcripts to clipboard

### 💬 AI-Powered Chat
- Ask questions about your transcripts
- Get AI-generated answers based on content
- Natural language interaction with your media

### 🔒 Security & Privacy
- Secure user authentication
- Private file storage
- Data encryption

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Authentication/Database**: Supabase
- **Storage**: Google Cloud Storage
- **UI/Frontend**:
  - React 18+
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **API Pattern**: Server Actions for data operations

## Getting Started

### Prerequisites
- Node.js (compatible with Next.js 14+)
- npm or yarn
- Supabase account
- Google Cloud Storage bucket

### Environment Variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_CLOUD_CREDENTIALS=your_gcp_credentials_json
GOOGLE_CLOUD_STORAGE_BUCKET=your_storage_bucket_name
NEXT_PUBLIC_PRODUCTION_URL=your_production_url
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/audizor-front.git
cd audizor-front
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npx jest path/to/file.test.ts` - Run specific test file

## Project Structure

```
audizor-front/
├── app/                 # Next.js App Router
│   ├── api/             # API endpoints
│   ├── dashboard/       # Dashboard pages
│   ├── login/           # Authentication pages
│   └── register/        # User registration
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Custom components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── auth.ts          # Authentication utilities
│   ├── supabase.ts      # Supabase configuration
│   └── ...              # Other utilities
├── public/              # Static assets
└── styles/              # Global styles
```

## Authentication Flow

Authentication is handled through Supabase with email/password login flow:

1. User enters credentials on login page
2. Credentials are verified with Supabase
3. Session is established
4. Protected routes are secured via middleware

## File Processing Workflow

1. User uploads audio/video file from dashboard
2. File is stored in Google Cloud Storage
3. Backend processing converts media to transcript
4. Transcript is stored and linked to the media file
5. User can view and interact with the transcript
6. Chat interface is enabled for transcript queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/your-username/audizor-front](https://github.com/your-username/audizor-front)