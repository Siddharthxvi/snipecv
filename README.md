# SnipeCV: AI Career Memory + Resume Optimization Backend

SnipeCV is a backend system designed to act as a user's professional long-term memory. Users upload their career context document (PDF, DOCX, or TXT) once, and the system parses raw text, structures experiences, computes vector embeddings, and performs semantic retrieval to generate job-tailored, ATS-optimized resumes.

---

## Technical Stack & Architecture

- **Core Framework**: FastAPI (Python)
- **Database**: PostgreSQL with `pgvector` extension (fully compatible with Supabase free tier)
- **ORM**: Async SQLAlchemy 2.0 with `asyncpg` driver
- **Embeddings Model**: `all-MiniLM-L6-v2` via `sentence-transformers` (384 dimensions, local execution)
- **AI Models**:
  - **Google Gemini 2.0 Flash API**: Context extraction & final resume formatting (free tier)
  - **Groq API + LLaMA 3.1 8B Instant**: High-speed job description analysis & keywords classification (free tier)

---

## Local Setup & Development

### 1. Requirements
- Python 3.10+
- Docker & Docker Compose

### 2. Quickstart

1. **Clone and Navigate**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your keys:
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/) (free tier).
   - `GROQ_API_KEY`: Get from [Groq Console](https://console.groq.com/) (free tier, optional but highly recommended).

3. **Start Database Services**:
   Spin up PostgreSQL with pgvector:
   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run Migrations**:
   Run Alembic migrations to setup the tables:
   ```bash
   alembic upgrade head
   ```

6. **Start Application Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The interactive Swagger UI will be available at `http://localhost:8000/docs`.

---

## API Endpoints Reference

### Authentication
- `POST /auth/register`: Create a new account.
- `POST /auth/login`: Authenticate and receive a JWT access token.

### Career Context Upload
- `POST /context/upload` (Multipart File):
  - Parses `.pdf`, `.docx`, or `.txt` resumes.
  - Automatically structures experiences & skills using Gemini.
  - Generates and stores 384-dimensional vector embeddings in PostgreSQL.

### Experiences
- `GET /experiences`: Lists all structured experience records with parsed skill tags.

### Resume Tailoring
- `POST /resume/generate`:
  - Accepts `{"job_description": "..."}`
  - Analyzes the job description to identify core requirements.
  - Searches database utilizing `pgvector` cosine similarity.
  - Tailors retrieved experiences to produce a custom, ATS-optimized JSON resume.

---

## Zero-Cost Deployment

### Database (Supabase Free Tier)
1. Sign up on [Supabase](https://supabase.com/).
2. Create a free project.
3. Enable `pgvector` by visiting **Database -> Extensions** in your dashboard and searching for `vector`.
4. Copy the connection string (Connection Pooler, Session Mode, Port 5432). Make sure to replace the protocol prefix `postgresql://` or `postgres://` with `postgresql+asyncpg://` in your backend configuration.

### Backend Hosting (Render or Railway Free Credits)
1. Link your GitHub repository.
2. Set up a Web Service.
3. Add environmental variables:
   - `DATABASE_URL`: Your Supabase async connection string.
   - `SECRET_KEY`: A secure generated random string.
   - `GEMINI_API_KEY`: Google Gemini Key.
   - `GROQ_API_KEY`: Groq API Key.
