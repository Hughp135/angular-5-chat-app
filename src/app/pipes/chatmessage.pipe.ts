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
    let result = str ? linkifyString(str, { className: 'chat-link' }) : str;

    let matches = /\`(.*?)\`/.exec(result);
    let i = 0;
    while (matches) {
      result = result.replace(matches[0], `<pre class="chat-pre">${matches[1]}</pre>`);
      matches = /\`(.*?)\`/.exec(result);
      if (i++ >= 100) {
        break;
      }
    }

    return this._domSanitizer.sanitize(
      SecurityContext.URL,
      this._domSanitizer.bypassSecurityTrustUrl(result),
    );
  }
}
