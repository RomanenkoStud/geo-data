import { Component, inject } from '@angular/core';
import { HeatmapComponent } from '../../core/components/heatmap/heatmap.component';
import { FormsModule } from '@angular/forms';
import { DemoLayoutComponent } from '../../layouts/demo-layout/demo-layout.component';
import GeoJSON from 'ol/format/GeoJSON';
import { interval, Subject, switchMap, takeWhile, tap } from 'rxjs';
import { EarthquakeService } from '../../services/earthquake.service';

type Options = {
  blur: number,
  radius: number,
  center: [number, number],
  zoom: number
}

const DEFAULT_VALUES: Options = {
  blur: 10,
  radius: 10,
  center: [0, 0],
  zoom: 1
};

@Component({
  selector: 'app-heatmap-playback-page',
  standalone: true,
  imports: [HeatmapComponent, FormsModule, DemoLayoutComponent],
  templateUrl: './heatmap-playback-page.component.html',
  styleUrl: './heatmap-playback-page.component.css'
})
export class HeatmapPlaybackPageComponent {
  data?: Object;
  earthquakeService = inject(EarthquakeService);
  nextIndex?: number;
  time?: string;
  speed: number = 10;

  blur!: Options["blur"];
  radius!: Options["radius"];
  center!: Options["center"];
  zoom!: Options["zoom"];

  startPlayback$ = new Subject<void>();

  updateCenterX(newX: number) {
    this.center = [newX, this.center[1]];
  }

  updateCenterY(newY: number) {
    this.center = [this.center[0], newY];
  }

  loadEarthquakeData(): void {
    this.startPlayback$
      .pipe(
        switchMap(() =>
          interval(10000/this.speed).pipe( // Trigger every 500ms
            switchMap(() => this.earthquakeService.getEarthquakeDataFrame(this.nextIndex)),
            tap(data => {
              const geojson = new GeoJSON();
              this.nextIndex = data.index;
              this.data = geojson.writeFeatures(data.features);
              this.time = data.currentTime;
            }),
            takeWhile(() => this.nextIndex !== 0) // Stop when nextIndex is 0
          )
        )
      )
      .subscribe({
        error: (err) => console.error('Error loading earthquake data:', err),
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
    this.loadEarthquakeData();
  }

  setDefaults() {
    this.blur = DEFAULT_VALUES.blur;
    this.radius = DEFAULT_VALUES.radius;
    this.center = DEFAULT_VALUES.center;
    this.zoom = DEFAULT_VALUES.zoom;
  }

  constructor() {
    this.setDefaults();
  }
}
