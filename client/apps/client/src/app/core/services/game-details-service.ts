import { Injectable } from '@angular/core';
import { SocketService } from './socket-service';
import { BehaviorSubject } from 'rxjs';
import { Room } from '@snake-and-ladders-monorepo/interfaces';

@Injectable({
  providedIn: 'root',
})
export class GameDetailsService {
  
  room = new BehaviorSubject<Room | null>(null);
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
    this.socketService.listen<Room>('statusChanged').subscribe(
      data => {
        console.log("Status change received in GameDetailsService: ", data);
        this.room.next(data);
      }
    )
  }

  private listenToGameStart() {
    this.socketService.listen('gameStarted').subscribe(
      data => {
        console.log("Game started received in GameDetailsService: ", data);
        this.gameStatus.next(data);
      }
    )
  }

  exitGame(roomId: string, playerId: string) {
    this.socketService.socket.disconnect();
  }

}
