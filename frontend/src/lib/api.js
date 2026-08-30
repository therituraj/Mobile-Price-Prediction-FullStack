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

export async function getCompanies() {
  const { data } = await api.get("/api/companies");
  return data.companies;
}
