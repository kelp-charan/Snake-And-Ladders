import { Injectable } from '@angular/core';
import { SocketService } from './socket-service';
import { BehaviorSubject } from 'rxjs';

import { Room } from '@snake-and-ladders-monorepo/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoomService {

  room = new BehaviorSubject<Room | null>(null);
  room$ = this.room.asObservable();

  roomResponse = new BehaviorSubject<{ success: boolean, playerId: number } | null>(null);
  roomResponse$ = this.roomResponse.asObservable();

  errorMessage = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessage.asObservable();

  constructor(private socketService: SocketService ) {
    this.listenToErrors();
    this.listenToRoomCreation();
    this.listenToRoomJoining();
    this.listenToPlayerJoined();
    this.listenToRoomDetails();
    this.listenToRejoinSuccess();
    // this.listenToSessionExpired();
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
    this.socketService.listen<{ message: string}>('error').subscribe(
      data => {
        console.log("Error received in RoomService: ", data);
        this.errorMessage.next(data.message);
      }
    )
  }

  private listenToRoomCreation() {
    this.socketService.listen<{ success: boolean, playerId: number }>('roomCreated').subscribe(
      data => {
        console.log("Room created: ", data);
        this.roomResponse.next(data);
      }
    )
  }

  private listenToRoomJoining() {
    this.socketService.listen<{ success: boolean, playerId: number }>('roomJoined').subscribe(
      data => {
        console.log("Room joined: ", data);
        this.roomResponse.next(data);
      }
    )
  }

  // saveSession(roomId: string, username: string, playerId: number) {
  //   this.socketService.saveSession(roomId, username, playerId);
  // }

  // clearSession() {
  //   this.socketService.clearSession();
  // }

  private listenToPlayerJoined() {
    this.socketService.listen<Room>('playerJoined').subscribe(
      data => {
        console.log("Player joined room: ", data);
        this.room.next(data);
      }
    )
  }

  private listenToRoomDetails() {
    this.socketService.listen<Room>('roomDetails').subscribe(
      data => {
        console.log("Room details received: ", data);
        this.room.next(data);
      }
    )
  }

  private listenToRejoinSuccess() {
    this.socketService.listen<{ room: Room, playerId: number }>('rejoinSuccess').subscribe(
      data => {
        console.log("Rejoin successful: ", data);
        this.room.next(data.room);
        this.roomResponse.next({ success: true, playerId: data.playerId });
      }
    )
  }

  // private listenToSessionExpired() {
  //   this.socketService.listen<{ message: string }>('sessionExpired').subscribe(
  //     data => {
  //       console.log("Session expired: ", data.message);
  //       this.socketService.clearSession();
  //     }
  //   )
  // }
}
