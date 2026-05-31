import { Component, signal } from '@angular/core';
import { GameBoard } from './game-board/game-board';

@Component({
  selector: 'app-root',
  imports: [GameBoard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('memo');
}
