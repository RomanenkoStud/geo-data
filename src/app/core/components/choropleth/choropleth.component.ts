import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Map } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';

@Component({
  selector: 'app-choropleth',
  standalone: true,
  imports: [],
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ChoroplethComponent implements OnChanges {
  private static readonly DEFAULT_FEATURE_PROJECTION = 'EPSG:3857';
  private static readonly DEFAULT_DATA_PROJECTION = 'EPSG:4326';

  private static readonly DEFAULT_FEATURE_COLOR = '#FFFFFF';
  private static readonly DEFAULT_OUTLINE_COLOR = '#000000';
  private static readonly DEFAULT_TEXT_COLOR = '#FFFFFF';

  @Input() outlineColor: string = ChoroplethComponent.DEFAULT_OUTLINE_COLOR;
  @Input() textColor: string = ChoroplethComponent.DEFAULT_TEXT_COLOR;

  @Input({required: true}) featureName!: string;
  @Input({required: true}) colorMap!: { [key: number]: string };
  @Input({required: true}) labelProperty!: string;
  @Input() data?: Object = {};
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;


  constructor() {}

  private vectorSource = new VectorSource();

  private sortedThresholds: number[] = [];

  private mapColor(feature: Feature): string {
    const value = feature.get(this.featureName);
    for (let threshold of this.sortedThresholds) {
      if (value >= threshold) {
        return this.colorMap[threshold];
      }
    }
    return ChoroplethComponent.DEFAULT_FEATURE_COLOR;
  }

  private styleFunction = (feature: Feature): Style[] => {
    const outline = new Stroke({
      color: this.outlineColor,
      width: 0.7,
    });
    const bg = new Fill({
      color: this.mapColor(feature),
    });
    const text = new Text({
      text: feature.get(this.labelProperty),
      fill: new Fill({
        color: this.textColor,
      }),
      stroke: new Stroke({
        color: this.outlineColor,
        width: 2,
      }),
    });
    return  [
        new Style({
          stroke: outline,
          fill: bg,
          text: text
        }),
      ];
  };

  private choroplethLayer = new VectorLayer({
    source: this.vectorSource,
    style: this.styleFunction as StyleFunction
  });

  private tileLayer = new TileLayer({
    source: new OSM(),
  });

  private view = new View({
    center: [0, 0],
    zoom: 2,
  });

  private map = new Map({
    layers: [this.tileLayer, this.choroplethLayer],
    view: this.view,
  });

  private initializeMap(): void {
    this.map.setTarget(this.mapContainer.nativeElement);
  }

  private updateHeatmapData(): void {
    this.vectorSource.clear();

    const geoJson = new GeoJSON();
    const features = geoJson.readFeatures(this.data, {
      featureProjection: ChoroplethComponent.DEFAULT_FEATURE_PROJECTION,
      dataProjection: ChoroplethComponent.DEFAULT_DATA_PROJECTION,
    }) as Feature<Geometry>[];

    this.vectorSource.addFeatures(features);
  }

  private updateThresholds(): void {
    this.sortedThresholds = Object.keys(this.colorMap)
      .map(key => Number(key))
      .sort((a, b) => b - a);
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateHeatmapData();
    }

    if (changes['colorMap'] && this.colorMap) {
      this.updateThresholds();
    }

    if (changes['colorMap'] ||
        changes['featureName'] ||
        changes['labelProperty']) {
      this.choroplethLayer.changed();
    }
  }
}
