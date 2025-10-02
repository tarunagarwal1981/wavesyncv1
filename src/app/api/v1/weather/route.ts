import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { weatherLocationSchema, weatherForecastSchema } from '@/lib/api/validation';
import { WeatherData } from '@/lib/api/types';

// Mock weather service - replace with actual weather API
class WeatherService {
  private apiKey = process.env.WEATHER_API_KEY;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    if (!this.apiKey) {
      // Return mock data for development
      return this.getMockWeatherData(lat, lon);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData(lat, lon);
    }
  }

  async getForecast(lat: number, lon: number, days: number = 3): Promise<any> {
    if (!this.apiKey) {
      return this.getMockForecastData(lat, lon, days);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`
      );

      if (!response.ok) {
        throw new Error('Weather forecast service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Weather forecast API error:', error);
      return this.getMockForecastData(lat, lon, days);
    }
  }

  private getMockWeatherData(lat: number, lon: number) {
    return {
      coord: { lat, lon },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: {
        temp: 22,
        feels_like: 24,
        temp_min: 20,
        temp_max: 25,
        pressure: 1013,
        humidity: 65,
      },
      wind: { speed: 3.5, deg: 180 },
      name: 'Mock Location',
    };
  }

  private getMockForecastData(lat: number, lon: number, days: number) {
    const forecasts = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        main: { temp_max: 25 + Math.random() * 5, temp_min: 20 + Math.random() * 5 },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
      });
    }

    return { list: forecasts };
  }
}

const weatherService = new WeatherService();

// Current weather handler
async function getCurrentWeatherHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = {
      latitude: parseFloat(searchParams.get('lat') || '0'),
      longitude: parseFloat(searchParams.get('lon') || '0'),
    };

    const validatedLocation = weatherLocationSchema.parse(location);

    const weatherData = await weatherService.getCurrentWeather(
      validatedLocation.latitude,
      validatedLocation.longitude
    );

    const response: WeatherData = {
      location: {
        name: weatherData.name || 'Unknown Location',
        country: 'Unknown',
        coordinates: {
          latitude: weatherData.coord.lat,
          longitude: weatherData.coord.lon,
        },
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('Current weather error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch weather'), 500);
  }
}

// Weather forecast handler
async function getWeatherForecastHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = {
      latitude: parseFloat(searchParams.get('lat') || '0'),
      longitude: parseFloat(searchParams.get('lon') || '0'),
    };
    const locationName = searchParams.get('location') || 'Unknown';
    const days = parseInt(searchParams.get('days') || '3');

    const validatedLocation = weatherLocationSchema.parse(location);
    const forecastData = await weatherService.getForecast(
      validatedLocation.latitude,
      validatedLocation.longitude,
      days
    );

    // Get current weather as well
    const currentWeather = await weatherService.getCurrentWeather(
      validatedLocation.latitude,
      validatedLocation.longitude
    );

    const response: WeatherData = {
      location: {
        name: locationName,
        country: 'Unknown',
        coordinates: {
          latitude: validatedLocation.latitude,
          longitude: validatedLocation.longitude,
        },
      },
      current: {
        temperature: Math.round(currentWeather.main.temp),
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure,
        windSpeed: currentWeather.wind.speed,
        windDirection: currentWeather.wind.deg,
        description: currentWeather.weather[0].description,
        icon: currentWeather.weather[0].icon,
      },
      forecast: forecastData.list.slice(0, days).map((item: any) => ({
        date: item.date,
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })),
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('Weather forecast error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch weather forecast'), 500);
  }
}

// Create handlers with middleware
const currentWeatherHandler = createApiHandler(getCurrentWeatherHandler, {
  rateLimit: 100, // Weather requests are frequent
});

const forecastWeatherHandler = createApiHandler(getWeatherForecastHandler, {
  rateLimit: 50,
});

export { currentWeatherHandler as GET };
export { forecastWeatherHandler as POST }; // Use POST for forecast with body params
