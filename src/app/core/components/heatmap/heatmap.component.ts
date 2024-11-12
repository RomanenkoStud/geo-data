import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Geometry } from 'ol/geom';
import HeatmapLayer from 'ol/layer/Heatmap';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Map } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useGeographic } from 'ol/proj';

useGeographic();

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class HeatmapComponent implements OnChanges {
  private static readonly DEFAULT_FEATURE_PROJECTION = 'EPSG:3857';
  private static readonly DEFAULT_DATA_PROJECTION = 'EPSG:3857';

  private static readonly DEFAULT_ZOOM = 2;
  private static readonly DEFAULT_CENTER: [number, number] = [0, 0];

  @Input() data?: Object = {};
  @Input() blur: number = 10;
  @Input() radius: number = 10;

  @Input() zoom: number = HeatmapComponent.DEFAULT_ZOOM;
  @Input() center: [number, number] = HeatmapComponent.DEFAULT_CENTER;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private vectorSource = new VectorSource()

  private heatmapLayer = new HeatmapLayer({
    source: this.vectorSource,
    blur: this.blur,
    radius: this.radius,
  });

  private tileLayer = new TileLayer({
    source: new OSM(),
  });

  private view = new View({
    center: this.center,
    zoom: this.zoom,
  });

  private map = new Map({
    layers: [
      this.tileLayer,
      this.heatmapLayer,
    ],
    view: this.view,
  });

  private initializeMap(): void {
    // Attach the map to the container element
    this.map.setTarget(this.mapContainer.nativeElement);
  }

  private updateHeatmapData(): void {
    this.vectorSource.clear();

    const geoJson = new GeoJSON();
    const features = geoJson.readFeatures(this.data, {
      featureProjection: HeatmapComponent.DEFAULT_FEATURE_PROJECTION,
      dataProjection: HeatmapComponent.DEFAULT_DATA_PROJECTION,
    }) as Feature<Geometry>[];

    this.vectorSource.addFeatures(features);
  }

  private updateHeatmapLayer(): void {
    if (this.heatmapLayer) {
      this.heatmapLayer.setBlur(this.blur);
      this.heatmapLayer.setRadius(this.radius);
    }
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateHeatmapData();
    }

    if (changes['blur'] || changes['radius']) {
      this.updateHeatmapLayer();
    }

    if (changes['zoom']) {
      this.view.setZoom(this.zoom);
    }

    if (changes['center']) {
      this.view.setCenter(this.center);
    }
  }
}
