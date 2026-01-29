import { Component, input, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '@snake-and-ladders-monorepo/interfaces';

@Component({
  selector: 'app-players-list-component',
  imports: [],
  templateUrl: './players-list-component.html',
  styleUrl: './players-list-component.css',
})
export class PlayersListComponent implements OnInit {

  players = input.required<Player[]>();
  currentTurn = input<number>(0);

  myUsername: string = '';

  router = inject(Router);

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    effect(() => {
      console.log("Players list updated (Players List Component): ", this.players());
      this.changeDetectorRef.detectChanges();
    })
  }

  ngOnInit(): void {
    const username = localStorage.getItem('username');
    if (username) {
      this.myUsername = username;
    }
    else {
      this.router.navigate(['/auth/room']);
    }
  }

}
