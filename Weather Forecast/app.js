const container = document.querySelector(".container");
// const searchBox = document.querySelector(".search-box");
const search = document.querySelector(".search-box button");
const input = document.querySelector(".search-box input");

const weatherBox = document.querySelector(".weatherBox");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");

input.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		searchWeather();
	}
});

search.addEventListener("click", () => {
	searchWeather();
});

document.getElementById("locationInput").addEventListener("keyup", function (event) {
	if (event.key === "Enter") {
		search.style.background = "#06283D"
		search.style.color = "#fff"
	}
});

function searchWeather() {
	const APIKey = "c920c1943d0cfe7436cac2652f7a18d2";
	const city = input.value;

	if (city === "") return;

	// Function to fetch latitude and longitude for a given city name
	async function fetchCoordinates(cityName) {
		const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=c920c1943d0cfe7436cac2652f7a18d2`;
		console.log(geoApiUrl);

		try {
			const response = await fetch(geoApiUrl);
			const data = await response.json();
			console.log("printing geoAPI data: ", data);
			if (data.length > 0) {
				const { lat, lon } = data[0];
				return { lat, lon };
			} else {
				container.style.height = "400px";
				weatherBox.style.display = "none";
				weatherDetails.style.display = "none";
				error404.style.display = "block";
				error404.classList.add("fadeIn");
				throw new Error("City not found");
			}
		} catch (error) {
			console.error("Error fetching coordinates:", error.message);
			throw error;
		}
	}

	// Function to fetch weather forecast using latitude and longitude
	async function fetchWeatherForecast(latitude, longitude) {
		const forecastApiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=c920c1943d0cfe7436cac2652f7a18d2`;

		try {
			const response = await fetch(forecastApiUrl);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error fetching weather forecast:", error.message);
			throw error;
		}

	}

	fetchCoordinates(city)
		.then(({ lat, lon }) => fetchWeatherForecast(lat, lon))
		.then((forecastData) => {
			console.log(`Weather forecast for ${city}:`, forecastData);
	
			error404.style.display = "none";
			error404.classList.remove("fadeIn");

			const description = document.querySelector(
				".weatherBox .description"
			);
			const image = document.querySelector(".weatherBox img");
			const day_time = document.querySelector(".weatherBox .day-time");

			const temperature = document.querySelector(
				".weatherBox .temperature"
			);
			const low_high = document.querySelector(".weatherBox .low-high");


			const iconCode = forecastData.current.weather[0].icon;

			const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

			image.src = iconUrl;

			const descriptionText = forecastData.current.weather[0].description;

			const words = descriptionText.split(" ");

			const capitalizedWords = words.map(
				(word) => word.charAt(0).toUpperCase() + word.slice(1)
			);

			const capitalizedDescription = capitalizedWords.join(" ");

			description.innerHTML = capitalizedDescription;

			const currentDate = new Date();

			const day = currentDate.toLocaleString("en-US", {
				weekday: "short",
			});
			const month = currentDate.toLocaleString("en-US", {
				month: "short",
			});
			const date = currentDate.getDate();
			const hour = currentDate.getHours();
			const minute = currentDate.getMinutes();
			const ampm = hour >= 12 ? "PM" : "AM";
			const formattedHour = hour % 12 || 12;

			const formattedDateTime = `${day} ${month} ${date} | ${formattedHour}:${minute < 10 ? "0" : ""
				}${minute} ${ampm}`;

			day_time.innerHTML = formattedDateTime;

			temperature.innerHTML = `${parseInt(forecastData.current.temp)}°C`;
			const low_temp = parseInt(forecastData.daily[0].temp.min);
			const high_temp = parseInt(forecastData.daily[0].temp.max);
			const low_high_text = `L:${low_temp}  H:${high_temp}`;

			low_high.innerHTML = low_high_text;

			const rainVal = document.querySelector(
				".weather-details .rain-value"
			);
			const wsVal = document.querySelector(".weather-details .ws-value");
			const humditityVal = document.querySelector(
				".weather-details .humidity-value"
			);

			if (forecastData.current.rain) {
				rainVal.innerHTML = `${forecastData.current.rain}%`;
			} else if (forecastData.daily[0].rain) {
				rainVal.innerHTML = `${parseInt(forecastData.daily[0].rain)}%`;
			} else {
				rainVal.innerHTML = `${parseInt(forecastData.daily[0].pop)}%`;
			}

			humditityVal.innerHTML = `${forecastData.current.humidity}%`;
			wsVal.innerHTML = `${parseInt(
				forecastData.current.wind_speed * 3.6
			)}Km/h`;

			const morningHL = document.querySelector(".morning-hl");
			const afternoonHL = document.querySelector(".afternoon-hl");
			const eveningHL = document.querySelector(".evening-hl");
			const nightHL = document.querySelector(".night-hl");

			const morningTemp = parseFloat(forecastData.daily[0].temp.morn);
			const afternoonTemp = parseFloat(forecastData.daily[0].temp.day);
			const eveningTemp = parseFloat(forecastData.daily[0].temp.eve);
			const nightTemp = parseFloat(forecastData.daily[0].temp.night);

			morningHL.innerHTML = morningTemp;
			afternoonHL.innerHTML = afternoonTemp;
			eveningHL.innerHTML = eveningTemp;
			nightHL.innerHTML = nightTemp;

			if (forecastData && forecastData.hourly) {
				forecastData.hourly.forEach((data) => {
					const currTemp = data.temp;
					const iconCode = data.weather[0].icon;
					const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
					
					if (currTemp == morningTemp) {
						document.getElementById("morning-img").src = iconUrl;
					} else if (currTemp == afternoonTemp) {
						document.getElementById("afternoon-img").src = iconUrl;
					} else if (currTemp == eveningTemp) {
						document.getElementById("evening-img").src = iconUrl;
					} else if (currTemp == nightTemp) {
						document.getElementById("night-img").src = iconUrl;
					}
				});
			} else {
				console.log("Hourly forecast data is not available.");
			}

			weatherBox.style.display = ""; // restores its default display value.
			weatherDetails.style.display = "";
			weatherBox.classList.add("fadeIn");
			weatherDetails.classList.add("fadeIn");
			container.style.height = "640px";



			const weekForecastBtn = document.querySelector(".next-7-days-btn");

			const nextSevenDayContainer =
				document.querySelector(".next_seven_day");


			weekForecastBtn.addEventListener("click", () => {
				container.style.display = "none";
				nextSevenDayContainer.style.display = "block";

				// Event listener for the arrow container
				const arrowContainer = document.querySelector(".arrow-container");
				arrowContainer.addEventListener("click", () => {
					if (container.style.display === "none") {
						container.style.display = "block";
						nextSevenDayContainer.style.display = "none";
					} else {
						container.style.display = "none";
						nextSevenDayContainer.style.display = "block";
					}
				});

				const tomorrowIconCode = forecastData.daily[1].weather[0].icon;
				const tomorrowIconUrl = `http://openweathermap.org/img/wn/${tomorrowIconCode}@2x.png`;
				document.getElementById("tomorrow_img").src = tomorrowIconUrl;

				const tomTemp = document.getElementById("tom_temp");
				tomTemp.innerHTML = `${parseInt((forecastData.daily[1].temp.min + forecastData.daily[1].temp.max) / 2)}°`;

				const tomTempType = document.getElementById("tom_tempTyp");
				const description = forecastData.daily[1].weather[0].description;
				const capitalizedDescription = description
					.split(" ") // Split the string into an array of words
					.map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
					.join(" "); // Join the words back together into a single string

				tomTempType.innerHTML = capitalizedDescription;


				const tom_rain = document.getElementById("tom_rain");
				const tom_wind = document.getElementById("tom_wind");
				const tom_humidity = document.getElementById("tom_humidity");

				tom_rain.innerHTML = `${parseInt(forecastData.daily[1].rain)}%`;
				tom_wind.innerHTML = `${parseInt(forecastData.daily[1].wind_speed * 3.6)}Km/h`;
				tom_humidity.innerHTML = `${forecastData.daily[1].humidity}%`;

				forecastData.daily.slice(2, 7).forEach((dayForecast, index) => {
					const day = new Date(dayForecast.dt * 1000).toLocaleString("en-US", {
						weekday: "short",
					});

					const dayName = day;
					const dayImage = dayForecast.weather[0].icon;
					const dayType = dayForecast.weather[0].main;
					const dayHighTemp = dayForecast.temp.max;
					const dayLowTemp = dayForecast.temp.min;

					document.getElementById(`day_name_${index + 1}`).innerHTML = dayName;
					document.getElementById(`day_img_${index + 1}`).innerHTML = `<img src="http://openweathermap.org/img/wn/${dayImage}.png" alt="weather-icon">`;
					document.getElementById(`day_typ_${index + 1}`).innerHTML = dayType;
					document.getElementById(`day_ht_${index + 1}`).innerHTML = `${parseInt(dayHighTemp)}°C`;
					document.getElementById(`day_lt_${index + 1}`).innerHTML = `${parseInt(dayLowTemp)}°C`;
				});

			});
		});
}
