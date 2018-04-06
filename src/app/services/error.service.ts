import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


export class ErrorNotification {
  duration: number;
  message: string;
  id: string;

  constructor(message: string, duration: number, id?: string) {
    this.duration = duration;
    this.message = message;
    this.id = id || Date.now().toString();
  }
}

@Injectable()
export class ErrorService {
  public errorMessage = new Subject<ErrorNotification>();
  constructor() {
  }

}
