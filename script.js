const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const elements = {
  form: document.querySelector("#searchForm"),
  cityInput: document.querySelector("#cityInput"),
  status: document.querySelector("#status"),
  unitToggle: document.querySelector("#unitToggle"),
  location: document.querySelector("#locationName"),
  date: document.querySelector("#currentDate"),
  icon: document.querySelector("#currentIcon"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition"),
  feelsLike: document.querySelector("#feelsLike"),
  high: document.querySelector("#todayHigh"),
  low: document.querySelector("#todayLow"),
  localTime: document.querySelector("#localTime"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  uv: document.querySelector("#uv"),
  uvLabel: document.querySelector("#uvLabel"),
  feelsMetric: document.querySelector("#feelsMetric"),
  forecast: document.querySelector("#forecast"),
  sunrise: document.querySelector("#sunrise"),
  sunset: document.querySelector("#sunset")
};

let isFahrenheit = false;
let latestWeather = null;

const weatherDescriptions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Dense drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"], 57: ["Heavy freezing drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"], 63: ["Moderate rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
  71: ["Slight snow", "🌨️"], 73: ["Moderate snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"], 80: ["Rain showers", "🌦️"], 81: ["Moderate showers", "🌧️"],
  82: ["Violent showers", "⛈️"], 85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Severe thunderstorm", "⛈️"]
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function celsiusToFahrenheit(value) {
  return (value * 9 / 5) + 32;
}

function formatTemperature(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--°";
  const converted = isFahrenheit ? celsiusToFahrenheit(Number(value)) : Number(value);
  return `${Math.round(converted)}°`;
}

function formatTime(isoString, timezone) {
  if (!isoString) return "--:--";
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: timezone
    }).format(new Date(isoString));
  } catch {
    return isoString.slice(11, 16);
  }
}

function getWeather(code) {
  return weatherDescriptions[code] || ["Weather conditions", "🌡️"];
}

function getUvDescription(value) {
  if (value < 3) return "Low";
  if (value < 6) return "Moderate";
  if (value < 8) return "High";
  if (value < 11) return "Very high";
  return "Extreme";
}

async function findCity(cityName) {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: cityName,
    count: "1",
    language: "en",
    format: "json"
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not search for that city. Please try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = new URL(FORECAST_URL);
  const params = {
    latitude,
    longitude,
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature",
      "is_day", "precipitation", "weather_code", "wind_speed_10m"
    ].join(","),
    hourly: "uv_index",
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min",
      "sunrise", "sunset", "uv_index_max", "precipitation_probability_max"
    ].join(","),
    forecast_days: "7",
    timezone: "auto"
  };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather data is temporarily unavailable. Please try again.");
  return response.json();
}

function getCurrentUv(weather) {
  const times = weather.hourly.time;
  const values = weather.hourly.uv_index;
  const currentTime = new Date(weather.current.time).getTime();
  let closestIndex = 0;
  let smallestDifference = Infinity;

  times.forEach((time, index) => {
    const difference = Math.abs(new Date(time).getTime() - currentTime);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });
  return values[closestIndex] ?? weather.daily.uv_index_max[0] ?? 0;
}

function renderForecast(weather) {
  const daily = weather.daily;
  elements.forecast.innerHTML = daily.time.map((date, index) => {
    const day = new Date(`${date}T12:00:00`);
    const dayName = index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(day);
    const [description, icon] = getWeather(daily.weather_code[index]);
    const rainChance = daily.precipitation_probability_max[index];
    return `
      <article class="forecast-day" title="${description}">
        <div class="day">${dayName}</div>
        <div class="icon" aria-hidden="true">${icon}</div>
        <div class="range">
          <span>${formatTemperature(daily.temperature_2m_max[index])}</span>
          <span class="low">${formatTemperature(daily.temperature_2m_min[index])}</span>
        </div>
        <div class="rain">💧 ${rainChance ?? 0}%</div>
      </article>`;
  }).join("");
}

function renderWeather(place, weather) {
  latestWeather = { place, weather };
  const current = weather.current;
  const daily = weather.daily;
  const [description, icon] = getWeather(current.weather_code);
  const uvNow = getCurrentUv(weather);
  const timezone = weather.timezone;

  elements.location.textContent = `${place.name}, ${place.country}`;
  elements.date.textContent = new Intl.DateTimeFormat("en", {
    weekday: "long", day: "numeric", month: "long", timeZone: timezone
  }).format(new Date(current.time));
  elements.icon.textContent = icon;
  elements.temperature.textContent = formatTemperature(current.temperature_2m);
  elements.condition.textContent = description;
  elements.feelsLike.textContent = `Feels like ${formatTemperature(current.apparent_temperature)}`;
  elements.high.textContent = formatTemperature(daily.temperature_2m_max[0]);
  elements.low.textContent = formatTemperature(daily.temperature_2m_min[0]);
  elements.localTime.textContent = formatTime(current.time, timezone);
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  elements.uv.textContent = Number(uvNow).toFixed(1);
  elements.uvLabel.textContent = `${getUvDescription(uvNow)} · current`;
  elements.feelsMetric.textContent = formatTemperature(current.apparent_temperature);
  elements.sunrise.textContent = formatTime(daily.sunrise[0], timezone);
  elements.sunset.textContent = formatTime(daily.sunset[0], timezone);
  renderForecast(weather);
  setStatus(`Showing live forecast for ${place.name}.`);
}

async function loadCity(cityName) {
  const trimmedName = cityName.trim();
  if (!trimmedName) return;

  setStatus(`Finding ${trimmedName}...`);
  elements.form.querySelector("button").disabled = true;

  try {
    const place = await findCity(trimmedName);
    setStatus(`Getting weather for ${place.name}...`);
    const weather = await getWeather(place.latitude, place.longitude);
    renderWeather(place, weather);
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
  } finally {
    elements.form.querySelector("button").disabled = false;
  }
}

function updateTemperatureDisplay() {
  if (latestWeather) renderWeather(latestWeather.place, latestWeather.weather);
  elements.unitToggle.innerHTML = isFahrenheit ? "°F <span>/</span> °C" : "°C <span>/</span> °F";
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadCity(elements.cityInput.value);
});

elements.unitToggle.addEventListener("click", () => {
  isFahrenheit = !isFahrenheit;
  updateTemperatureDisplay();
});

// Default city makes the dashboard useful immediately on first visit.
loadCity("Coimbatore");
