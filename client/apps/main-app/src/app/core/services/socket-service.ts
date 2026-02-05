import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    query: { token: localStorage.getItem('token') || '' },
  });

  private connected = new BehaviorSubject<boolean>(false);
  connected$ = this.connected.asObservable();

  constructor() {
    this.socket.on('connect', () => {
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected.next(false);
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.on(event, (data: T) => {
        observer.next(data);
      });
    });
  }
}
