import { Component, inject } from '@angular/core';
import { GeodataService } from '../../services/geodata.service';
import { ChoroplethComponent } from '../../core/components/choropleth/choropleth.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-choropleth-page',
  standalone: true,
  imports: [ChoroplethComponent, FormsModule],
  templateUrl: './choropleth-page.component.html',
  styleUrl: './choropleth-page.component.css'
})
export class ChoroplethPageComponent {
  private readonly EXAMPLE_NAME = 'age';

  dataService = inject(GeodataService);
  data?: Object;

  featureName: string = 'age';
  labelProperty: string = 'NAME_ENGL';
  colorMap = {
    30: '#8c2d04',
    29: '#d94801',
    28: '#f16913',
    27: '#fd8d3c',
    26: '#fdae6b',
    25: '#fdd0a2',
    24: '#fee6ce',
  };
  colorMapString: string = JSON.stringify(this.colorMap, null, 2);

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
  }

  ngOnInit(): void {
    this.loadData();
  }

  onColorMapChange() {
    try {
      this.colorMap = JSON.parse(this.colorMapString);
    } catch (e) {
      console.error('Invalid JSON:', e);
    }
  }
}
