import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor(private cookieService: CookieService) {
    const token = this.cookieService.get('access_token');
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: {
        token,
      },
      secure: true,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }

  listen<T>(event: string) {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => subscriber.next(data));
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}