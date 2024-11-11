import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeodataService {
  http = inject(HttpClient);
  exampleEndpointUrl = "/data/example";

  getExampleGeoJsonData(name: "trees" | "earthquake" | "age"): Observable<any> {
    return this.getGeoJsonData(`${this.exampleEndpointUrl}/${name}.geojson`);
  }

  getGeoJsonData(url: string): Observable<any> {
    return this.http.get(url);
  }
}
