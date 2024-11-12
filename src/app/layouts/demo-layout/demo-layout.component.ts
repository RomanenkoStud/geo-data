import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-demo-layout',
  standalone: true,
  imports: [],
  templateUrl: './demo-layout.component.html',
  styleUrl: './demo-layout.component.css'
})
export class DemoLayoutComponent {
  @Input() titleText!: string;
}
