import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GeodataService {
  http = inject(HttpClient);
  exampleEndpointUrl: string;

  constructor(location:Location) {
    this.exampleEndpointUrl = location.prepareExternalUrl("/data/example");
  }

  getExampleGeoJsonData(name: "trees" | "earthquake" | "age"): Observable<any> {
    return this.getGeoJsonData(`${this.exampleEndpointUrl}/${name}.geojson`);
  }

  getGeoJsonData(url: string): Observable<any> {
    return this.http.get(url);
  }
}
