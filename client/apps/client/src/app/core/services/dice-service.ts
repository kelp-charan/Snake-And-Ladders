import { Injectable } from '@angular/core';
import { Room } from '@snake-and-ladders-monorepo/interfaces';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket-service';

export interface DiceRollResult {
  diceValue: number;
  playerTurn: number;
  playerIndex: number;
  newPosition: number;
  room: Room;
}

@Injectable({
  providedIn: 'root',
})
export class DiceService {
  
  private diceRolled = new BehaviorSubject<DiceRollResult | null>(null);
  diceRolled$ = this.diceRolled.asObservable();

  private gameEnded = new BehaviorSubject<{ winner: string, room: Room } | null>(null);
  gameEnded$ = this.gameEnded.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToDiceRolled();
    this.listenToGameEnded();
  }

  rollDice(roomId: string, diceValue: number) {
    this.socketService.emit('rollDice', { roomId, diceValue });
  }

  private listenToDiceRolled() {
    this.socketService.listen<DiceRollResult>('diceRolled').subscribe(
      data => {
        console.log("Dice rolled event received:", data);
        this.diceRolled.next(data);
      }
    );
  }

  private listenToGameEnded() {
    this.socketService.listen<{ winner: string, room: Room }>('gameEnded').subscribe(
      data => {
        console.log("Game ended! Winner:", data.winner);
        this.gameEnded.next(data);
      }
    );
  }
}
