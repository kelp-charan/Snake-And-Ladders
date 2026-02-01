import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit } from '@angular/core';

import { DiceComponent } from '../dice/dice-component';
import { PlayersListComponent } from '../players-list/players-list-component';

import { Player, Room } from '@snake-and-ladders-monorepo/interfaces';
import { GameDetailsService } from 'apps/client/src/app/core/services/game-details-service';
import { RoomService } from 'apps/client/src/app/core/services/room-service';

import { Router } from '@angular/router';
import { GameState } from '@snake-and-ladders-monorepo/enums';

@Component({
  selector: 'app-game-details-component',
  imports: [CommonModule, PlayersListComponent, DiceComponent],
  templateUrl: './game-details-component.html',
  styleUrl: './game-details-component.scss',
})
export class GameDetailsComponent implements OnInit {

  room = input.required<Room>();
  currentTurn = input<number>(0);
  gameStarted: boolean = false;

  gameState = GameState;

  currPlayerId: number = Number(localStorage.getItem('playerId'));
  admin: string = '';

  router = inject(Router);

  constructor(private gameDetailsService: GameDetailsService, private roomService: RoomService) {
    effect(() => {
      console.log("Room details changed (Game Details Component): ", this.room());
      const username = localStorage.getItem('username')!;
      this.room().players.forEach((player: Player, index: number) => {
        player.username === username ? this.currPlayerId = index : null;
      })
      localStorage.setItem('playerId', this.currPlayerId.toString());
    })
  }

  ngOnInit(): void {
    this.admin = localStorage.getItem('username')!;
    console.log("Room state: ", this.room().gameState)

    this.gameDetailsService.gameStatus$.subscribe(
      data => {
        console.log("Change in game status: ", data);
        this.gameStarted = data;
      }
    )

    this.roomService.errorMessage$.subscribe(
      err => {
        if(err) {
          // alert(`${err}`);
          console.log("Error in GameDetailsComponent: ", err);
        }
      }
    )

  }

  changePlayerStatus() {
    const playerStatus = this.room().players[this.currPlayerId].isReady;

    this.gameDetailsService.changePlayerStatus(this.room().roomId, !playerStatus);
  }

  startGame() {
    this.gameDetailsService.startGame(this.room().roomId);
  }

  exitGame() {
    this.gameDetailsService.exitGame();
    this.router.navigate(['/auth/room']);
  }

}
