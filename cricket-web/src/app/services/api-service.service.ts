import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  name?: string;
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  private loggedInKey = 'loggedIn'
  private tokenKey = 'authToken'
  private userKey = 'currentUser'

  private baseUrl = 'http://localhost:8080'

  constructor(private http: HttpClient, public router: Router) { }

  private getHeaders(): HttpHeaders {
    const token = this.getToken()
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    })
  }

  getMatchScore(): Observable<any> {
    return this.http.get(`${this.baseUrl}/livescores`)
  }

  getPlayerData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/players`)
  }

  getPointTable(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pointtable`)
  }

  matches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/matches`)
  }

  addPlayerData(players: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/players`, players)
  }

  updatePlayer(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/players/${id}`)
  }

  updatePlayerData(playerData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/players/${playerData._id}`, playerData)
  }

  deletePlayers(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/players/${id}`)
  }

  t20Data(): Observable<any> {
    return this.http.get(`${this.baseUrl}/t20`)
  }

  testData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`)
  }

  odiData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/odi`)
  }

  usersSignUp(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, user)
  }

  usersLogin(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, user)
  }

  login(token: string, user: any): void {
    sessionStorage.setItem(this.loggedInKey, 'true')
    sessionStorage.setItem(this.tokenKey, token)
    sessionStorage.setItem(this.userKey, JSON.stringify(user))
  }

  logout(): void {
    sessionStorage.removeItem(this.loggedInKey)
    sessionStorage.removeItem(this.tokenKey)
    sessionStorage.removeItem(this.userKey)
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.loggedInKey) === 'true' && 
           this.getToken() !== null
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey)
  }

  getCurrentUser(): any {
    const user = sessionStorage.getItem(this.userKey)
    return user ? JSON.parse(user) : null
  }
}
