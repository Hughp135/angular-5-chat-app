import { Component } from '@angular/core';
import { TransitionController, Transition, TransitionDirection } from 'ng2-semantic-ui';
import { ErrorService, ErrorNotification } from '../../services/error.service';

@Component({
  selector: 'app-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss']
})
export class ErrorNotificationComponent {
  private transitionController = new TransitionController();
  public errorMessage: string;
  public transitionDuration = 500;

  constructor(errorService: ErrorService) {
    errorService.errorMessage.subscribe((msg: ErrorNotification) => {
      this.errorMessage = msg.message;
      this.fade(TransitionDirection.In);
      setTimeout(() => {
        this.hide(msg.message);
      }, msg.duration);
    });

  }

  public hide(msg: string) {
    // Check if message shown is one we want to be hidden
    if (msg === this.errorMessage) {
      this.fade(TransitionDirection.Out, () => {
        this.errorMessage = undefined;
      });
    }
  }

  public fade(direction: TransitionDirection, cb?) {
    const transitionDuration = this.transitionDuration;
    this.transitionController.animate(
      new Transition('fade up', transitionDuration, direction, cb)
    );
  }
}
