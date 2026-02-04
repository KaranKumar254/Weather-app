import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from './Weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  city: string = '';
  weather: any;
  weeklyForecast: any[] = [];
  recognition: any;
  currentTime: string = '';

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    this.getCurrentLocationWeather();
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  // Weather Mapping Logic (Naye API ke format ke liye)
  private mapWeatherData(data: any) {
    this.weather = {
      name: data.location.name,
      sys: { country: data.location.country },
      main: {
        temp: data.current.temp_c,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb
      },
      wind: { speed: data.current.wind_kph },
      clouds: { all: data.current.cloud },
      weather: [{
        description: data.current.condition.text,
        icon: data.current.condition.icon // Yeh full URL hota hai
      }]
    };

    // 7 din ka forecast map karein
    this.weeklyForecast = data.forecast.forecastday.map((day: any) => ({
      dt: day.date_epoch,
      temp: { day: day.day.avgtemp_c },
      weather: [{ 
        description: day.day.condition.text, 
        icon: day.day.condition.icon 
      }]
    }));
  }

  getWeatherByLocation() {
    if (!this.city) {
      alert('Please enter a city or village name');
      return;
    }
    this.weatherService.getWeather(this.city).subscribe({
      next: (data: any) => {
        this.mapWeatherData(data);
      },
      error: () => {
        alert('City/Village not found or API error');
      }
    });
  }

  getCurrentLocationWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.weatherService.getWeatherByCoords(lat, lon).subscribe({
          next: (data: any) => {
            this.mapWeatherData(data);
          },
          error: () => {
            alert('Unable to get weather for current location');
          }
        });
      }, () => {
        // Default location agar user allow na kare (e.g., Delhi)
        this.city = 'Delhi';
        this.getWeatherByLocation();
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  getCountryFullName(code: string): string {
    const countries: { [key: string]: string } = {
      IN: 'India',
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      India: 'India' // WeatherAPI kabhi kabhi pura naam bhi deta hai
    };
    return countries[code] || code;
  }

  startListening() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }
    this.recognition = new (window as any).webkitSpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.start();
    this.recognition.onresult = (event: any) => {
      this.city = event.results[0][0].transcript;
      this.getWeatherByLocation();
    };
  }
}