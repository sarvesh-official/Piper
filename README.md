# Piper

Piper is an AI-powered document assistant. Upload documents (PDF, DOCX, TXT), then chat with them, search across them, and generate structured courses and quizzes from the content.

## What it does

- **Chat with documents** — upload a file, ask questions, get answers grounded in the document's content via retrieval over embeddings
- **Semantic search** — document chunks are embedded (Google Gemini embeddings) and stored in Pinecone, so queries retrieve relevant passages rather than keyword-matching
- **Course & quiz generation** — generate structured learning paths and quizzes from a topic or from uploaded material
- **Multi-model LLM support** — Gemini and Groq-backed models behind a provider layer

## Tech stack

- **Frontend:** Next.js, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express (TypeScript)
- **Auth:** Clerk
- **Database:** MongoDB
- **Vector store:** Pinecone
- **File storage:** AWS S3
- **LLMs:** Google Gemini, Groq

## Repo layout

```
backend/   Express API (TypeScript) — routes, controllers, services
client/    Next.js frontend
```

## Setup

**Prerequisites:** Node.js 18+, npm, a MongoDB instance, and accounts for Clerk, AWS (S3), Pinecone, Google AI (Gemini), and Groq.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # or create .env manually
npm run dev
```

`backend/.env` needs:

```
PORT=5000
MONGO_URI=<mongodb connection string>
CLERK_PUBLIC_KEY=...
CLERK_SECRET_KEY=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
PINECONE_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_EMBEDDING_MODEL=...
GROQ_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env.local   # or create .env.local manually
npm run dev
```

`client/.env.local` needs:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## How it works

1. Uploads land in S3; the backend extracts text (Tesseract OCR for scanned/image docs) and chunks it.
2. Chunks are embedded with Gemini's embedding model and written to Pinecone.
3. Chat queries are embedded, matched against Pinecone, and the retrieved passages are passed to the LLM (Gemini or Groq) to produce grounded answers.
4. Courses, quizzes, and roadmaps are generated through dedicated service modules that compose prompts over retrieved content.

## License

MIT
