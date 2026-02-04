import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Room } from '@snake-and-ladders-monorepo/interfaces';

import { RoomService } from '../../core/services/room-service';

import { DiceService } from '../../core/services/dice-service';
import { GameDetailsService } from '../../core/services/game-details-service';
import { BoardComponent } from './components/board/board-component';
import { GameDetailsComponent } from './components/details-component/game-details-component';

@Component({
  selector: 'app-game',
  imports: [BoardComponent, GameDetailsComponent],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game implements OnInit {
  roomId: string = '';
  room = signal<Room | null>(null);
  currentTurn = signal<number>(0);
  gameEnded = signal<boolean>(false);
  winner = signal<string>('');

  animate = signal<boolean>(false);

  router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private gameDetailsService: GameDetailsService,
    private diceService: DiceService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => (this.roomId = params['id']));

    this.roomService.getRoomDetails(this.roomId);
    this.reJoinRoom();

    this.subscribeToRoomDetails();
    this.subscribeToPlayerStatusChange();
    this.subscribeToGameState();
    this.subscribeToDiceRolls();
    this.subscribeToGameEnded();
    this.subscribeToErrorMessages();

    this.animate.set(true);

    setTimeout(() => {
      this.animate.set(false);
    }, 2000);
  }

  private reJoinRoom() {
    const username = localStorage.getItem('username');
    const playerId = localStorage.getItem('playerId');
    const roomId = localStorage.getItem('roomId');

    if (username && playerId && roomId) {
      this.roomService.rejoinRoom(roomId, username, Number(playerId));
    }
  }

  private subscribeToErrorMessages() {
    this.roomService.errorMessage$.subscribe((err) => {
      if (err) {
        if (err === 'Room does not exist')
          this.router.navigate(['/auth/signin']);
      }
    });
  }

  private subscribeToRoomDetails() {
    this.roomService.room$.subscribe((room) => {
      this.room.set(room);
      if (room) {
        this.currentTurn.set(room.turn);
      }
    });
  }

  private subscribeToPlayerStatusChange() {
    this.gameDetailsService.room$.subscribe((room) => {
      this.room.set(room);
    });
  }

  private subscribeToGameState() {
    this.gameDetailsService.gameStatus$.subscribe((started) => {
      this.room.update((r) => (r ? { ...r, gameState: started } : r));
    });
  }

  private subscribeToDiceRolls() {
    this.diceService.diceRolled$.subscribe((data) => {
      if (data) {
        this.room.set(data.room);
        this.currentTurn.set(data.playerTurn);
      }
    });
  }

  private subscribeToGameEnded() {
    this.diceService.gameEnded$.subscribe((data) => {
      if (data) {
        this.gameEnded.set(true);
        this.winner.set(data.winner);
        this.room.set(data.room);

        setTimeout(() => {
          this.router.navigate(['/auth/signin']);
        }, 4000);
      }
    });
  }
}
