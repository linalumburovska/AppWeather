import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrentCityService } from './current-city.service';
import { CitiesService } from '../cities.service';
import { Subscription} from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CurrentCityData } from './current-city.interface';

@Component({
  selector: 'app-current-city',
  templateUrl: './current-city.component.html',
  styleUrls: ['./current-city.component.css']
})
export class CurrentCityComponent implements OnInit, OnDestroy {

  currentCityData: CurrentCityData;

  private unsubscribe$: Subscription;

  constructor(private currentCityService: CurrentCityService, private cityService: CitiesService) {
  }

  ngOnInit() {

    // This works only on Windows
    // navigator.geolocation.getCurrentPosition((position) => {
    //   const lat = position.coords.latitude;
    //   const long = position.coords.longitude;
    //   this.getWeather(lat, long);
    // });

    // Because of HTTPS protocol on Safari lat and long for Skopje are hardcoded
    const lat = 42.0050;
    const long = 21.4408;
    this.getWeather(lat, long);
  }

  getWeather = (lat: number, long: number): any => {
    this.unsubscribe$ = this.currentCityService.getTmpLocation(lat, long).pipe(
      mergeMap((data: any) => {
        return this.cityService.getCityByParameter(data.name).pipe(
          mergeMap((cityData: any) => {
            this.currentCityData = cityData;
            this.currentCityData.country = cityData.sys.country;
            this.currentCityData.temp = cityData.main.temp;
            this.currentCityData.maxTemp = cityData.main.temp_max;
            this.currentCityData.minTemp = cityData.main.temp_min;
            this.currentCityData.humidity = cityData.main.humidity;
            this.currentCityData.windSpeed = cityData.wind.speed;
            this.currentCityData.weatherMain = cityData.weather[0].main;
            this.currentCityData.weatherDesc = cityData.weather[0].description;
            this.currentCityData.time = cityData.dt;
            this.currentCityData.imgUrl = 'http://openweathermap.org/img/wn/' +  cityData.weather[0].icon + '@2x.png';
            return this.cityService.getCityByParameter(cityData.name);
          })
        );
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.unsubscribe();
  }
}
