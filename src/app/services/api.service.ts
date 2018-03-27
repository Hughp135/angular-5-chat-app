import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

export interface HttpOptions {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
}

@Injectable()
export class ApiService {
  public BASE_URL = `${environment.api_url}/api/`;

  constructor(private http: HttpClient) { }

  /**
   *
   * @param url
   * @param {{}} options
   * @returns {Observable<object>}
   */
  get(url: string, options: HttpOptions = {}): Observable<object> {
    return this.http.get(`${this.BASE_URL}${url}`, {
      headers: new HttpHeaders(options.headers),
      params: new HttpParams({ fromObject: options.query }),
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
    return this.http.post(`${this.BASE_URL}${url}`, data, {
      headers: new HttpHeaders(options.headers),
    });
  }
}
