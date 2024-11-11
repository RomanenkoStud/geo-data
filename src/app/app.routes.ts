import { Routes } from '@angular/router';
import { ChoroplethPageComponent } from './pages/choropleth-page/choropleth-page.component';
import { HeatmapPageComponent } from './pages/heatmap-page/heatmap-page.component';

export const routes: Routes = [
  { path: 'choropleth', component: ChoroplethPageComponent },
  { path: 'heatmap', component: HeatmapPageComponent },
  { path: '', redirectTo: '/choropleth', pathMatch: 'full' }, // Default route
];
