import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getElementText(el: string) {
    return element(by.css(`app-root ${el}`)).getText();
  }
}
