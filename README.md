# ⚡ IntelliMail — AI-Powered Intelligent Email Assistant

> Modern, full-stack AI email client that seamlessly connects with Gmail via Google OAuth 2.0 to summarize threads, draft context-aware replies with customizable tones, extract action items & deadlines, detect priority, explain complex messages in plain English, and accelerate email productivity 10x.

---

## 🌟 Key Features

### 📬 Gmail & Inbox Management
- **Official Google OAuth 2.0**: Secure authentication directly with official Google permissions. Passwords are never collected or stored.
- **AES-256-GCM Token Encryption**: OAuth access & refresh tokens are encrypted at rest on the backend with derived 32-byte keys and initialization vectors.
- **Complete Email Lifecycle**: Full folder management (**Inbox**, **Starred**, **Sent**, **Archive**, **Trash**) with instant search, bulk selection, and thread expansion.
- **High-Fidelity Demo Sandbox**: Instant testing mode pre-seeded with realistic scenarios if Google Cloud OAuth keys are omitted.

### 🧠 10 Core AI Capabilities
1. **AI Executive Summary**: Generates bulleted summaries, purpose extraction, and key participant overviews.
2. **Context-Aware AI Replies**: Drafts customized replies with single-click tone controls (**Professional**, **Friendly**, **Formal**, **Concise**).
3. **Email Simplification ("Explain Email")**: Translates dense corporate, legal, or technical jargon into simple, plain English.
4. **Action Item Checklist**: Detects tasks and creates structured todo items with checkbox tracking.
5. **Deadline & Date Extraction**: Automatically identifies deadlines, dates, and times mentioned in email bodies.
6. **Smart Priority Detection**: Classifies urgency into **HIGH**, **MEDIUM**, and **LOW** priority badges.
7. **Category Classification**: Automatic categorization into **Work**, **Finance**, **Important**, and **Promotions**.
8. **AI Subject Line Generator**: Creates relevant, high-open-rate subject lines for outbound compositions.
9. **Natural Language Smart Search**: Search through email threads using semantic meaning and natural phrasing.
10. **Tone & Grammar Polisher**: Elevates drafts into polished, executive-ready messages before sending.

### ⚡ Real-Time Architecture & Background Jobs
- **Live WebSockets**: Socket.IO authenticated user rooms for instant UI notifications as AI finishes processing.
- **Queues with Fallback**: BullMQ processing on Redis (compatible with Upstash) with an automatic in-memory queue fallback.
- **Multi-Tier AI Resilience**: Primary **OpenAI** (`gpt-4o-mini`), Secondary **Google Gemini** (`gemini-1.5-flash`), and Tertiary **Deterministic Local NLP** ensuring zero downtime.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Router DOM v7, Lucide Icons, React Hot Toast, DOMPurify |
| **Backend** | Node.js, Express 4, Socket.IO, BullMQ, Mongoose, Google APIs (`googleapis`), Helmet, CORS, Morgan |
| **Databases & Cache** | MongoDB Atlas (or local MongoDB), Redis / Upstash Redis |
| **AI Providers** | OpenAI API (`gpt-4o-mini`), Google Gemini API (`gemini-1.5-flash`), Local NLP Fallback Engine |
| **Security** | AES-256-GCM encryption, JWT authentication, bcryptjs password hashing, Express Rate Limiting |

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────┐        Google OAuth 2.0       ┌────────────────────┐
│   User Browser  │ ────────────────────────────> │ Google Auth Server │
│ (React 18/Vite) │ <──────────────────────────── │ (Access/Refresh)   │
└────────┬────────┘                               └─────────┬──────────┘
         │                                                  │
         │ REST API & Socket.IO Events                      │
         ▼                                                  ▼
┌─────────────────┐        AES-256-GCM Encrypted   ┌────────────────────┐
│  Express Server │ <────────────────────────────> │  MongoDB Database  │
└────────┬────────┘                                └────────────────────┘
         │
         ├───> [AI Layer: OpenAI GPT-4o / Google Gemini / Local NLP Fallback]
         ├───> [Queue Layer: BullMQ / Upstash Redis / Memory Queue]
         └───> [Gmail API: Sync Messages, Star, Archive, Trash, Send RFC2822]
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js** v18.0+ or v20.0+ installed
- **Git** installed
- *(Optional)* Free MongoDB Atlas account & free Upstash Redis account

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/IntelliMail.git
cd IntelliMail
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*(Or install individually: `cd server && npm install`, `cd client && npm install`)*

---

### 4. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (MongoDB Atlas URI or local MongoDB)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/intelligent-email-assistant?appName=Cluster0

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
TOKEN_ENCRYPTION_KEY=9f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e

# Google OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/oauth/callback

# AI Provider Keys (At least one recommended)
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AQ.Ab8RN6K8...

# Redis / Upstash (Optional - uses in-memory fallback if omitted)
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_password
```

---

### 5. Run the Application Locally

#### Start Backend (Port 5000):
```bash
cd server
npm start
```

#### Start Frontend (Port 5173):
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account & generate JWT |
| `POST` | `/api/auth/login` | Authenticate user & start session |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & preferences |
| `GET` | `/api/gmail/oauth/start` | Generate Google OAuth authorization URL |
| `GET` | `/api/gmail/oauth/callback` | Exchange OAuth authorization code for tokens |
| `GET` | `/api/gmail/status` | Check Gmail account connection status |
| `POST` | `/api/gmail/disconnect` | Disconnect Gmail account & revoke tokens |
| `GET` | `/api/emails` | Fetch emails by folder (`inbox`, `starred`, `sent`, `archive`, `trash`) |
| `GET` | `/api/emails/:id` | Fetch email details and content |
| `GET` | `/api/emails/:id/thread`| Fetch complete email conversation thread |
| `POST` | `/api/emails/send` | Send a new email through Gmail API |
| `POST` | `/api/emails/reply` | Send a reply within an existing thread |
| `PATCH`| `/api/emails/:id/star` | Toggle star status of an email |
| `POST` | `/api/ai/summarize` | Generate structured executive summary & action items |
| `POST` | `/api/ai/generate-reply`| Draft AI reply with specified tone (**Professional**, **Friendly**, **Formal**, **Concise**) |
| `POST` | `/api/ai/explain` | Simplify email message into plain English |
| `POST` | `/api/ai/extract-dates`| Extract deadlines, meeting dates, and timelines |
| `GET` | `/api/activity` | Retrieve recent audit activity timeline |
| `GET` | `/api/notifications` | Fetch user notifications |
| `GET` | `/api/health` | Health check (Database, AI providers, OAuth status) |

---

## 🌐 Deployment

### Deploy Backend to Render
1. Create a **New Web Service** connected to your GitHub repository.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Copy all environment variables from `server/.env` into Render's **Environment Variables** tab.
6. Add `https://<YOUR-RENDER-NAME>.onrender.com/api/gmail/oauth/callback` to **Authorized redirect URIs** in Google Cloud Console.

### Deploy Frontend to Vercel / Netlify
1. Connect your repository to Vercel or Netlify.
2. Set **Root Directory**: `client`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Set `VITE_API_BASE_URL=https://<YOUR-RENDER-NAME>.onrender.com/api` in your frontend environment variables.

---

## 🔒 Security & Privacy Practices
- **Never Store Passwords**: Integration uses Google OAuth 2.0 standard.
- **Encrypted at Rest**: OAuth tokens are encrypted using **AES-256-GCM** with unique initialization vectors (IVs) and auth tags.
- **Human-in-the-Loop AI**: AI-generated responses are **never** dispatched automatically; users review and edit every reply before sending.
- **XSS & Content Sanitization**: All HTML email contents are sanitized via DOMPurify before rendering.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
