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
  

  retrieveData() {
    let sessions : Session[] = [];
    let jsonData = {
      table: 'plotdata',
      idUser: this.userService.getUser().id_utilisateur
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/retrieve_sessions_data.php`, jsonData)
      .subscribe((res : any) => {
        console.log("res data : "+JSON.stringify(res.data));
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

  JSONtoParcelle(data : any){
    return new Session(
      data.id_session,
      data.id_parcelle,
      data.date_creation,
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
