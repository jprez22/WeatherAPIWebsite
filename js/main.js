document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('locationSelector');

    async function fetchCSV() {
        try {
            const response = await fetch('city_coordinates.csv');
            const csv = await response.text();
            const data = csvToArray(csv);
            populateData(data);
        } catch (error) {
            console.error('Error fetching the CSV file:', error);
        }
    }

    function csvToArray(csv) {
        const rows = csv.trim().split('\n');
        const data = rows.slice(1).map(row => {
            const [lat, lon, city, country] = row.split(',');
            return { lat, lon, city, country };
        });
        return data;
    }

    function populateData(data) {
        data.forEach(location => {
            if (location.city && location.country) {
                const option = document.createElement('option');
                option.value = `${location.lat},${location.lon}`;
                option.text = `${location.city}, ${location.country}`;
                select.appendChild(option);
            }
        });
    }

    select.addEventListener('change', async function() {
        const selectedOption = this.options[this.selectedIndex];
        const value = selectedOption.value;
        const text = selectedOption.text;

        if (value) {
            const [lat, lon] = value.split(',');
            const url = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                displayWeather(data.dataseries, text);
            } catch (error) {
                console.error('Error fetching the weather data:', error);
            }
        } else {
            document.getElementById('weather').innerHTML = 'No location selected';
        }
    });

    function displayWeather(weatherData, location) {
        const weatherContainer = document.getElementById('weather');
        weatherContainer.innerHTML = `<h2>Weather for ${location}</h2>`;

        weatherData.slice(0, 7).forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const tempMax = day.temp2m.max;
            const tempMin = day.temp2m.min;
            const weatherIcon = getWeatherIcon(day.weather);

            const weatherDay = document.createElement('div');
            weatherDay.classList.add('weather-day');

            weatherDay.innerHTML = `
                <h3>${dayName}</h3>
                <img src="${weatherIcon}" alt="${day.weather}">
                <p class="temp">H: ${tempMax}°C</p>
                <p class="temp">L: ${tempMin}°C</p>
            `;
            weatherContainer.appendChild(weatherDay);
        });
    }

    function getWeatherIcon(weather) {
        const icons = {
            clear: 'images/clear.png',
            pcloudy: 'images/partly-cloudy.png',
            mcloudy: 'images/mostly-cloudy.png',
            cloudy: 'images/cloudy.png',
            humid: 'images/humid.png',
            lightrain: 'images/light-rain.png',
            rain: 'images/rain.png',
            oshower: 'images/showers.png',
            ishower: 'images/intermittent-showers.png',
            lightsnow: 'images/light-snow.png',
            snow: 'images/snow.png',
            rainsnow: 'images/rain-snow.png',
            ts: 'images/thunderstorm.png',
            tsrain: 'images/thunderstorm-rain.png'
        };
        return icons[weather] || 'images/clear.png';
    }

    fetchCSV();
});