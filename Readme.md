# 🎬 CineAI - Intelligent Movie Discovery Platform

CineAI is a full-stack movie discovery and recommendation platform that helps users explore, search, and discover movies through personalized recommendations. The platform combines collaborative filtering techniques, movie metadata analysis, and TMDB integration to provide a seamless movie exploration experience.

## 🚀 Features

### 🔍 Smart Movie Search

* Search movies by title
* Real-time movie discovery
* Detailed movie information

### 🤖 Personalized Recommendations

* Collaborative Filtering based recommendations
* User rating analysis
* Personalized movie suggestions

### ❤️ Favorites Management

* Save favorite movies
* Manage personal watchlist
* Quick access to liked movies

### ⭐ Movie Ratings

* Rate movies
* Update ratings
* Track user preferences

### 🔐 User Authentication

* Secure JWT-based authentication
* User registration and login
* Protected routes and user sessions

### 🎞️ TMDB Integration

* Latest movie data
* Movie posters and metadata
* Popular and trending movies

### 📊 Recommendation Engine

* MovieLens Dataset Integration
* SVD-based Collaborative Filtering
* Genre-based recommendation support

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* Framer Motion
* Axios

### Backend

* Flask
* Flask-JWT-Extended
* Flask-SQLAlchemy
* Flask-CORS

### Database

* SQLite

### Recommendation System

* MovieLens Dataset
* Collaborative Filtering
* SVD Recommendation Model

### External APIs

* TMDB API

---

## 📂 Project Structure

```bash
Movie-Discovery-Platform/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── app.py
│   ├── models/
│   ├── routes/
│   ├── ml/
│   ├── utils/
│   └── data/
│
└── README.md
```

---

## ⚙️ Local Setup

### Clone Repository

```bash
git clone https://github.com/AnkushDwivedi105/CineAI-Intelligent-Movie-Recommendation-Platform-Using-AI.git
```

```bash
cd CineAI-Intelligent-Movie-Recommendation-Platform-Using-AI
```

---

## Backend Setup

Navigate to server folder:

```bash
cd server
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment variables:

```env
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET_KEY=your_secret_key
```

Run backend server:

```bash
python app.py
```

Backend will run on:

```text
http://localhost:5000
```

---

## Frontend Setup

Navigate to client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create environment file:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 🧠 How Recommendations Work

1. User rates movies.
2. Ratings are stored in the database.
3. Recommendation engine analyzes user preferences.
4. Collaborative filtering algorithm identifies similar users.
5. Personalized movie recommendations are generated.
6. Movie metadata is fetched from TMDB.
7. Results are displayed in the frontend.

---

## 📸 Screenshots

### Home Page

Add screenshot here

### Movie Search

Add screenshot here

### Recommendation Dashboard

Add screenshot here

### Favorites Section

Add screenshot here

---

## 🔮 Future Enhancements

* AI Chat-Based Movie Recommendations
* Gemini/OpenAI Integration
* Semantic Movie Search
* Movie Review Summarization
* Watchlist Sharing
* Streaming Platform Availability
* Recommendation Explainability
* User Profiles and Analytics
* PostgreSQL Integration
* Docker Support

---

## 📈 Learning Outcomes

Through this project, I gained hands-on experience with:

* Full Stack Development
* React and Flask Integration
* REST API Development
* Authentication with JWT
* Recommendation Systems
* Machine Learning Concepts
* Database Design
* API Integration
* State Management
* Modern Frontend Development

---

## 👨‍💻 Author

**Ankush Dwivedi**

GitHub: https://github.com/AnkushDwivedi105

---

## ⭐ Support

If you found this project helpful, please consider giving it a star on GitHub.

It helps motivate further development and improvements.

⭐ Star the repository if you like the project!
