import { AppPage } from './app.po';

describe('chat-angular-electron App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display login message', () => {
    page.navigateTo();
    expect(page.getElementText('h2')).toEqual('Please log in or create an account.');
  });
});
