import { Component, inject } from '@angular/core';
import { GeodataService } from '../../services/geodata.service';
import { HeatmapComponent } from '../../core/components/heatmap/heatmap.component';
import { FormsModule } from '@angular/forms';
import { DemoLayoutComponent } from '../../layouts/demo-layout/demo-layout.component';

type Options = {
  blur: number,
  radius: number,
  center: [number, number],
  zoom: number
}

const DEFAULT_VALUES: Record<("trees" | "earthquake"), Options> = {
  "trees": {
    blur: 10,
    radius: 1.5,
    center: [-1, 53.95],
    zoom: 10
  },
  "earthquake": {
    blur: 10,
    radius: 10,
    center: [0, 0],
    zoom: 1
  }
};

@Component({
  selector: 'app-heatmap-page',
  standalone: true,
  imports: [HeatmapComponent, FormsModule, DemoLayoutComponent],
  templateUrl: './heatmap-page.component.html',
  styleUrl: './heatmap-page.component.css'
})
export class HeatmapPageComponent {
  dataService = inject(GeodataService);
  data?: Object;

  readonly EXAMPLES: ("trees" | "earthquake")[] = [
    "earthquake",
    "trees",
  ];
  selected = this.EXAMPLES[0];

  blur!: Options["blur"];
  radius!: Options["radius"];
  center!: Options["center"];
  zoom!: Options["zoom"];

  updateCenterX(newX: number) {
    this.center = [newX, this.center[1]];
  }

  updateCenterY(newY: number) {
    this.center = [this.center[0], newY];
  }

  loadData() {
    this.dataService.getExampleGeoJsonData(this.selected)
      .subscribe(data => this.data = data);
  }

  setDefaults() {
    const defaults = DEFAULT_VALUES[this.selected];
    this.blur = defaults.blur;
    this.radius = defaults.radius;
    this.center = defaults.center;
    this.zoom = defaults.zoom;
  }

  onFetchData() {
    this.loadData();
    this.setDefaults();
  }

  ngOnInit(): void {
    this.loadData();
  }

  constructor() {
    this.setDefaults();
  }
}
