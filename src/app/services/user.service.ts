import { HttpClient } from '@angular/common/http';
import { Injectable, resolveForwardRef } from '@angular/core';
import { User } from '../models/User';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

const TOKEN_KEY = 'TOKEN_KEY';

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

  getServerUser(credentials: {email: string, mot_de_passe: string}) {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/login.php`, credentials).subscribe((res: any) => {
        if (res.status) {
          try{
            window.localStorage.setItem(TOKEN_KEY, res.jwt);
            const dataUser = {
              id_utilisateur: res.data.id_utilisateur,
              prenom: res.data.prenom,
              nom: res.data.nom,
              email: res.data.email.toLowerCase(),
              mot_de_passe: credentials.mot_de_passe,
              structure: res.data.structure
            };
            window.localStorage.setItem('user', JSON.stringify(dataUser));
            this.initUser();
            const data = {
              jwt: res.jwt,
              email: credentials.email.toLowerCase(),
              mot_de_passe: credentials.mot_de_passe
            };
            resolve(res);
          }
          catch(error){
            resolve(error);
            console.log(error);
          }
      }
      else{
        //LOGIN FAILED
        reject(new Error("login failed"));
      }
      })
    })
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
