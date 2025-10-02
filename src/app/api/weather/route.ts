import { NextRequest, NextResponse } from 'next/server';
import type { WeatherData } from '@/lib/ports/types';

// Cache for weather data (in production, use Redis or similar)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const portId = searchParams.get('portId');
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Create cache key
    const cacheKey = `${lat},${lng}`;
    
    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Fetch from OpenWeather API
    const weatherData = await fetchWeatherData(parseFloat(lat), parseFloat(lng));
    
    if (!weatherData) {
      return NextResponse.json(
        { error: 'Unable to fetch weather data' },
        { status: 500 }
      );
    }
    
    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });
    
    return NextResponse.json(weatherData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.error('OpenWeather API key not configured');
    return null;
  }
  
  try {
    // Fetch current weather and 5-day forecast
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    // Parse current weather
    const currentWeather = currentData.weather[0];
    
    return {
      port_id: `port_${lat}_${lng}`, // Temporary ID
      current: {
        temperature: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility ? Math.round(currentData.visibility / 1000) : 0,
        uv_index: 0, // Would need separate UV API call
        condition: currentWeather.description,
        condition_code: currentWeather.icon,
        wind_speed: Math.round(currentData.wind.speed * 2.237), // Convert m/s to mph
        wind_direction: currentData.wind.deg || 0,
        gust_speed: currentData.wind.gust ? Math.round(currentData.wind.gust * 2.237) : undefined,
      },
      forecast: parseForecast(forecastData.list),
      location: {
        name: currentData.name,
        country: currentData.sys.country,
        latitude: lat,
        longitude: lng,
      },
      last_updated: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

function parseForecast(forecastList: any[]): Array<{
  date: string;
  temperature: { min: number; max: number };
  condition: string;
  condition_code: string;
  precipitation_chance: number;
  wind_speed: number;
  wind_direction: number;
}> {
  // Group forecast by day
  const dailyForecast: Record<string, any[]> = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyForecast[date]) {
      dailyForecast[date] = [];
    }
    dailyForecast[date].push(item);
  });
  
  // Process each day
  return Object.entries(dailyForecast).map(([date, dayItems]) => {
    const temperatures = dayItems.map(item => item.main.temp);
    const mainCondition = dayItems[Math.floor(dayItems.length / 2)]; // Use midday forecast
    const avgWindSpeed = dayItems.reduce((sum, item) => sum + (item.wind.speed || 0), 0) / dayItems.length;
    const avgWindDirection = dayItems.reduce((sum, item) => sum + (item.wind.deg || 0), 0) / dayItems.length;
    
    return {
      date,
      temperature: {
        min: Math.round(Math.min(...temperatures)),
        max: Math.round(Math.max(...temperatures)),
      },
      condition: mainCondition.weather[0].description,
      condition_code: mainCondition.weather[0].icon,
      precipitation_chance: dayItems.reduce((sum, item) => sum + (item.pop || 0) * 100, 0) / dayItems.length,
      wind_speed: Math.round(avgWindSpeed * 2.237),
      wind_direction: Math.round(avgWindDirection),
    };
  }).slice(0, 5); // Limit to 5 days
}
