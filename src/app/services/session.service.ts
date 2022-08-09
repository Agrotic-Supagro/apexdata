import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { Session } from '../models/Session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  AUTH_SERVER_ADDRESS = 'https:/apexvigne.agrotic.org/data/api';

  constructor(
    private  httpClient: HttpClient,
    private userService : UserService
    ) {}
  

  retrieveSessionsData(year : string) {
    let sessions : Session[] = [];
    let jsonData = {
      param: 'sessionData',
      campagne : year,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_sessions_data.php`, jsonData)
      .subscribe((res : any) => {
        for(const elem of res.data){
          let session = this.JSONtoParcelle(elem);
          sessions.push(session);
        }
        resolve(sessions);
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveCampagnesData(){
    let years : string[] = [];
    let jsonData = {
      param: 'campagneData',
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_campagnes_data.php`, jsonData)
      .subscribe((res : any) => {
        for(const obj of res.data){
          years.push(obj.year)
        }
        resolve(years);
      },
      error => {
        reject(error)
      })
    })
  }

  getYearFromDate(sqlDate: string): string {
    var arr1 = sqlDate.split(' ');
    var arr2 = arr1[0].split('-');
    return arr2[0];
  }

  JSONtoParcelle(data : any){
    return new Session(
      data.id_session,
      data.id_parcelle,
      data.date_session,
      data.date_maj,
      data.nom_parcelle, 
      data.moyLat,
      data.moyLong,
      data.apex0,
      data.apex1,
      data.apex2,
    )
  }

}
