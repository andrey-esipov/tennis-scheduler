const WEATHER_URL = "https://wttr.in/Franklin,TN?format=j1";

export async function getWeather() {
  try {
    const response = await fetch(WEATHER_URL);
    const data = await response.json();
    const current = data.current_condition?.[0];
    const forecast = (data.weather || []).slice(0, 3).map((day) => {
      const chance = Math.max(
        ...day.hourly.map((hour) => Number(hour.chanceofrain || 0))
      );
      return {
        date: day.date,
        avgTemp: day.avgtempF,
        minTemp: day.mintempF,
        maxTemp: day.maxtempF,
        desc: day.hourly?.[4]?.weatherDesc?.[0]?.value || "",
        chanceOfRain: chance,
      };
    });

    return {
      temp: current?.temp_F || "--",
      desc: current?.weatherDesc?.[0]?.value || "",
      forecast,
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return null;
  }
}

export function isRainyForecast(weather) {
  if (!weather) return false;
  return weather.forecast.some((day) => day.chanceOfRain >= 50);
}
