import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, switchMap, map, shareReplay, catchError } from 'rxjs';
import { GeodataService } from './geodata.service';
import { WeatherService } from './weather.service';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

@Injectable({
  providedIn: 'root'
})
export class WeatherGeodataService {
  geodataService = inject(GeodataService);
  weatherService = inject(WeatherService);

  cachedFeatures$?: Observable<Feature<Geometry>[]>;
  stateCentroids$?: Observable<{ [stateName: string]: { latitude: number; longitude: number } }>;

  cachedWeather$?: Observable<any>;

  constructor() {
    this.initializeCaches();
  }

  private initializeCaches(): void {
    this.cachedFeatures$ = this.geodataService.getExampleGeoJsonData('us-states').pipe(
      map(data => {
        const geoJson = new GeoJSON();
        return geoJson.readFeatures(data) as Feature<Geometry>[];
      }),
      shareReplay(1)
    );

    this.stateCentroids$ = this.cachedFeatures$.pipe(
      map(features => this.extractStateCentroids(features)),
      shareReplay(1)
    );

    this.cachedWeather$ = forkJoin({
      cachedFeatures: this.cachedFeatures$!,
      stateCentroids: this.stateCentroids$!,
    }).pipe(
      switchMap(({ stateCentroids }) => {
        const stateCoordinates = Object.entries(stateCentroids).map(([state, coordinates]) => ({
          state,
          coordinates,
        }));

        return this.weatherService.getWeatherData(stateCoordinates.map((entry) => entry.coordinates)).pipe(
          map((weatherData) => {
            return this.mapWeatherDataToStates(weatherData, stateCentroids);
          }),
          catchError((error) => {
            return of(null);
          })
        );
      }),
      shareReplay(1)
    );
  }

  private mapWeatherDataToStates(weatherData: any[], stateCentroids: { [state: string]: { latitude: number; longitude: number } }): { [state: string]: any } {
    const weatherEntries = Object.entries(stateCentroids).map(([state, coordinates]) => {
      const weatherInState = weatherData.find((value: any) => {
        const { longitude, latitude } = value as { longitude: number; latitude: number };
        return (
          +coordinates.longitude.toPrecision(2) === +longitude.toPrecision(2) &&
          +coordinates.latitude.toPrecision(2) === +latitude.toPrecision(2)
        );
      });
      return [state, weatherInState];
    });

    return Object.fromEntries(weatherEntries);
  }

  private extractStateCentroids(features: Feature[]): { [stateName: string]: { latitude: number; longitude: number } } {
    const centroids: { [stateName: string]: { latitude: number; longitude: number } } = {};

    features.forEach((feature: Feature) => {
      const stateName = feature.get("STATE_NAME");
      const flatCoordinates = (feature.getGeometry() as any)['flatCoordinates'];

      if (flatCoordinates && flatCoordinates.length > 0) {
        centroids[stateName] = this.calculateCentroid(flatCoordinates);
      }
    });

    return centroids;
  }

  private calculateCentroid(coordinates: number[]): { latitude: number; longitude: number } {
    let totalX = 0, totalY = 0, totalPoints = 0;

    for (let i = 0; i < coordinates.length; i += 2) {
      const lon = coordinates[i];     // Longitude is at even indices
      const lat = coordinates[i + 1]; // Latitude is at odd indices
      totalX += lon;
      totalY += lat;
      totalPoints += 1;
    }

    return {
      longitude: totalX / totalPoints,
      latitude: totalY / totalPoints,
    };
  }

  getWeatherData(index: number = 0): Observable<any> {
    return forkJoin({
      cachedFeatures: this.cachedFeatures$!,
      cachedWeather: this.cachedWeather$!,
    }).pipe(
      switchMap(({ cachedFeatures, cachedWeather }) => {
        if (!cachedWeather) {
          // If weather data is not available, return features without temperature
          return of({
            featuresWithTemperature: cachedFeatures,
            index: undefined,
            currentTime: null,
          });
        }

        let currentTime;
        let length!: number;
        const featuresWithTemperature = cachedFeatures.map(feature => {
          const duplicate = new Feature(feature.getGeometry());
          const state = feature.get("STATE_NAME");
          currentTime = cachedWeather[state].hourly.time[index];
          length = cachedWeather[state].hourly.time.length;
          duplicate.setProperties({
            STATE_NAME: state,
            TEMPERATURE: cachedWeather[state].hourly.temperature_2m[index],
          });
          return duplicate;
        });
        return of({
          featuresWithTemperature,
          index: index === length - 1? 0 : ++index,
          currentTime: currentTime,
        });
      })
    );
  }
}
