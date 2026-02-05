import { Injectable } from '@angular/core';
import { IRoom } from '@snake-and-ladders-monorepo/interfaces';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket-service';
import { IDiceRollResult } from '../interfaces/dice-roll.interface';

@Injectable({
  providedIn: 'root',
})
export class DiceService {
  private diceRolled = new BehaviorSubject<IDiceRollResult | null>(null);
  diceRolled$ = this.diceRolled.asObservable();

  private gameEnded = new BehaviorSubject<{
    winner: string;
    room: IRoom;
  } | null>(null);
  gameEnded$ = this.gameEnded.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToDiceRolled();
    this.listenToGameEnded();
  }

  rollDice(roomId: string, diceValue: number) {
    this.socketService.emit('rollDice', { roomId, diceValue });
  }

  private listenToDiceRolled() {
    this.socketService
      .listen<IDiceRollResult>('diceRolled')
      .subscribe((data) => {
        this.diceRolled.next(data);
      });
  }

  private listenToGameEnded() {
    this.socketService
      .listen<{ winner: string; room: IRoom }>('gameEnded')
      .subscribe((data) => {
        this.gameEnded.next(data);
      });
  }
}
