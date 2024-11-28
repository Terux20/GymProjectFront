import { Component, OnInit } from '@angular/core';
import { City } from '../../models/city';
import { CityService } from '../../services/city.service';
import { ListResponseModel } from '../../models/listResponseModel';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
})
export class CityComponent implements OnInit {
  cities: City[] = [];
  filteredCities: City[] = [];
  currentCity: City;
  searchTerm: string = '';

  constructor(private cityService: CityService) {}

  ngOnInit(): void {
    this.getCities();
  }
  //ŞEHİRLERİ GETİRME
  getCities() {
    this.cityService
      .getCities()
      .subscribe((response: ListResponseModel<City>) => {
        this.cities = response.data;
        this.filterCities();
      });
  }

  setCurrentCity(city: City) {
    this.currentCity = city;
  }

  filterCities() {
    this.filteredCities = this.cities.filter((city) =>
      city.cityName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  getAllCityClass() {
    if (!this.currentCity) {
      return 'list-group-item active';
    } else {
      return 'list-group-item';
    }
  }

  getCurrentCityClass(city: City) {
    if (city == this.currentCity) {
      return 'list-group-item active';
    } else {
      return 'list-group-item';
    }
  }
}
