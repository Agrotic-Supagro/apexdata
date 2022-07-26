import { Injectable } from '@angular/core';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private static user : User;

  constructor() {}

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
