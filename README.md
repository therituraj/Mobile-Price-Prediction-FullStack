# PhonePredict — Mobile Price Predictor

A polished, two-part app:

- **Frontend** — Vite + React + React Router + Tailwind CSS + GSAP
- **Backend** — FastAPI + scikit-learn (RandomForest) + Tavily web search + Claude for structuring results

Give it a **company (optional), rating, RAM (GB) and storage (GB)** → it predicts a fair market
price, then finds and structures **5 real phones** worth comparing it to.

---

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the model (generates backend/app/data/model.pkl)
python train_model.py

# Copy env template and (optionally) add API keys
cp .env.example .env

# Run the API
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://127.0.0.1:8000`. Docs at `http://127.0.0.1:8000/docs`.

### Optional API keys (`.env`)

The app works with **zero keys** — it falls back to a curated local phone catalogue for
recommendations (`recommendation_source: "local_fallback"` in the response). Add these to unlock
live results:

| Variable | Purpose | Get it at |
|---|---|---|
| `TAVILY_API_KEY` | Live web search for current phones near the predicted price | https://tavily.com |
| `ANTHROPIC_API_KEY` | Structures raw search results into clean JSON recommendations | https://console.anthropic.com |

With only `TAVILY_API_KEY` set, you still get results (`recommendation_source: "tavily"`), just
less neatly structured. With both set, you get `"tavily+llm"` — the full pipeline.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_BASE_URL at your backend
npm run dev
```

Open `http://localhost:5173`.

## 3. How a request flows

1. User submits company / rating / RAM / ROM.
2. `POST /api/predict` → the trained RandomForest model predicts a price.
3. The predicted price + specs are used to query **Tavily** for current phones in that range.
4. The raw search results are passed to **Claude** with a strict JSON-only prompt, which returns
   exactly 5 structured recommendations (`name`, `company`, `price`, `specs`, `reason`, `source_url`).
5. If Tavily or the LLM step isn't configured/fails, the API transparently falls back to ranking a
   local curated phone dataset by spec/price similarity — the UI always gets a complete result.

## 4. Retraining on real data

`train_model.py` currently trains on a synthetic-but-realistic pricing formula (see
`COMPANY_PREMIUM`, `price_formula`). To use real data, replace `generate_synthetic_data()` with
`pd.read_csv("your_data.csv")`, keeping columns `Company, Rating, RamSize_GB, RomSize_GB, Price`.

## Project structure

```
backend/
  app/
    main.py            FastAPI app + /api/predict route
    model.py            Loads model.pkl, runs inference
    schemas.py           Pydantic request/response models
    tavily_client.py     Live web search
    llm_structurer.py    Claude-based result structuring
    recommend.py         Local fallback recommender
    data/
      phones.json         Curated sample phone catalogue
      model.pkl           Trained model (generated)
      companies.json      Companies model was trained on (generated)
  train_model.py
  requirements.txt
  .env.example

frontend/
  src/
    components/   PriceDial (signature gauge), PredictForm, PhoneList, Navbar, ThemeToggle
    pages/        Predictor, History, About
    theme/        Light/dark ThemeContext
    lib/          api.js, history.js (localStorage)
```
