import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoomService } from '../../core/services/room-service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  imports: [RouterOutlet],
})
export class AuthComponent implements OnInit {
  errorMessage = signal<string>('');
  authResponse = signal<string>('');

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    // this.subscribeToErrorMessage();
  }

  // private subscribeToErrorMessage() {
  //     this.roomService.errorMessage$.subscribe(
  //         err => {
  //             if(err) {
  //                 console.log("Error (Auth Component): ", err);
  //                 this.errorMessage.set(err);

  //                 setInterval(() => {
  //                     this.errorMessage.set('');
  //                 }, 2500);
  //             }
  //         }
  //     )
  // }
}
