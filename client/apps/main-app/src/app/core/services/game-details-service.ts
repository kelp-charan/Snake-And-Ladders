import { Injectable } from '@angular/core';
import { IRoom } from '@snake-and-ladders-monorepo/interfaces';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket-service';

@Injectable({
  providedIn: 'root',
})
export class GameDetailsService {
  room = new BehaviorSubject<IRoom | null>(null);
  room$ = this.room.asObservable();

  gameStatus = new BehaviorSubject<boolean | any>(null);
  gameStatus$ = this.gameStatus.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToStatusChanges();
    this.listenToGameStart();
  }

  changePlayerStatus(roomId: string, status: boolean) {
    this.socketService.emit('changeStatus', { roomId, status });
  }

  startGame(roomId: string) {
    this.socketService.emit('startGame', { roomId });
  }

  gameEnded(winnerName: string, roomId: string) {
    this.socketService.emit('gameEnded', { winnerName, roomId });
  }

  private listenToStatusChanges() {
    this.socketService.listen<IRoom>('statusChanged').subscribe((data) => {
      this.room.next(data);
    });
  }

  private listenToGameStart() {
    this.socketService.listen('gameStarted').subscribe((data) => {
      this.gameStatus.next(data);
    });
  }

  exitGame() {
    this.socketService.socket.disconnect();
  }
}
