import { SecurityContext } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as linkifyString from 'linkifyjs/string';

@Pipe({ name: 'chatmessage' })
export class ChatMessagePipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) {}

  transform(value: any): any {
    return this.stylize(value);
  }

  // Modify this method according to your custom logic
  private stylize(str: string): string {
    const result = str
      ? this.combineFunctions(str, this.links, this.codePreformatted)
      : str;

    return this._domSanitizer.sanitize(
      SecurityContext.URL,
      this._domSanitizer.bypassSecurityTrustUrl(result),
    );
  }

  private combineFunctions(str: string, ...funcs: Array<(string) => string>) {
    return funcs.reduce((result, func) => func(result), str);
  }

  /** Converts links to <a> tags */
  private links(str: string): string {
    return linkifyString(str, { className: 'chat-link', defaultProtocol: 'https' });
  }

  /** Converts text within quotes (``) to <pre> tags */
  private codePreformatted(str: string): string {
    const regex = /\`(.*?)\`/;
    let matches = regex.exec(str);

    while (matches) {
      str = str.replace(matches[0], `<pre class="chat-pre">${matches[1]}</pre>`);
      matches = regex.exec(str);
    }

    return str;
  }
}
