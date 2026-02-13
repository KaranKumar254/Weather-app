import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'Paste your API key';
  private apiUrl = 'https://api.weatherapi.com/v1/forecast.json';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('q', city)
      .set('days', '7')
      .set('aqi', 'no');

    return this.http.get(this.apiUrl, { params }).pipe(
      catchError(err => throwError(() => new Error('Location not found')))
    );
  }

  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('q', `${lat},${lon}`)
      .set('days', '7')
      .set('aqi', 'no');

    return this.http.get(this.apiUrl, { params });
  }
}
