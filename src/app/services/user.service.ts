import { HttpClient } from '@angular/common/http';
import { Injectable, resolveForwardRef } from '@angular/core';
import { User } from '../models/User';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private static user : User;

  AUTH_SERVER_ADDRESS = 'https:/apexvigne.agrotic.org/data/api';

  constructor( 
    private  httpClient: HttpClient,
    ) {}

  getUser(){
    if(UserService.user == undefined || UserService.user == null){
      this.initUser();
      return UserService.user;
    }
    else{
      return UserService.user;
    }
  }

  initUser(){
    try{
      let userData = window.localStorage.getItem('user');
      let json = JSON.parse(userData!);
      let user = this.JSONtoUser(json);
      this.setUser(user);
    }
    catch(error){
      console.log(error)
    }
  }

  setUser(user : User){
    UserService.user = user;
  }

  syncUser(data : any) {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/sync_data.php`, data)
      .subscribe( (res) => {
        resolve(res);
      },
      error => {
        reject(error);
      })
    });
  }

  // envoyer les données à l'utilisateur
  sendData(data : any) {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/send_data.php`, data)
    .pipe(
      tap(async (res: any) => {
        return res;
      })
    );
  }

  JSONtoUser(data : any){
    return new User(
      data.id_utilisateur, 
      data.prenom,
      data.nom,
      data.email,
      data.mot_de_passe,
      data.structure,
    )
  }
  
}
