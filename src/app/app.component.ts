import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeatmapComponent } from "./core/components/heatmap/heatmap.component";
import { GeodataService } from './services/geodata.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeatmapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'geo-data';
  dataService = inject(GeodataService);
  data?: Object;

  constructor() {
    this.dataService.getGeoJsonData("earthquake")
      .subscribe(data => {
        this.data = data;
      });
  }
}
