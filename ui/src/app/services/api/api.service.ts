import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
