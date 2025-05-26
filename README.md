# Thought Dump - Anonymous Discussion Platform

A minimalist, anonymous discussion platform inspired by eksisozluk.com. Built for raw, unfiltered thoughts organized by topic with community-driven curation.

## 🚀 Tech Stack

### Frontend
- **React** with Vite
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Router** for navigation
- **Zustand** for state management

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** for optional authentication
- **CORS** for cross-origin requests

### Deployment
- **Vercel** (Frontend)
- **Railway/Render** (Backend + Database)

## 🏗️ Project Structure

```
thought-dump/
├── frontend/          # React application
├── backend/           # Node.js API server
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```

## 🎯 Core Features

- **Anonymous Posting**: No registration required
- **Topic-based Organization**: Browse content by topics
- **Community Curation**: Upvote/downvote system
- **Dual Feeds**: Chronological and trending views
- **Clean UI**: Distraction-free, text-first interface
- **Admin Panel**: Basic moderation tools
- **Scalable Architecture**: Modular frontend/backend separation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📱 Features Overview

### MVP Features
- [x] Anonymous text posting
- [x] Topic-based browsing (`/topics/:slug`)
- [x] Upvote/downvote system
- [x] Chronological feed
- [x] Trending feed (based on votes)
- [x] Post submission form
- [x] Basic admin moderation
- [x] Responsive design

### Future Enhancements
- [ ] User accounts (optional)
- [ ] Advanced moderation tools
- [ ] Search functionality
- [ ] Comment threading
- [ ] Rich text editor
- [ ] Mobile app

## 🎨 Design Philosophy

- **Text-first**: Focus on content, not distractions
- **Anonymous by default**: Encourage honest discussion
- **Community-driven**: Let the best content rise naturally
- **Minimalist**: Clean, fast, and accessible interface
- **Scalable**: Built to handle growth from day one

## 🔧 Development

### Environment Variables
See `.env.example` files in both frontend and backend directories.

### Database Schema
The application uses PostgreSQL with Prisma ORM. Key entities:
- Posts
- Topics
- Votes
- Admin users (for moderation)

### API Endpoints
- `GET /api/posts` - Fetch posts with filtering
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/vote` - Vote on post
- `GET /api/topics` - List all topics
- `GET /api/topics/:slug/posts` - Posts by topic

## 📄 License

MIT License - see LICENSE file for details. 