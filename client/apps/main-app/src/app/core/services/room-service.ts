import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SocketService } from './socket-service';

import { Room } from '@snake-and-ladders-monorepo/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  room = new BehaviorSubject<Room | null>(null);
  room$ = this.room.asObservable();

  roomResponse = new Subject<{
    success: boolean;
    playerId: number;
    type: 'create' | 'join' | 'rejoin';
  }>();
  roomResponse$ = this.roomResponse.asObservable();

  errorMessage = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessage.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToErrors();
    this.listenToRoomCreation();
    this.listenToRoomJoining();
    this.listenToPlayerJoined();
    this.listenToRoomDetails();
    this.listenToRejoinSuccess();
  }

  creaetRoom(roomId: string, username: string) {
    this.socketService.emit('createRoom', { roomId, username });
  }

  joinRoom(roomId: string, username: string) {
    this.socketService.emit('joinRoom', { roomId, username });
  }

  getRoomDetails(roomId: string) {
    this.socketService.emit('roomDetails', { roomId });
  }

  rejoinRoom(roomId: string, username: string, playerId: number) {
    this.socketService.emit('rejoinRoom', { roomId, username, playerId });
  }

  private listenToErrors() {
    this.socketService
      .listen<{ message: string }>('error')
      .subscribe((data) => {
        this.errorMessage.next(data.message);
      });
  }

  private listenToRoomCreation() {
    this.socketService
      .listen<{ success: boolean; playerId: number }>('roomCreated')
      .subscribe((data) => {
        this.roomResponse.next({ ...data, type: 'create' });
      });
  }

  private listenToRoomJoining() {
    this.socketService
      .listen<{ success: boolean; playerId: number }>('roomJoined')
      .subscribe((data) => {
        this.roomResponse.next({ ...data, type: 'join' });
      });
  }


  private listenToPlayerJoined() {
    this.socketService.listen<Room>('playerJoined').subscribe((data) => {
      this.room.next(data);
    });
  }

  private listenToRoomDetails() {
    this.socketService.listen<Room>('roomDetails').subscribe((data) => {
      this.room.next(data);
    });
  }

  private listenToRejoinSuccess() {
    this.socketService
      .listen<{ room: Room; playerId: number }>('rejoinSuccess')
      .subscribe((data) => {
        this.room.next(data.room);
        this.roomResponse.next({
          success: true,
          playerId: data.playerId,
          type: 'rejoin',
        });
      });
  }
}
