import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { User } from '../interfaces/user.interface';
import { AuthApiUrls } from 'apps/main-app/src/api-urls';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(username: string, password: string) {
    return this.http.post(AuthApiUrls.SIGNUP, {
      username,
      password,
    });
  }

  signIn(username: string, password: string) {
    return this.http.post<{ message: string; user: User; token: string }>(
      AuthApiUrls.SIGNIN,
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
