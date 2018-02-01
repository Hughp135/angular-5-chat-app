import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

export interface HttpOptions {
  headers?: { [key: string]: string };
  search?: { [key: string]: string };
}

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) { }

  /**
   *
   * @param url
   * @param {{}} options
   * @returns {Observable<object>}
   */
  get(url: string, options: HttpOptions = {}): Observable<object> {
    return this.http.get(url, {
      headers: new HttpHeaders(options.headers),
      params: new HttpParams({ fromObject: options.search }),
    });
  }

  /**
   *
   * @param url
   * @param data
   * @param {{}} headers
   * @returns {Observable<object>}
   */
  post(url: string, data: any, options: HttpOptions = {}): Observable<object> {
    return this.http.post(url, data, {
      headers: new HttpHeaders(options.headers),
    });
  }
}
