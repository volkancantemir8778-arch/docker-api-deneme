let currentCity = "";

// Leaflet map değişkenleri
let map = null;
let marker = null;

/* ---------------- FAVORİLER ---------------- */

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(data) {
    localStorage.setItem("favorites", JSON.stringify(data));
}

function renderFavorites() {
    const list = document.getElementById("favoritesList");
    list.innerHTML = "";

    getFavorites().forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        list.appendChild(li);
    });
}

renderFavorites();

/* ---------------- API ---------------- */

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;

    // 1. Geocoding API (şehir -> koordinat)
    const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );

    const geoData = await geoRes.json();

    if (!geoData.results) {
        alert("Şehir bulunamadı");
        return;
    }

    const { latitude, longitude, name } = geoData.results[0];
    currentCity = name;

    // 2. Weather API
    const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const weather = await weatherRes.json();

    const temp = weather.current_weather.temperature;
    const wind = weather.current_weather.windspeed;

    updateUI(name, temp, wind, latitude, longitude);
}

/* ---------------- UI ---------------- */

function updateUI(city, temp, wind, lat, lon) {

    const card = document.getElementById("weatherCard");
    const icon = document.getElementById("icon");
    const page = document.getElementById("page");

    document.getElementById("cityName").innerText = city;
    document.getElementById("temp").innerText = `🌡️ ${temp} °C`;
    document.getElementById("wind").innerText = `🌬️ ${wind} km/h`;

    // Tema
    if (temp > 25) {
        icon.innerText = "☀️";
        page.style.background = "linear-gradient(to bottom, #fddb92, #d1fdff)";
    } else if (wind > 20) {
        icon.innerText = "🌬️";
        page.style.background = "linear-gradient(to bottom, #cfd9df, #e2ebf0)";
    } else {
        icon.innerText = "⛅";
        page.style.background = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
    }

    card.classList.remove("hidden");

    // HARİTA GÜNCELLE
    updateMap(lat, lon, city);
}

/* ---------------- HARİTA (LEAFLET) ---------------- */

function updateMap(lat, lon, city) {

    if (!map) {
        map = L.map('map').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
        }).addTo(map);

    } else {
        map.setView([lat, lon], 10);
    }

    if (marker) {
        marker.remove();
    }

    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(city)
        .openPopup();
}

/* ---------------- FAVORİ EKLE ---------------- */

function addFavorite() {
    const favs = getFavorites();

    if (!favs.includes(currentCity)) {
        favs.push(currentCity);
        saveFavorites(favs);
        renderFavorites();
    }
}
