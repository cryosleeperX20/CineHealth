from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI(title="CineHealth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models ──────────────────────────────────────────
with open("models/cosine_sim.pkl", "rb") as f:
    cosine_sim = pickle.load(f)

with open("models/tfidf_matrix.pkl", "rb") as f:
    tfidf_matrix = pickle.load(f)

with open("models/popularity_model.pkl", "rb") as f:
    popularity_model = pickle.load(f)

with open("models/mood_genre_map.json", "r") as f:
    mood_genre_map = json.load(f)

movies_df = pd.read_csv("models/movies_processed.csv")
predicted_ratings = pd.read_csv("models/predicted_ratings.csv", index_col=0)
movie_features = pd.read_csv("models/movie_features.csv")

analyzer = SentimentIntensityAnalyzer()

print("✅ All models loaded successfully!")

# ── Mood Analysis Endpoint ────────────────────────────────
class MoodRequest(BaseModel):
    text: str

@app.post("/analyze-mood")
def analyze_mood(request: MoodRequest):
    scores = analyzer.polarity_scores(request.text)
    compound = scores["compound"]

    if compound >= 0.5:
        mood = "happy"
    elif compound >= 0.1:
        mood = "neutral"
    elif compound >= -0.1:
        mood = "neutral"
    elif compound >= -0.3:
        mood = "sad"
    elif compound >= -0.5:
        mood = "anxious"
    else:
        mood = "depressed"

    intensity = round((abs(compound) * 10), 1)
    genres = mood_genre_map.get(mood, [])

    return {
        "mood": mood,
        "intensity": intensity,
        "compound_score": compound,
        "recommended_genres": genres
    }

# ── Recommendations Endpoint ─────────────────────────────
class RecommendRequest(BaseModel):
    user_id: int
    mood: str
    n: int = 8

@app.post("/recommend")
def recommend(request: RecommendRequest):
    mood_genres = mood_genre_map.get(request.mood, [])

    try:
        user_ratings = predicted_ratings.loc[request.user_id]
        already_rated = movies_df[movies_df['movie_id'].isin(
            user_ratings[user_ratings > 0].index.astype(int)
        )]['movie_id'].tolist()
        scores = user_ratings.drop(index=[str(x) for x in already_rated], errors='ignore')
        top_ids = [int(x) for x in scores.nlargest(50).index.tolist()]
    except:
        top_ids = movies_df['movie_id'].tolist()

    candidates = movies_df[movies_df['movie_id'].isin(top_ids)]

    if mood_genres:
        genre_filter = candidates[candidates[mood_genres].sum(axis=1) > 0]
        if len(genre_filter) >= request.n:
            candidates = genre_filter

    result = candidates.head(request.n)[['movie_id', 'title']].to_dict(orient='records')
    return {"mood": request.mood, "recommendations": result}
# ── Popularity Prediction Endpoint ───────────────────────
class PopularityRequest(BaseModel):
    avg_rating: float
    rating_std: float = 0.5
    year: int
    genres: list[str] = []

@app.post("/predict-popularity")
def predict_popularity(request: PopularityRequest):
    all_genres = ['Action','Adventure','Animation','Childrens',
                  'Comedy','Crime','Documentary','Drama','Fantasy',
                  'Film_Noir','Horror','Musical','Mystery','Romance',
                  'Sci_Fi','Thriller','War','Western']

    genre_vector = [1 if g in request.genres else 0 for g in all_genres]
    features = genre_vector + [request.avg_rating, request.rating_std, request.year]

    feature_names = all_genres + ['avg_rating', 'rating_std', 'year']
    features_df = pd.DataFrame([features], columns=feature_names)

    score = popularity_model.predict(features_df)[0]
    score = round(float(np.clip(score, 0, 1)), 4)

    return {
        "popularity_score": score,
        "label": "High" if score > 0.6 else "Medium" if score > 0.3 else "Low"
    }
# ── EDA Stats Endpoint ────────────────────────────────────
@app.get("/eda-stats")
def eda_stats():
    total_movies = len(movies_df)
    total_users = len(predicted_ratings)
    avg_rating = round(float(movie_features['avg_rating'].mean()), 2)
    top_movies = movie_features.nlargest(5, 'rating_count')[['movie_id', 'avg_rating', 'rating_count']].to_dict(orient='records')

    genre_cols = ['Action','Adventure','Animation','Childrens','Comedy',
                  'Crime','Documentary','Drama','Fantasy','Film_Noir',
                  'Horror','Musical','Mystery','Romance','Sci_Fi',
                  'Thriller','War','Western']
    genre_counts = {g: int(movies_df[g].sum()) for g in genre_cols}

    return {
        "total_movies": total_movies,
        "total_users": total_users,
        "avg_rating": avg_rating,
        "top_movies": top_movies,
        "genre_distribution": genre_counts
    }
