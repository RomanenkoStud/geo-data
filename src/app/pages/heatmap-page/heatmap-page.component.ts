import { Component, inject } from '@angular/core';
import { GeodataService } from '../../services/geodata.service';
import { HeatmapComponent } from '../../core/components/heatmap/heatmap.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-heatmap-page',
  standalone: true,
  imports: [HeatmapComponent, FormsModule],
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

  blur = 10;
  radius = 10;

  loadData() {
    this.dataService.getExampleGeoJsonData(this.selected)
      .subscribe(data => this.data = data);
  }

  onFetchData() {
    this.loadData();
  }

  ngOnInit(): void {
    this.loadData();
  }
}
