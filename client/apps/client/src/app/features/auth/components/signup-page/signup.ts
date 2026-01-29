import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

import { AuthService } from 'apps/client/src/app/core/services/auth';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  username: string = '';
  password: string = '';

  response = signal<string>('');

  constructor(private authService: AuthService) {}

  signUp() {
    if(this.username.trim() === '' || this.password.trim() === '') {
      alert('Please enter both username and password.');
      return;
    }

    this.authService.signUp(this.username, this.password).subscribe({
      next: (response: any) => {
        // alert(response.message);
        console.log("Signup Response: ", response);
        this.response.set(response.message);

        setTimeout(() => {
          this.response.set('');
        }, 2000);
      }
    })
  }

}
