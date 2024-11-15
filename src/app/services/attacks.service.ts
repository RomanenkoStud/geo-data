import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttacksService {
  http = inject(HttpClient);

  apiEndpointUrl = 'https://threatmap-api.checkpoint.com/ThreatMap/api/feed';

  constructor() { }

  getAttacksData(): Observable<any> {
    return this.http.get(`${this.apiEndpointUrl}`);
  }
}
