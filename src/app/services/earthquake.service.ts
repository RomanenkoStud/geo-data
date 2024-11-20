import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, switchMap, map, shareReplay, catchError } from 'rxjs';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

type TimeSpan = {
  startTime: string,
  endTime: string,
};

const currentTime = new Date();
const DEFAULTS = {
  startTime: new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000),
  endTime: currentTime,
  frame: 1000 * 60 * 60, // in ms
}

@Injectable({
  providedIn: 'root'
})
export class EarthquakeService {
  http = inject(HttpClient);
  apiEndpointUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query";
  options = {
    format: 'geojson',
  };


  cachedFeatures$?: Observable<Feature<Geometry>[]>;
  cachedFeatureFrames$?: Observable<([string, Feature<Geometry>[]])[]>;

  constructor() {
    this.initializeCaches();
  }

  private initializeCaches(): void {
    this.cachedFeatures$ = this.getEarthquakeData().pipe(
      map(data => {
        const geoJson = new GeoJSON();
        return geoJson.readFeatures(data) as Feature<Geometry>[];
      }),
      shareReplay(1)
    );
    this.cachedFeatureFrames$ = this.cachedFeatures$.pipe(
      map(features => {
        const frames: { [key: string]: Feature<Geometry>[] } = {};
        const frameDuration = DEFAULTS.frame;
        const startTime = DEFAULTS.startTime.getTime();
        const endTime = DEFAULTS.endTime.getTime();
        for (let time = startTime; time <= endTime; time += frameDuration) {
          frames[time] = [];
        }

        features.forEach(feature => {
          const time = feature.get('time'); // Assuming 'time' is a property in milliseconds
          if (time >= startTime && time <= endTime) {
            const frameKey = Math.floor((time - startTime) / frameDuration) * frameDuration + startTime;
            if (frames[frameKey]) {
              frames[frameKey].push(feature);
            }
          }
        });

        return Object.entries(frames)
          .sort(([a], [b]) => +a - +b);
      }),
      shareReplay(1)
    );
  }

  private getEarthquakeData(timeSpan?: TimeSpan): Observable<any> {
    const params = new URLSearchParams({
      ...this.options,
      ...(!!timeSpan ? {
        starttime: timeSpan.startTime, endtime: timeSpan.endTime,
      } : {})
    })
    return this.http.get(`${this.apiEndpointUrl}?${params}`);
  }

  getEarthquakeDataFrame(index: number = 0): Observable<any> {
    return forkJoin({
      cachedFeatures: this.cachedFeatures$!,
      cachedFeatureFrames: this.cachedFeatureFrames$!,
    }).pipe(
      switchMap(({cachedFeatureFrames}) => {
        let [time, frames] = cachedFeatureFrames[index];
        let length = cachedFeatureFrames.length;
        return of({
          features: frames,
          index: index === length - 1? 0 : ++index,
          currentTime: new Date(Number(time)).toISOString(),
        });
      })
    );
  }
}
