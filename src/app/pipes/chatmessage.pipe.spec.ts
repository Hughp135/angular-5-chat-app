import { ChatMessagePipe } from './chatmessage.pipe';

describe('Chatmessage Pipe', () => {
  let pipe: ChatMessagePipe;
  const fakeSanitizer: any = {
    sanitize: jasmine.createSpy().and.callFake((_, val) => `sanitized ${val}`),
    bypassSecurityTrustUrl: jasmine.createSpy().and.callFake(val => `bypassed ${val}`),
  };

  beforeEach(() => {
    pipe = new ChatMessagePipe(fakeSanitizer);
  });

  afterEach(() => {
    fakeSanitizer.sanitize.calls.reset();
    fakeSanitizer.bypassSecurityTrustUrl.calls.reset();
  });
  it('transforms a message', () => {
    expect(pipe.transform('hello')).toEqual('sanitized bypassed hello');
  });
  it('creates <pre> tag around code', () => {
    expect(pipe.transform('hello `code` here')).toEqual(
      'sanitized bypassed hello <pre class="chat-pre">code</pre> here',
    );
  });
  it('creates <pre> tag around code twice', () => {
    expect(pipe.transform('hello `code` here `again`')).toEqual(
      'sanitized bypassed hello <pre class="chat-pre">code</pre> here <pre class="chat-pre">again</pre>',
    );
  });
});
