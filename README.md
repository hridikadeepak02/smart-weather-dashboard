# Atmos — Smart Weather Dashboard 🌦️

A responsive weather dashboard built with **HTML, CSS and vanilla JavaScript**. Search for a city to view current weather conditions, a 7-day forecast, UV index, wind speed, humidity, sunrise and sunset.

## Live features

- Search weather by city name
- Current temperature and feels-like temperature
- Relative humidity and wind speed
- Current UV index with a simple risk label
- 7-day forecast with daily high/low temperatures and rain probability
- Sunrise and sunset times
- Celsius / Fahrenheit toggle
- Responsive layout for desktop, tablet and mobile
- Loading and error messages

## Built with

- HTML5
- CSS3
- JavaScript (Fetch API)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## Run locally

No build tools or API key are required.

1. Download or clone this repository.
2. Open the project folder.
3. Open `index.html` in a browser.

For a local development server, you can use the **Live Server** extension in Visual Studio Code:
1. Open the folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## Deploy with GitHub Pages

1. Create a new GitHub repository named `smart-weather-dashboard`.
2. Upload `index.html`, `style.css`, `script.js` and `README.md` to the repository root.
3. Open the repository's **Settings**.
4. Select **Pages** from the sidebar.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)` folder, then click **Save**.
7. Wait for GitHub Pages to publish the site. Your public URL will appear in the Pages section.

## Project structure

```text
smart-weather-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## API notes and attribution

This project uses Open-Meteo's public APIs. The free API is intended for non-commercial use and does not require an API key. Please review the provider's current [terms](https://open-meteo.com/en/terms) before using this project commercially.

Weather data is provided by [Open-Meteo](https://open-meteo.com/) and is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Forecasts are model-based estimates and should not be treated as official emergency warnings.

## Future improvements

- Save favourite cities
- Add hourly forecast charts
- Add automatic location detection with user permission
- Add severe-weather alerts from official sources
- Add multilingual support

## License

The source code in this repository is available under the MIT License. The weather data remains subject to Open-Meteo's data attribution and licensing terms.
