import { Routes } from '@angular/router';
import { ChoroplethPageComponent } from './pages/choropleth-page/choropleth-page.component';
import { HeatmapPageComponent } from './pages/heatmap-page/heatmap-page.component';
import { ChoroplethPlaybackPageComponent } from './pages/choropleth-playback-page/choropleth-playback-page.component';
import { HeatmapPlaybackPageComponent } from './pages/heatmap-playback-page/heatmap-playback-page.component';

export const routes: Routes = [
  { path: 'choropleth', component: ChoroplethPageComponent },
  { path: 'choropleth-playback', component: ChoroplethPlaybackPageComponent },
  { path: 'heatmap', component: HeatmapPageComponent },
  { path: 'heatmap-playback', component: HeatmapPlaybackPageComponent },
  { path: '', redirectTo: '/choropleth', pathMatch: 'full' }, // Default route
];
