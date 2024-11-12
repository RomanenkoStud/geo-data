import { Component, inject } from '@angular/core';
import { GeodataService } from '../../services/geodata.service';
import { ChoroplethComponent } from '../../core/components/choropleth/choropleth.component';
import { FormsModule } from '@angular/forms';
import { DemoLayoutComponent } from '../../layouts/demo-layout/demo-layout.component';

type Options = {
  labelProperty: string,
  featureName: string,
  colorMap: Record<string, string>,
  center: [number, number],
  zoom: number
}

const DEFAULT_VALUES: Record<("age"), Options> = {
  "age": {
    featureName: 'age',
    labelProperty: 'NAME_ENGL',
    colorMap: {
      30: '#8c2d04',
      29: '#d94801',
      28: '#f16913',
      27: '#fd8d3c',
      26: '#fdae6b',
      25: '#fdd0a2',
      24: '#fee6ce',
    },
    center: [15, 47],
    zoom: 3
  },
};

@Component({
  selector: 'app-choropleth-page',
  standalone: true,
  imports: [ChoroplethComponent, FormsModule, DemoLayoutComponent],
  templateUrl: './choropleth-page.component.html',
  styleUrl: './choropleth-page.component.css'
})
export class ChoroplethPageComponent {
  dataService = inject(GeodataService);
  data?: Object;

  featureName!: Options["featureName"];
  labelProperty!: Options["labelProperty"];
  colorMap!: Options["colorMap"];
  colorMapString!: string;
  center!: Options["center"];
  zoom!: Options["zoom"];

  updateCenterX(newX: number) {
    this.center = [newX, this.center[1]];
  }

  updateCenterY(newY: number) {
    this.center = [this.center[0], newY];
  }

  readonly EXAMPLES: ("age")[] = [
    "age",
  ];
  selected = this.EXAMPLES[0];

  loadData() {
    this.dataService.getExampleGeoJsonData(this.selected)
      .subscribe(data => this.data = data);
  }

  onFetchData() {
    this.loadData();
    this.setDefaults();
  }

  ngOnInit(): void {
    this.loadData();
  }

  setDefaults() {
    const defaults = DEFAULT_VALUES[this.selected];
    this.featureName = defaults.featureName;
    this.labelProperty = defaults.labelProperty;
    this.colorMap = defaults.colorMap;
    this.center = defaults.center;
    this.zoom = defaults.zoom;

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
