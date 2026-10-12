// SmartMove frontend API service

const API_BASE_URL = "http://localhost:5000/api";

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getTrips() {
  return fetchAPI("/trips");
}

export async function getAnnouncements() {
  return fetchAPI("/announcements");
}

export async function checkBackendHealth() {
  return fetchAPI("/health");
}
export async function getOracleRows(endpoint) {
  const response = await fetch(
    `http://localhost:5000/api/${endpoint.replace(/^\/+/, "")}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}