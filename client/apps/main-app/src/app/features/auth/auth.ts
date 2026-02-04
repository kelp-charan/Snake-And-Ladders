import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoomService } from '../../core/services/room-service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  imports: [RouterOutlet],
})
export class AuthComponent{
  errorMessage = signal<string>('');
  authResponse = signal<string>('');

  constructor(private roomService: RoomService) {}
}
