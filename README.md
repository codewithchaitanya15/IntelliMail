# ⚡ IntelliMail — AI-Powered Intelligent Email Assistant

> A modern, full-stack, enterprise-grade AI email client that seamlessly connects with Gmail via Google OAuth 2.0 to summarize threads, draft context-aware replies with customizable tones, extract action items and deadlines, detect priority, explain complex messages in plain English, and 10x email productivity.

---

## 1. Project Name
**IntelliMail (Intelligent Email Assistant)**

---

## 2. Problem Statement
In today's fast-paced digital workplace, professionals and teams spend **over 28% of their workday** managing emails. Key challenges include:
- **Information Overload**: Lengthy email chains with dozens of back-and-forth messages bury critical decisions and context.
- **Missed Action Items & Deadlines**: Crucial deliverables, dates, and action items get lost inside paragraphs of text.
- **Drafting Fatigue & Tone Inconsistency**: Crafting thoughtful, professional responses repeatedly takes hours each week.
- **Complex Jargon**: Technical, legal, and corporate jargon creates misunderstandings and slows down decision-making.

**IntelliMail** solves these problems by pairing modern inbox management with advanced multi-model AI capabilities (OpenAI GPT-4o & Google Gemini), empowering users to digest, prioritize, draft, and dispatch communications in seconds with full human-in-the-loop control.

---

## 3. Features

### 📬 Core Email Management
- **Official Google OAuth 2.0 Integration**: Connect securely with Gmail using Google's official OAuth consent flow. Passwords are never collected or stored.
- **AES-256-GCM Token Encryption**: OAuth access and refresh tokens are encrypted at rest on the backend with 256-bit encryption keys.
- **Full Folder & Email Lifecycle**: Complete support for **Inbox**, **Starred**, **Sent**, **Archive**, and **Trash** (including **Restore to Inbox** and **Permanent Deletion / Delete Forever**).
- **Bulk Email Actions**: Multi-select emails to mark as read/unread, archive, trash, restore, or permanently delete in one click.
- **Thread Conversation View**: Interactive view of full email message histories with expandable message accordions.
- **Zero-Config Demo Mode**: Pre-seeded sandbox environment that lets users experience all features immediately without requiring Google Cloud credentials.

### 🧠 Advanced AI Capabilities (10 AI Tools)
1. **Context-Aware AI Replies**: Automatically generates drafted replies tailored to the thread context with 1-click tone presets (**Professional**, **Friendly**, **Formal**, **Concise**).
2. **AI Executive Summary**: Generates concise bulleted overviews, primary purpose statements, and sender sentiment analysis.
3. **Email Simplifier ("Explain Email")**: Deconstructs complex legal, financial, or technical jargon into simple, plain English.
4. **Action Item Extractor**: Identifies deliverables and turns them into an interactive todo checklist with completion tracking.
5. **Deadline & Date Detector**: Automatically extracts critical dates, deadlines, and meetings mentioned in email bodies.
6. **Smart Priority Detection**: Automatically classifies email urgency into **HIGH**, **MEDIUM**, and **LOW** priority levels with visual indicators.
7. **Smart Category Classification**: Automatically organizes emails into **Work**, **Finance**, **Important**, **Personal**, and **Promotions**.
8. **AI Subject Line Generator**: Proposes catchy, relevant, high-open-rate subject lines during composition.
9. **Natural Language Semantic Search**: Search emails by meaning, topic, or natural phrasing rather than just exact keywords.
10. **Tone & Grammar Polisher**: Refines and elevates email drafts before sending.

### ⚡ Infrastructure & Resilience
- **Real-Time WebSockets**: Instant updates and live notifications powered by Socket.IO rooms.
- **Background Queue Processing**: BullMQ asynchronous task workers backed by Redis, featuring an automatic in-memory queue fallback.
- **Multi-Tier AI Fallback Architecture**: Primary **OpenAI** (`gpt-4o-mini`) ➔ Secondary **Google Gemini** (`gemini-1.5-flash`) ➔ Tertiary **Deterministic NLP Fallback Engine**, ensuring 99.9% uptime.

---

## 4. Technology Stack

| Layer | Technologies / Services |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Vanilla CSS & Tailwind CSS tokens, Zustand (State Management), React Router DOM v7, Lucide Icons, React Hot Toast |
| **Backend API** | Node.js (ES Modules), Express.js, Socket.IO, BullMQ, Mongoose (ODM), Google APIs (`googleapis`), Helmet, CORS, Morgan |
| **Databases & Caching** | MongoDB Atlas (Cloud NoSQL), Upstash Redis / Local Redis |
| **AI Providers** | OpenAI API (`gpt-4o-mini`), Google Gemini API (`gemini-1.5-flash`), Local NLP Fallback Engine |
| **Security & Auth** | Google OAuth 2.0, AES-256-GCM Encryption, JSON Web Tokens (JWT), bcryptjs, DOMPurify (XSS Sanitization) |
| **Hosting & CI/CD** | Vercel (Frontend SPA), Render (Backend Web Service), GitHub (Source Control) |

---

## 5. Screenshots

### 🖥️ 1. Modern Inbox & Folder Navigation
Clean, distraction-free inbox interface with priority badges, category tags, quick hover actions, and real-time search.

```
+---------------------------------------------------------------------------------------------------+
|  ⚡ IntelliMail      [ Search emails with AI... ]                     🔔  🌙  (👤 User Profile)   |
+------------------+--------------------------------------------------------------------------------+
|  📥 Inbox   (12) |  [x] [🔄] [Mark Read] [Archive] [Delete]                 Filter: [All Priority] |
|  ⭐ Starred  (3) | ------------------------------------------------------------------------------ |
|  📤 Sent         |  ⭐  Sarah Connor      Q3 Budget Review & Approvals     — Attached report...   |
|  📦 Archive      |  ⭐  Alex Rivera       Project Roadmap & Sprint Goals  — Next milestone...    |
|  🗑️ Trash        |      Google Cloud      Monthly Billing Invoice         — View statement...    |
+------------------+--------------------------------------------------------------------------------+
```

### 🧠 2. AI Executive Summary & Action Items
Extracts key points, urgency indicators, and an interactive task checklist from long email threads.

```
+---------------------------------------------------------------------------------------------------+
|  ← Back   ⭐   📦 Archive   🗑️ Trash   |   ✨ [Summarize with AI]   ⚡ [Explain]   🎯 [Actions]    |
+---------------------------------------------------------------------------------------------------+
|  🤖 AI Executive Summary                                                                          |
|  • Q3 financial performance exceeded forecast by 14.2% across European and US markets.             |
|  • Final budget approvals must be signed and submitted before Friday at 5:00 PM EST.             |
|                                                                                                   |
|  📋 Detected Action Items:                                                                        |
|  [x] Review revised Q3 spreadsheet attachment                                                     |
|  [ ] Sign approval form and send copy to Finance team                                             |
+---------------------------------------------------------------------------------------------------+
```

### ✍️ 3. Context-Aware AI Reply Generator
Drafts human-like replies instantly with 1-click tone customization.

```
+---------------------------------------------------------------------------------------------------+
|  ⚡ AI Reply Assistant                                                                             |
|  Tone: [👔 Professional]  [😊 Friendly]  [📜 Formal]  [⚡ Concise]                                 |
| ------------------------------------------------------------------------------------------------- |
|  Hi Sarah,                                                                                        |
|                                                                                                   |
|  Thank you for sharing the Q3 financial summary. I have reviewed the budget report and everything |
|  looks aligned with our targets. I will sign and submit the final approval before Friday's deadline. |
|                                                                                                   |
|  Best regards,                                                                                    |
|  Alex                                                                                             |
| ------------------------------------------------------------------------------------------------- |
|  [✨ Regenerate]                      [📋 Copy Draft]                       [📤 Send Reply Now]    |
+---------------------------------------------------------------------------------------------------+
```

---

## 6. Live Demo
- **Frontend (Vercel)**: [https://intelli-mail-15.vercel.app](https://intelli-mail-15.vercel.app)

---

## 7. Backend
- **Backend Service (Render)**: [https://intellimail-h9mx.onrender.com](https://intellimail-h9mx.onrender.com)
- **API Health Check**: [https://intellimail-h9mx.onrender.com/api/health](https://intellimail-h9mx.onrender.com/api/health)

---

## 8. Setup Instructions

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/codewithchaitanya15/IntelliMail.git
cd IntelliMail
```

### 3. Install All Dependencies
```bash
# Install root, backend, and frontend dependencies in one command
npm run install:all
```
*(Alternatively, run `npm install` inside both `server/` and `client/` directories).*

### 4. Configure Environment Variables
- Create `server/.env` using the template provided in **Section 9**.
- Create `client/.env` using the template provided in **Section 9**.

### 5. Start the Application

#### Start the Backend Server:
```bash
cd server
npm start
```
*Backend will start on `http://localhost:5000`.*

#### Start the Frontend Client (in a new terminal):
```bash
cd client
npm run dev
```
*Frontend will start on `http://localhost:5173`.*

### 6. Open in Browser
Visit **`http://localhost:5173`** to use IntelliMail locally.

---

## 9. Environment Variables

> ⚠️ **Important Security Notice**: Never commit API keys, passwords, OAuth secrets, access tokens, or sensitive credentials to GitHub. All `.env` files are excluded by `.gitignore`.

### 🖥️ Backend Environment Variables (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (MongoDB Atlas or Local MongoDB)
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority

# Security & Authentication
JWT_SECRET=your_jwt_secret_key_min_32_characters
JWT_EXPIRES_IN=7d
TOKEN_ENCRYPTION_KEY=your_64_character_hex_encryption_key

# Google OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/oauth/callback

# AI Provider API Keys (At least one recommended)
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Redis / Upstash Cache & Queue (Optional - falls back to in-memory queue)
REDIS_HOST=your_redis_host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 🌐 Frontend Environment Variables (`client/.env`)

```env
# API Base URL (leave empty in local dev to default to http://localhost:5000/api)
VITE_API_BASE_URL=https://intellimail-h9mx.onrender.com/api

# Socket.IO Server URL (leave empty in local dev to default to http://localhost:5000)
VITE_SOCKET_URL=https://intellimail-h9mx.onrender.com
```

---

## 🔒 Security Practices
- **Human-in-the-Loop AI**: AI generated content is never dispatched without user review.
- **XSS Protection**: All incoming email bodies and HTML structures are sanitized via `DOMPurify`.
- **Zero Raw Password Storage**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Token Cryptography**: Access and refresh tokens encrypted with **AES-256-GCM**.

---

## 📄 License
This project is open-source and licensed under the **MIT License**.
