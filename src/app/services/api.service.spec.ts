import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';
// tslint:disable:no-unused-expression

describe('ApiService', () => {
  let injector: TestBed;
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    injector = getTestBed();
    service = injector.get(ApiService);
    httpMock = injector.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('get request succeeds', () => {
    const response = { success: true };
    service.get('hi', { headers: { 'Authorization': 'someValue' } }).subscribe(result => {
      expect(result).toEqual(response);
    });
    const called = httpMock.expectOne(`${service.BASE_URL}hi`);
    expect(called.request.headers.has('Authorization')).toBeTruthy;
    expect(called.request.headers.get('Authorization')).toEqual('someValue');
    expect(called.request.method).toBe('GET');
    called.flush(response, { status: 200, statusText: 'Success' });
  });
  it('GET 400 triggers error callback', () => {
    const response = { success: true };
    service.get('hi').subscribe(result => {
      throw new Error('Expected error event to be called, instead got result ' + result);
    }, (e) => {
      expect(e.status).toEqual(401);
      expect(e.statusText).toEqual('Unauthorized');
    });

    const req = httpMock.expectOne(`${service.BASE_URL}hi`);
    expect(req.request.method).toBe('GET');
    req.flush(response, { status: 401, statusText: 'Unauthorized' });
  });
  it('post request succeeds', () => {
    const response = { success: true };
    service.post('bye', { test: 1 }, { headers: { 'HeaderName': 'aValue' } }).subscribe(result => {
      expect(result).toEqual(response);
    });

    const called = httpMock.expectOne(`${service.BASE_URL}bye`);
    expect(called.request.headers.has('HeaderName')).toBeTruthy;
    expect(called.request.headers.get('HeaderName')).toEqual('aValue');
    expect(called.request.method).toBe('POST');
    called.flush(response, { status: 200, statusText: 'Success' });
  });
  it('post request fails', () => {
    const response = { succes: true };
    service.post('bye', { test: 1 }).subscribe(result => {
      throw new Error('Expected error event to be called, instead got result ' + result);
    }, (e) => {
      expect(e.status).toEqual(500);
      expect(e.statusText).toEqual('Error');
    });

    const req = httpMock.expectOne(`${service.BASE_URL}bye`);
    expect(req.request.method).toBe('POST');
    req.flush(response, { status: 500, statusText: 'Error' });
  });
  it('delete request succeeds', () => {
    const response = { success: true };
    service.delete('hi', { headers: { 'Authorization': 'someValue' } }).subscribe(result => {
      expect(result).toEqual(response);
    });
    const called = httpMock.expectOne(`${service.BASE_URL}hi`);
    expect(called.request.headers.has('Authorization')).toBeTruthy;
    expect(called.request.headers.get('Authorization')).toEqual('someValue');
    expect(called.request.method).toBe('DELETE');
    called.flush(response, { status: 200, statusText: 'Success' });
  });
  it('delete error callback', () => {
    const response = { success: true };
    service.delete('hi').subscribe(result => {
      throw new Error('Expected error event to be called, instead got result ' + result);
    }, (e) => {
      expect(e.status).toEqual(401);
      expect(e.statusText).toEqual('Unauthorized');
    });

    const req = httpMock.expectOne(`${service.BASE_URL}hi`);
    expect(req.request.method).toBe('DELETE');
    req.flush(response, { status: 401, statusText: 'Unauthorized' });
  });
});
