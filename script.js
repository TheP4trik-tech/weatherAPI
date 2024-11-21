import  './style.css';
"use strict"
import { fetchWeatherApi } from 'openmeteo';


// Parametry požadavku
const params = {
latitude: 49.8347,
longitude: 18.2820,
current: ["relative_humidity_2m", "apparent_temperature", "cloud_cover", "wind_speed_10m"],
hourly: [
	"temperature_2m",
	"relative_humidity_2m",
	"apparent_temperature",
	"rain",
	"surface_pressure",
	"visibility",
	"vapour_pressure_deficit",
	"wind_speed_10m",
	"soil_moisture_0_to_1cm",
	"uv_index",
].join(","), // Převod pole na čárkami oddělený řetězec
daily: ["apparent_temperature_min", "sunrise", "sunset", "uv_index_max"].join(","), // Převod pole na čárkami oddělený řetězec
forecast_days: 1,
forecast_hours: 24,
timezone: "Europe/Prague",
};

// Sestavení URL pomocí Template Literals
const fullUrl = `https://api.open-meteo.com/v1/forecast?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly}&daily=${params.daily}&forecast_days=${params.forecast_days}&forecast_hours=${params.forecast_hours}&timezone=${params.timezone}&current_weather=true`;

// Volání API pomocí fetch

const fetchWeatherData = async (fullUrl) => {
try {
	const response = await fetch(fullUrl);
	if (response) {
	const data = await response.json();
	console.log(data);
	return data;
	}
	
} catch (error) {
	console.error("Error fetching weather data:", error);

}
};
fetchWeatherData(fullUrl);

const hourTempArray = [];
(function selectElements(){
for(let i = 0; i <= 23; i++){
	const element = document.querySelector(`.forecast_temp_h${i}`);
	element ? hourTempArray.push(element) : console.warn(`Element with ID #forecast_temp_h${i} not found`);

}
})()

const response = await fetchWeatherData(fullUrl);

function setHourlyTemp(response, hourTempArray){
	if (!response || !response.hourly || !hourTempArray.length) {
		console.warn("Hourly temperature data or elements are missing.");
		return;
	}
	else{
		hourTempArray.forEach((element, i) => {
			console.log(element + i);
			hourTempArray[i].innerHTML = response.hourly.temperature_2m[i] + "°C";
		})
	}
}
setHourlyTemp(response, hourTempArray);

console.log(response.daily.sunset)

// This function only works with certain phenomenons(sun set, sun rise, apparent temp, UV index)

function displayDailyPhenomenon(element, response, phenomenon){
	let elementText = document.querySelector(".value." + element);
	if(!response){
		console.log("Sorry this phenomenon", element, "could be displayed");
		return
	}
	if(!elementText){
        console.error("Element not found with selector:", ".value." + element);
        return;
    }
	else{
		if(phenomenon === "sunset" || phenomenon === "sunrise"){
			const rawResponse = response.daily[phenomenon][0];
			const indexOfT = rawResponse.indexOf("T");
			const UIResponse = rawResponse.substring(indexOfT + 1); // Získá část po 'T'
        	elementText.innerHTML = UIResponse;
		}
		else{
		elementText.innerHTML = response.daily[phenomenon]
		}
	}
}

displayDailyPhenomenon("sunset", response,"sunset");
displayDailyPhenomenon("sunrise", response, "sunrise");
console.log(response.current_weather.time)
function displayCurrentPhenomenon(element, response, phenomenon, unit)
{	
	let elementText = document.querySelector(".value." + element);
	if(!response || !response.hourly){
		console.log("Sorry this phenomenon", element, "could be displayed");
		return
	}
	const rawResponse = response.current_weather.time;
	const dateTimeString = rawResponse;
	const [datePart, timePart] = dateTimeString.split('T'); 
	const [hour, minutes] = timePart.split(':'); 
	if (rawResponse) {
		elementText.innerHTML = response.hourly[phenomenon][hour] + unit;
	}

}
console.log(response.hourly.uv_index)
displayCurrentPhenomenon("uv", response, "uv_index", "")
displayCurrentPhenomenon("apparent_temp", response, "apparent_temperature", "°C");
displayCurrentPhenomenon("humidity", response, "relative_humidity_2m", "%");
displayCurrentPhenomenon("visibility", response, "visibility", "m");
displayCurrentPhenomenon("humidity", response, "relative_humidity_2m", "%");
displayCurrentPhenomenon("rain", response, "rain", "mm");


const range = (start,stop, step) =>
	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// Process first location. Add a for-loop for multiple locations or weather models


// Attributes for timezone and location
const utcOffsetSeconds = 3600
const timezone = response.timezone;
const timezoneAbbreviation = response.timezoneAbbreviation();
const latitude = response.latitude();
const longitude = response.longitude();

const current = response.current();
const hourly = response.hourly();
const daily = response.daily();

// Note: The order of weather variables in the URL query and the indices below need to match!
const weatherData = {
	current: {
		time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
		value: current.variables(0).value(),
		relativeHumidity2m: current.variables(1).value(),
		apparentTemperature: current.variables(1).value(),
		cloudCover: current.variables(2).value(),
		windSpeed10m: current.variables(3).value(),
	},
	hourly: {
		time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
			(t) => new Date((t + utcOffsetSeconds) * 1000)
		),
		temperature2m: hourly.variables(0).valuesArray(),
		relativeHumidity2m: hourly.variables(1).valuesArray(),
		apparentTemperature: hourly.variables(2).valuesArray(),
		rain: hourly.variables(3).valuesArray(),
		surfacePressure: hourly.variables(4).valuesArray(),
		visibility: hourly.variables(5).valuesArray(),
		vapourPressureDeficit: hourly.variables(6).valuesArray(),
		windSpeed10m: hourly.variables(7).valuesArray(),
		soilMoisture0To1cm: hourly.variables(8).valuesArray(),
		uvIndex: hourly.variables(9).valuesArray(),
	},
	daily: {
		time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
			(t) => new Date((t + utcOffsetSeconds) * 1000)
		),
		apparentTemperatureMin: daily.variables(0).valuesArray(),
		sunrise: daily.variables(1).valuesArray(),
		sunset: daily.variables(2).valuesArray(),
		uvIndexMax: daily.variables(3).valuesArray(),
	},

};

// `weatherData` now contains a simple structure with arrays for datetime and weather data
for (let i = 0; i < weatherData.hourly.time.length; i++) {
	console.log(
		weatherData.hourly.time[i].toISOString(),
		weatherData.hourly.temperature2m[i],
		weatherData.hourly.relativeHumidity2m[i],
		weatherData.hourly.apparentTemperature[i],
		weatherData.hourly.rain[i],
		weatherData.hourly.surfacePressure[i],
		weatherData.hourly.visibility[i],
		weatherData.hourly.vapourPressureDeficit[i],
		weatherData.hourly.windSpeed10m[i],
		weatherData.hourly.soilMoisture0To1cm[i],
		weatherData.hourly.uvIndex[i]
	);
}
for (let i = 0; i < weatherData.daily.time.length; i++) {
	console.log(
		weatherData.daily.time[i].toISOString(),
		weatherData.daily.apparentTemperatureMin[i],
		weatherData.daily.sunrise[i],
		weatherData.daily.sunset[i],
		weatherData.daily.uvIndexMax[i]
	);
}