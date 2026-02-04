import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'apps/main-app/src/app/core/services/auth';

@Component({
  selector: 'app-signin',
  imports: [RouterLink, FormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  username: string = '';
  password: string = '';

  response = signal<string>('');

  router = inject(Router);

  constructor(private authService: AuthService) {}

  signIn() {
    if (this.username.trim() === '' || this.password.trim() === '') {
      alert('Please enter both username and password.');
      return;
    }

    this.authService.signIn(this.username, this.password).subscribe({
      next: (response) => {
        if (response && response.user) {
          this.response.set('Login Successful');
          // alert('Login successful!');
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', this.username);
          this.router.navigate(['/auth/room']);
        } else if (response) {
          this.response.set(response.message);
          // alert(response.message);
        }

        setTimeout(() => {
          this.response.set('');
        }, 2000);
      },
    });
  }
}
