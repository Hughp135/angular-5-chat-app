import { ChatMessagePipe } from './chatmessage.pipe';

describe('Chatmessage Pipe', () => {
  let pipe: ChatMessagePipe;
  const fakeSanitizer: any = {
    sanitize: (_, val) => `sanitized ${val}`,
    bypassSecurityTrustUrl: val => `bypassed ${val}`,
  };

  beforeEach(() => {
    pipe = new ChatMessagePipe(fakeSanitizer);
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
  it('converts links to <a> tags', () => {
    expect(pipe.transform('google.com')).toEqual(
      `sanitized bypassed <a href="https://google.com" class="chat-link" target="_blank">google.com</a>`,
    );
  });
  it('converts links starting with https://www. to <a> tags', () => {
    expect(pipe.transform('https://www.google.com')).toEqual(
      `sanitized bypassed <a href="https://www.google.com" class="chat-link" target="_blank">https://www.google.com</a>`,
    );
  });
  it('converts links starting with www. to <a> tags', () => {
    expect(pipe.transform('www.google.com')).toEqual(
      `sanitized bypassed <a href="https://www.google.com" class="chat-link" target="_blank">www.google.com</a>`,
    );
  });
});
