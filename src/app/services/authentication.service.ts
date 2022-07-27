import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

const TOKEN_KEY = 'TOKEN_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  AUTH_SERVER_ADDRESS = 'https:/apexvigne.agrotic.org/data/api';
  authenticationState = new BehaviorSubject(false);
  registerState = new BehaviorSubject(false);
  isOpen = false;

  constructor(
              private  httpClient: HttpClient,
              private router: Router,
    ) {
  }

  checkToken() {
    /* this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    }); */
  }

  login(credentials: {email: string, mot_de_passe: string}): Observable< any > {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/login.php`, credentials).pipe(
      tap(async (res: any) => {
        if (res.status) {
          try{
            window.localStorage.setItem(TOKEN_KEY, res.jwt)
            console.log(res.data);
            const dataUser = {
              id_utilisateur: res.data.id_utilisateur,
              prenom: res.data.prenom,
              nom: res.data.nom,
              email: res.data.email.toLowerCase(),
              mot_de_passe: credentials.mot_de_passe,
              structure: res.data.structure
            };
            window.localStorage.setItem('user', JSON.stringify(dataUser));
            this.authenticationState.next(true);
            const data = {
              jwt: res.jwt,
              email: credentials.email.toLowerCase(),
              mot_de_passe: credentials.mot_de_passe
            };
          }
          catch(error){
            console.log(error);
          }
        }
      })
    );
  }

  register(registrationForm : any): Observable< any > {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/create_user.php`, registrationForm)
    .pipe(
      tap(async (res: any) => {
        if (res.status) {
          this.registerState.next(true);
        }
      })
    );
  }

  resetPassword(data : any): Observable< any > {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/reset_password.php`, data)
    .pipe(
      tap(async (res: any) => {
        return res;
      })
    );
  }

  changePassword(data : any): Observable< any > {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/change_password.php`, data)
    .pipe(
      tap(async (res: any) => {
        return res;
      })
    );
  }

  logout() {
    window.localStorage.clear();
    this.router.navigate(['login']);
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }
}
