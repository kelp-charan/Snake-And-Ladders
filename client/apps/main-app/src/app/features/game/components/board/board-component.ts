import { Component, input, OnInit, signal } from '@angular/core';

import { CellComponent } from '../cell/cell-component';

import { IPlayer } from '@snake-and-ladders-monorepo/interfaces';

import { Cell } from 'apps/main-app/src/app/core/interfaces/cell.interface';
import { DiceService } from 'apps/main-app/src/app/core/services/dice-service';
import { GameDetailsService } from 'apps/main-app/src/app/core/services/game-details-service';
import { RoomService } from 'apps/main-app/src/app/core/services/room-service';

@Component({
  selector: 'app-board-component',
  imports: [CellComponent],
  templateUrl: './board-component.html',
  styleUrl: './board-component.scss',
})
export class BoardComponent implements OnInit {
  players = input.required<IPlayer[]>();

  board: Cell[][] = [];
  cellSize = 75;

  snakes = new Map<number, number>([
    [48, 28],
    [67, 24],
    [79, 59],
    [74, 52],
    [83, 19],
    [96, 76],
  ]);

  ladders = new Map<number, number>([
    [8, 13],
    [18, 65],
    [27, 46],
    [60, 61],
    [68, 89],
  ]);

  playersPositions = signal<number[]>([]);

  winner: string = '';

  isSnake: boolean = false;
  isLadder: boolean = false;
  isPlayerMoving: boolean = false;
  movingPlayerIndex: number = -1;

  constructor(
    private diceService: DiceService,
    private gameService: GameDetailsService,
    private roomService: RoomService,
  ) {
    this.initializeBoard();
  }

  ngOnInit(): void {
    this.playersPositions.set(this.players().map((p) => p.currPosition ?? 1));

    this.subscibeToDiceRolls();

    this.subscribeToPlayerJoined();
  }

  private initializeBoard() {
    let number = 100;
    for (let row = 0; row < 10; row++) {
      this.board[row] = [];
      for (let col = 0; col < 10; col++) {
        if (row % 2 == 0) {
          this.board[row][col] = { number, row, col };
        } else {
          this.board[row][9 - col] = { number, row, col: 9 - col };
        }
        number--;
      }
    }
  }

  private subscribeToPlayerJoined() {
    this.roomService.room$.subscribe((room) => {
      const players = room?.players;
      if (players) {
        this.playersPositions.set(players.map((p) => p.currPosition));
      }
    });
  }

  private subscibeToDiceRolls() {
    this.diceService.diceRolled$.subscribe((data) => {
      if (!data) return;
      this.movePlayer(data?.diceValue, data.newPosition, data.playerIndex);
    });
  }


  private movePlayer(
    diceValue: number,
    newPosition: number,
    playerIndex: number,
  ) {
    const startPosition = this.playersPositions()[playerIndex];
    const positionAfterDice = startPosition + diceValue;

    if (positionAfterDice > 100) {
      return;
    }

    this.isPlayerMoving = true;
    this.movingPlayerIndex = playerIndex;

    for (let i = 1; i <= diceValue; i++) {
      setTimeout(() => {
        this.playersPositions.update((positions) => {
          const newPositions = [...positions];

          if (newPositions[playerIndex] < 100) {
            newPositions[playerIndex] += 1;
          }
            return newPositions;
        });
      }, i * 800);
    }

    setTimeout(
      () => {
        const currentPos = this.playersPositions()[playerIndex];

        if (this.snakes.has(currentPos) || this.ladders.has(currentPos)) {
          const finalPos =
            this.snakes.get(currentPos) || this.ladders.get(currentPos);

          if (this.snakes.has(currentPos)) {
            this.isSnake = true;
          }
          if (this.ladders.has(currentPos)) {
            this.isLadder = true;
          }

          setTimeout(() => {
            this.isSnake = false;
            this.isLadder = false;
          }, 2000);

          setTimeout(() => {
            this.playersPositions.update((positions) => {
              const newPositions = [...positions];
              newPositions[playerIndex] = finalPos!;
              return newPositions;
            });
          }, 500);
        }

        if (this.playersPositions()[playerIndex] == 100) {
          const winnerName = this.players()[playerIndex].username;
          const roomId = localStorage.getItem('roomId') || '';
          this.gameService.gameEnded(winnerName, roomId);
        }
      },
      diceValue * 800 + 100,
    );

    this.isPlayerMoving = false;
  }

  playerTransform(playerIdx: number): string {
    const currPosition = this.playersPositions()[playerIdx];

    let row = 0,
      col = 0;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.board[r][c].number === currPosition) {
          row = r;
          col = c;
          break;
        }
      }
    }

    const x = col * this.cellSize;
    const y = row * this.cellSize;

    return `translate(${x}px, ${y}px)`;
  }
}
