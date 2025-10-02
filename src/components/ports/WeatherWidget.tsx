'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Droplets,
  Wind,
  Eye,
  Sun,
  CloudRain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/lib/ports/types';
import { getWeatherIcon, getWeatherDescription } from '@/lib/ports/utils';
import { useState, useEffect } from 'react';

interface WeatherWidgetProps {
  portLat: number;
  portLng: number;
  portName: string;
  className?: string;
}

export function WeatherWidget({ portLat, portLng, portName, className }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/weather?lat=${portLat}&lng=${portLng}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [portLat, portLng]);

  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-primary" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading weather data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-primary" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-3">
              Unable to load weather data
            </p>
            <Button variant="outline" onClick={fetchWeatherData} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current } = weatherData;
  const weatherIcon = getWeatherIcon(current.condition_code);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{weatherIcon.icon}</span>
            Weather
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeatherData}
            className="p-1"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {weatherData.location.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
          <div className={cn('text-4xl mb-2', weatherIcon.color)}>
            {weatherIcon.icon}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{current.temperature}°C</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Feels like {current.feels_like}°C
            </p>
            
            <p className="text-sm font-medium">
              {weatherIcon.description}
            </p>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium">{current.wind_speed} mph</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium">{current.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{current.visibility} km</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-sm font-medium">{current.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Wind Direction */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Wind Direction:</span>
          </div>
          <div className="relative w-16 h-16 mx-auto">
            <div 
              className="absolute inset-0 border-2 border-gray-300 rounded-full flex items-center justify-center"
              style={{
                transform: `rotate(${current.wind_direction}deg)`
              }}
            >
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium">
                {Math.round(current.wind_direction)}°
              </span>
            </div>
          </div>
        </div>

        {/* Gust */}
        {current.gust_speed && (
          <div className="flex items-center justify-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
            <Wind className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Gusts up to {current.gust_speed} mph
            </span>
          </div>
        )}

        {/* 5-Day Forecast */}
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">5-Day Forecast</h4>
            <div className="space-y-2">
              {weatherData.forecast.slice(0, 5).map((day, index) => {
                const dayIcon = getWeatherIcon(day.condition_code);
                const dayName = index === 0 ? 'Today' : 
                  new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{dayName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dayIcon.icon}</span>
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {day.temperature.max}°/{day.temperature.min}°
                        </div>
                                        <div className="text-xs text-muted-foreground">
                          {Math.round(day.precipitation_chance)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(weatherData.last_updated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeatherMiniWidget({ 
  portLat, 
  portLng, 
  portName 
}: { 
  portLat: number;
  portLng: number;
  portName: string;
}) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?lat=${portLat}&lng=${portLng}`);
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
  }, [portLat, portLng]);

  if (!weatherData) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
        <CloudRain className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const { current } = weatherData;
  const weatherIcon = getWeatherIcon(current.condition_code);

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <span className="text-2xl">{weatherIcon.icon}</span>
      <div>
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          <span className="font-medium">{current.temperature}°C</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {weatherIcon.description}
        </p>
      </div>
    </div>
  );
}
