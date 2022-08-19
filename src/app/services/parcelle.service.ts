import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Parcelle } from '../models/Parcelle';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ParcelleService {

  AUTH_SERVER_ADDRESS = 'https:/apexvigne.agrotic.org/data/api';

  constructor(
    private  httpClient: HttpClient,
    private userService : UserService,
    ) {}
  

  retrieveObservedParcellesData(year : string) {
    let parcelles : Parcelle[] = [];
    let jsonData = {
      param: 'parcelleData',
      campagne : year,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_parcelles_data.php`, jsonData)
      .subscribe(async (res : any) => {
        for(const elem of res.data){
          let parcelle = new Parcelle(elem.id_parcelle, elem.nom_parcelle);
          parcelles.push(parcelle);
        }
        resolve(parcelles);
      },
      error => {
        reject(error)
      })
    })
  }

  //A CONFIRMER
  retrieveParcellesSharedData(year : string) {
    let parcelles : Parcelle[] = [];
    let jsonData = {
      param: 'parcelleSharedData',
      campagne : year,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_parcelles_data.php`, jsonData)
      .subscribe(async (res : any) => {
        for(const elem of res.data){
          let parcelle = new Parcelle(elem.id_parcelle, elem.nom_parcelle, elem.nom, elem.prenom);
          parcelles.push(parcelle);
        }
        resolve(parcelles);
      },
      error => {
        reject(error)
      })
    })
  }

}
