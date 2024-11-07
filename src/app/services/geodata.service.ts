import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeodataService {
  http = inject(HttpClient);
  endpointUrl = "/data/example";

  getGeoJsonData(name: "trees" | "earthquake"): Observable<any> {
    return this.http.get(`${this.endpointUrl}/${name}.geojson`);
  }
}
