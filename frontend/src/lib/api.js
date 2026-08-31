import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export async function predictPrice({ company, rating, ram_gb, rom_gb }) {
  const { data } = await api.post("/api/predict", {
    company: company || null,
    rating,
    ram_gb,
    rom_gb,
  });
  return data;
}


export async function predictPriceV2API(payload) {
  // const { data } = await api.post("/api/predictor_v2", payload);
  // return data;
    try {
      const { data } = await api.post("/api/predictor_v2", payload);
      return data; 
    } catch (error) { 
      // FastAPI HTTPException response 
      const message = error.response?.data?.detail?.message || error.response?.data?.message || "Unable to generate prediction. Please try again.";
      const err = new Error(message); err.status = error.response?.status; 
      err.response = error.response; 
      throw err; 
    }
}

export async function getCompanies() {
  const { data } = await api.get("/api/companies");
  return data.companies;
}
