import { Component, inject } from '@angular/core';
import { ChoroplethComponent } from '../../core/components/choropleth/choropleth.component';
import { FormsModule } from '@angular/forms';
import { DemoLayoutComponent } from '../../layouts/demo-layout/demo-layout.component';
import { WeatherGeodataService } from '../../services/weather-geodata.service';
import GeoJSON from 'ol/format/GeoJSON';
import { interval, Subject, switchMap, takeWhile, tap } from 'rxjs';

type Options = {
  labelProperty: string,
  featureName: string,
  colorMap: Record<string, string>,
  center: [number, number],
  zoom: number
}

const DEFAULT_VALUES: Options = {
  featureName: 'TEMPERATURE',
  labelProperty: 'STATE_NAME',
  colorMap: {
    '-20': "#FFEDA1",
    '-10': "#FFEDA0",
    '-5': "#FED976",
    '-2.5': "#FEB24C",
    '0': "#FD8D3C",
    '2.5': "#FC4E2A",
    '5': "#E31A1C",
    '10': "#BD0026",
    '15': "#800026",
  },
  center: [-100, 37],
  zoom: 3.5
};

@Component({
  selector: 'app-choropleth-page',
  standalone: true,
  imports: [ChoroplethComponent, FormsModule, DemoLayoutComponent],
  templateUrl: './choropleth-playback-page.component.html',
  styleUrl: './choropleth-playback-page.component.css'
})
export class ChoroplethPlaybackPageComponent {
  data?: Object;
  weatherService = inject(WeatherGeodataService);
  nextIndex?: number;
  time?: string;
  speed: number = 10;

  featureName!: Options["featureName"];
  labelProperty!: Options["labelProperty"];
  colorMap!: Options["colorMap"];
  colorMapString!: string;
  center!: Options["center"];
  zoom!: Options["zoom"];

  startPlayback$ = new Subject<void>();

  updateCenterX(newX: number) {
    this.center = [newX, this.center[1]];
  }

  updateCenterY(newY: number) {
    this.center = [this.center[0], newY];
  }

  loadWeatherData(): void {
    this.startPlayback$
      .pipe(
        switchMap(() =>
          interval(10000/this.speed).pipe( // Trigger every 500ms
            switchMap(() => this.weatherService.getWeatherData(this.nextIndex)),
            tap(data => {
              const geojson = new GeoJSON();
              this.nextIndex = data.index;
              this.data = geojson.writeFeatures(data.featuresWithTemperature);
              this.time = data.currentTime;
            }),
            takeWhile(() => this.nextIndex !== 0) // Stop when nextIndex is 0
          )
        )
      )
      .subscribe({
        error: (err) => console.error('Error loading weather data:', err),
        complete: () => {
          console.log('Playback completed. Waiting for resume...');
        },
      });

    // Initial trigger
    this.startPlayback$.next();
  }

  resumePlayback() {
    this.startPlayback$.next();
  }

  onChangeSpeed(newSpeed: number) {
    this.speed = newSpeed; // Update the speed
    this.startPlayback$.next();
  }

  ngOnInit(): void {
    this.loadWeatherData();
  }

  setDefaults() {
    this.featureName = DEFAULT_VALUES.featureName;
    this.labelProperty = DEFAULT_VALUES.labelProperty;
    this.colorMap = DEFAULT_VALUES.colorMap;
    this.center = DEFAULT_VALUES.center;
    this.zoom = DEFAULT_VALUES.zoom;

    this.colorMapString = JSON.stringify(this.colorMap, null, 2);
  }

  onColorMapChange() {
    try {
      this.colorMap = JSON.parse(this.colorMapString);
    } catch (e) {
      console.error('Invalid JSON:', e);
    }
  }

  constructor() {
    this.setDefaults();
  }
}
