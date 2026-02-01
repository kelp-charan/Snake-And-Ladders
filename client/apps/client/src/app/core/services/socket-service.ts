import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket = io('http://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { token: localStorage.getItem('token') || ''}
    });

    private connected = new BehaviorSubject<boolean>(false);
    connected$ = this.connected.asObservable();

    constructor() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.connected.next(true);
            // this.rejoinRoom();
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
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
            })
        })
    }

    // saveSession(roomId: string, username: string, playerId: number) {
    //     const session = { roomId, username, playerId };
    //     localStorage.setItem('gameSession', JSON.stringify(session));
    // }

    // getSession(): { roomId: string, username: string, playerId: number } | null {
    //     const session = localStorage.getItem('gameSession');
    //     return session ? JSON.parse(session) : null;
    // }

    // clearSession() {
    //     localStorage.removeItem('gameSession');
    // }

    // private rejoinRoom() {
    //     const session = this.getSession();
    //     if (session) {
    //         console.log('Rejoining room:', session.roomId);
    //         this.emit('rejoinRoom', session);
    //     }
    // }
}