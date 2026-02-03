import { Component, input } from '@angular/core';
import { Cell } from 'apps/main-app/src/app/core/interfaces/cell.interface';

@Component({
  selector: 'app-cell-component',
  imports: [],
  templateUrl: './cell-component.html',
  styleUrl: './cell-component.scss',
})
export class CellComponent {
  cell = input.required<Cell>();

  get isEven() {
    return this.cell().number % 2 === 0;
  }
}
