import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) {}

  signUp(username: string, password: string) {
    return this.http.post('http://localhost:3000/api/auth/signup', { username, password });
  }

  signIn(username: string, password: string) {
    return this.http.post<{ message: string, user: User, token: string }>('http://localhost:3000/api/auth/signin', { username, password });
  }

}
