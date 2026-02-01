import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from 'apps/client/src/app/core/services/room-service';

@Component({
  selector: 'app-room',
  imports: [FormsModule],
  templateUrl: './room.html',
  styleUrl: './room.scss',
})
export class Room implements OnInit {
  roomId: string = '';
  errorMessage = signal<string | null>(null);

  router = inject(Router);

  animate = signal<boolean>(false);

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    // this.subscribeToErrorMessages();
    this.subscribeToRoomRequests();
    this.subscribeToErrorMessages();
  }

  createRoom() {
    const username = localStorage.getItem('username');

    if (!username) {
      alert('Please sign in first.');
      return;
    }

    if (this.roomId.trim() === '') {
      alert('Please enter a room ID.');
      this.errorMessage.set('Please enter a roomId');

      setTimeout(() => {
        this.errorMessage.set(null);
      }, 3000);
      return;
    }

    this.roomService.creaetRoom(this.roomId, username);
  }

  joinRoom() {
    const username = localStorage.getItem('username');

    if (!username) {
      alert('Please sign in first.');
      return;
    }

    if (this.roomId.trim() === '') {
      alert('Please enter a room ID.');
      this.errorMessage.set('Please enter roomId');

      setTimeout(() => {
        this.errorMessage.set(null);
      }, 3000);

      return;
    }

    this.roomService.joinRoom(this.roomId, username);
  }

  private subscribeToErrorMessages() {
    this.roomService.errorMessage$.subscribe((msg) => {
      this.errorMessage.set(msg);

      setInterval(() => {
        this.errorMessage.set(null);
      }, 3000);
    });
  }

  private subscribeToRoomRequests() {
    this.roomService.roomResponse$.subscribe((response) => {
      console.log('Room response received in Room Component: ', response);
      if (response === null) return;
      if (response.success) {
        console.log('Successfully created or joined room');
        // alert('Successfully created or joined room');

        const username = localStorage.getItem('username') || '';
        localStorage.setItem('playerId', response.playerId.toString());
        localStorage.setItem('roomId', this.roomId);

        // this.errorMessage.set(null);

        this.animate.set(true);

        this.deplay(2000).then(() => {
          this.router.navigate([`/room/${this.roomId}`]);
        });

        // this.router.navigate([`/room/${this.roomId}`]);
      } else {
        console.log('Failed to create or join room');
        alert('Failed to create or join room');
      }
    });
  }

  private deplay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
