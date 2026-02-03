import { Component, input, OnInit, signal } from '@angular/core';

import { Player } from '@snake-and-ladders-monorepo/interfaces';
import { DiceService } from '../../../../core/services/dice-service';
import { GameDetailsService } from '../../../../core/services/game-details-service';

@Component({
  selector: 'app-dice-component',
  imports: [],
  templateUrl: './dice-component.html',
  styleUrl: './dice-component.scss',
})
export class DiceComponent implements OnInit {
  value = signal<number>(1);
  isRolling = signal<boolean>(false);

  players = input<Player[]>();
  currentTurn = input<number>(0);

  isCurrentPlayerTurn = signal<boolean>(false);
  gameEnded = signal<boolean>(false);
  winner = signal<string>('');

  private roomId: string | null = null;
  private currentUsername: string | null = null;
  private currentPlayerId: number = 0;

  constructor(
    private diceService: DiceService,
    private gameDetailsService: GameDetailsService,
  ) {
    this.roomId = localStorage.getItem('roomId');
    this.currentUsername = localStorage.getItem('username');
    this.currentPlayerId = parseInt(localStorage.getItem('playerId') || '0');
  }

  ngOnInit() {
    this.checkIfMyTurn(this.currentTurn());

    this.diceService.diceRolled$.subscribe((data) => {
      if (data) {
        this.value.set(data.diceValue);
        this.checkIfMyTurn(data.playerTurn);
        console.log(
          'Dice rolled:',
          data.diceValue,
          'Next turn:',
          data.playerTurn,
        );
      }
    });

    this.diceService.gameEnded$.subscribe((data) => {
      if (data) {
        this.gameEnded.set(true);
        this.winner.set(data.winner);
      }
    });
  }

  private checkIfMyTurn(turn: number) {
    this.isCurrentPlayerTurn.set(turn === this.currentPlayerId);
  }

  rollDice() {
    if (this.isRolling() || !this.roomId) return;

    this.isRolling.set(true);

    const animationDuration = 800;
    const intervalTime = 80;
    let elapsed = 0;

    const interval = setInterval(() => {
      this.value.set(Math.floor(Math.random() * 6) + 1);
      elapsed += intervalTime;

      if (elapsed >= animationDuration) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        this.value.set(finalValue);
        this.isRolling.set(false);
        this.diceService.rollDice(this.roomId!, finalValue);
      }
    }, intervalTime);
  }
}
