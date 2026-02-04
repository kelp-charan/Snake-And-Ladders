import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(username: string, password: string) {
    return this.http.post('http://localhost:3000/api/auth/signup', {
      username,
      password,
    });
  }

  signIn(username: string, password: string) {
    return this.http.post<{ message: string; user: User; token: string }>(
      'http://localhost:3000/api/auth/signin',
      { username, password },
    );
  }

  isAuthenticated(): boolean {
    const token: string = localStorage.getItem('token') || '';

    if (!token) return false;

    try {
      const decode = jwtDecode<{ exp: number }>(token);
      const isExpired = Date.now() > decode.exp * 1000;

      if (isExpired) {
        this.logout();
        return false;
      }

      return true;
    } 
    catch (err) {
      this.logout();
      return false;
    }
  }

  private logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roomId');
    localStorage.removeItem('playerId');
  }
}
