import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type GeodeticCoordinates = {
  longitude: number,
  latitude: number,
};

type TimeSpan = {
  startTime: string,
  endTime: string,
};

interface WeatherDataPoint {
  timestamp: string;
  temperature: number;
}

interface StateWeatherData {
  state: string;
  weatherData: WeatherDataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  http = inject(HttpClient);

  apiEndpointUrl  = 'https://api.open-meteo.com/v1/forecast';
  options = {
    format: 'json',
    hourly: 'temperature_2m',
    current: 'temperature_2m',
  }

  constructor() { }

  getWeatherData(coordinates: GeodeticCoordinates[], timeSpan?: TimeSpan): Observable<any> {
    const params = new URLSearchParams({
      ...this.options,
      longitude: coordinates.map(value => value.longitude).join(','),
      latitude: coordinates.map(value => value.latitude).join(','),
      ...(!!timeSpan ? {
        start: timeSpan.startTime, end: timeSpan.endTime,
      } : {})
    })
    return this.http.get(`${this.apiEndpointUrl}?${params}`);
  }
}
