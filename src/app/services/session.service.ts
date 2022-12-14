import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { Session } from '../models/Session';
import { Campagne } from '../models/Campagne';
import { Week } from '../models/Week';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  AUTH_SERVER_ADDRESS = 'https:/apexvigne.agrotic.org/data/api';

  constructor(
    private  httpClient: HttpClient,
    private userService : UserService
    ) {}
  

  retrieveSessionsData(year : string, week : string) {
    let sessions : Session[] = [];
    let jsonData = {
      param: 'sessionData',
      campagne : year,
      semaine : week,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_sessions_data.php`, jsonData)
      .subscribe(async (res : any) => {
        for(const elem of res.data){
          let session = this.JSONtoSession(elem, parseInt(week));
          let jsonDataOldSession = {
            param: 'oldsessionData',
            idUser: this.userService.getUser().id_utilisateur,
            idParcelle: session.id_parcelle,
            dateSession : elem.date_session
          }
          await this.retrieveOldSessionData(jsonDataOldSession, session)
          .catch(error => {
            reject(error);
          });
          sessions.push(session);
        }
        resolve(sessions);
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveDetailsParcelleData(idParcelle : string, year : string){
    let sessions : Session[] = [];
    let jsonData = {
      param: 'parcelleDetails',
      campagne : year,
      idParcelle : idParcelle,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_sessions_data.php`, jsonData)
      .subscribe(async (res : any) => {
        for(const elem of res.data){
          let session = this.JSONtoSession(elem);
          sessions.push(session);
        }
        //reverse for dates -> ASC in charts
        resolve(sessions.reverse());
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveSessionsExportData(year : string, id_parcelle : string) {
    let sessions : Session[] = [];
    let jsonData = {
      param: 'sessionExportData',
      campagne : year,
      idParcelle : id_parcelle,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_sessions_data.php`, jsonData)
      .subscribe(async (res : any) => {
        for(const elem of res.data){
          let session = this.JSONtoSession(elem);
          sessions.push(session);
        }
        resolve(sessions);
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveOldSessionData(jsonData : any, session : Session){
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_oldsession_data.php`, jsonData)
      .subscribe( (res : any) => {
        //IF WE HAVE ONE SESSION IN RESULT = SAME SESSION = NO PREVIOUS SESSION
        if(res.data.length >= 2){
          session.setOldSessionValues(parseInt(res.data[1].apex0), parseInt(res.data[1].apex1), parseInt(res.data[1].apex2));
        }
        resolve(session);
      },
      error => {
        reject(error);
      });
    })
  }

  retrieveCampagnesData(){
    let campagnes : Campagne[] = [];
    let jsonData = {
      param: 'campagneData',
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_campagnes_data.php`, jsonData)
      .subscribe((res : any) => {
        for(const obj of res.data){
          campagnes.push(new Campagne(obj.year));
        }
        resolve(campagnes);
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveParcelleCampagnesData(id_parcelle : string){
    let campagnes : Campagne[] = [];
    let jsonData = {
      param: 'parcelleCampagneData',
      idUser: this.userService.getUser().id_utilisateur,
      idParcelle: id_parcelle
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_campagnes_data.php`, jsonData)
      .subscribe((res : any) => {
        for(const obj of res.data){
          campagnes.push(new Campagne(obj.year));
        }
        resolve(campagnes);
      },
      error => {
        reject(error)
      })
    })
  }

  retrieveWeeksData(year : string){
    let weeks : Week[] = [];
    let jsonData = {
      param: 'weekData',
      campagne : year,
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_weeks_data.php`, jsonData)
      .subscribe((res : any) => {
        for(const obj of res.data){
          weeks.push(new Week(obj.week, this.getFirstDayOfWeek(obj.date_session)));
        }
        resolve(weeks);
      },
      error => {
        reject(error)
      })
    })
  }

  getFirstDayOfWeek(sqlDate : string) {
    const date = new Date(sqlDate);
    const day = date.getDay();
    //day of month - day of week (-6 if Sunday), otherwise +1
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const firstDayDate = new Date(date.setDate(diff));
    const tab = firstDayDate.toLocaleDateString().split('/');
    const res = tab[0] + "/" + tab[1];
    return res;
  }

  getYearFromDate(sqlDate: string): string {
    var arr1 = sqlDate.split(' ');
    var arr2 = arr1[0].split('-');
    return arr2[0];
  }

  JSONtoSession(data : any, weekNumber? : number){
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
      weekNumber
    )
  }

}
