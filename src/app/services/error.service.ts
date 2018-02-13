import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface ErrorNotification {
  duration: number;
  message: string;
}

@Injectable()
export class ErrorService {
  public errorMessage = new Subject<ErrorNotification>();
  constructor() {
  }

}
