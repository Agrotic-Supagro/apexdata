import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DateService } from 'src/app/services/date.service';
import { UserService } from 'src/app/services/user.service';
import { InfoDialogComponent } from '../dialogs/info-dialog/info-dialog.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  user! : User;
  userLoaded : boolean = false;

  modifyingPrenom : boolean = false;
  modifyingNom : boolean = false;
  modifyingEmail : boolean = false;
  modifyingMdp : boolean = false;
  modifyingStructure : boolean = false;

  savingPrenom : boolean = false;
  savingNom : boolean = false;
  savingEmail : boolean = false;
  savingMdp : boolean = false;
  savingStructure : boolean = false;

  sendingData : boolean = false;

  
    prenom = new FormControl('', [Validators.required, Validators.maxLength(40)]);
    nom = new FormControl('', [Validators.required, Validators.maxLength(40)]);
    mot_de_passe = new FormControl('', [Validators.required, Validators.maxLength(40)]);
    email = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]);
    structure = new FormControl('', [Validators.required, Validators.maxLength(40)]);
  

  constructor(
    private auth: AuthenticationService,
    private userService : UserService,
    private dateformat : DateService,
    private dialog : MatDialog,
    public _snackBar : MatSnackBar,
    ) { }

  ngOnInit(): void {
    let credentials = {
      email: this.userService.getUser().email,
      mot_de_passe: this.userService.getUser().mot_de_passe,
    };
    this.userService.getServerUser(credentials).then((res) => {
      this.user = this.userService.getUser();
      this.setFormsValues();
      this.userLoaded = true;
    })
    .catch(error => {
      console.log(error)
      this.auth.logout();
    })
  }

  saveInfo(info : string){
    const today = this.dateformat.getDatetime(new Date().toISOString());
    const dataUpdate = {
      prenom: this.prenom.value,
      nom: this.nom.value,
      email: this.email.value,
      structure: this.structure.value,
      date_maj: today,
      etat: 0,
      id_utilisateur: this.user.id_utilisateur
    };
    const dataServer = {
      table: 'utilisateur',
      data: dataUpdate
    };
    this.manageSpinner(info, true);
    this.userService.syncUser(dataServer).then( (res : any) => {
      this.manageSpinner(info, false);
      if (res.status) {
        this.updateLocalUser();
        this.setFormsValues();
        this.openSnackBar("Informations mises à jour.", "Fermer");
      }
     else {
      this.setFormsValues();
      this.openSnackBar("Erreur dans la mise à jour de vos informations.", "Fermer");
      }
    })
    .catch(error => {
      this.manageSpinner(info, false);
      this.openSnackBar("Erreur dans la mise à jour de vos informations.", "Fermer");
      this.setFormsValues();
    })
  }

  async changePwd() {
    const pwd = this.mot_de_passe.value;
    const dataPwd = {mot_de_passe: pwd, email: this.user.email, idUser: this.user.id_utilisateur};
    this.manageSpinner('mdp', true);
    this.auth.changePassword(dataPwd).subscribe(async res => {
      this.manageSpinner('mdp', false);
      if (res.status) {
        this.updateLocalUser();
        this.openSnackBar("Mot de passe mis à jour.", "Fermer");
        this.setFormsValues();
      } else {
        this.openSnackBar("Erreur dans la mise à jour de votre mot de passe.", "Fermer");
        this.setFormsValues();
      }
    });
  }

  public updateLocalUser(){
    const dataUser = {
      id_utilisateur: this.user.id_utilisateur,
      prenom: this.prenom.value,
      nom: this.nom.value,
      email: this.email.value!.toLocaleLowerCase(),
      mot_de_passe: this.mot_de_passe.value,
      structure: this.structure.value
    };
    window.localStorage.removeItem('user');
    window.localStorage.setItem('user', JSON.stringify(dataUser));
    this.userService.initUser();
    this.user = this.userService.getUser();
  }

  public setFormsValues(){
    this.prenom.setValue(this.user.prenom);
    this.nom.setValue(this.user.nom);
    this.mot_de_passe.setValue(this.user.mot_de_passe);
    this.email.setValue(this.user.email);
    this.structure.setValue(this.user.structure);
  }

  public sendData() {
    this.sendingData = true;
    const data = { email: this.user.email, method: 'all', userName: this.user.nom, idUser: this.user.id_utilisateur};
    this.userService.sendData(data).subscribe((res : any) => {
      this.sendingData = false;
      if (res.status) {
        this.openSnackBar('Données envoyées, veuillez consulter votre e-mail.', "Fermer");
      } else {
        this.openSnackBar("Erreur dans l'envoi de vos données.", "Fermer");
      }
    });
  }

  manageSpinner(info : string, active : boolean){
    switch (info) {
      case 'prenom' :
        if(active){
          this.savingPrenom = true;
        }
        else{
          this.savingPrenom = false;
          this.modifyingPrenom = false;
        }
        break;
      case 'nom' :
        if(active){
          this.savingNom = true;
        }
        else{
          this.savingNom = false;
          this.modifyingNom = false;
        }
        break; 
      case 'email' :
        if(active){
          this.savingEmail = true;
        }
        else{
          this.savingEmail = false;
          this.modifyingEmail = false;
        }
        break;  
      case 'mdp' :
        if(active){
          this.savingMdp = true;
        }
        else{
          this.savingMdp = false;
          this.modifyingMdp = false;
        }
        break;   
      case 'structure' :
        if(active){
          this.savingStructure = true;
        }
        else{
          this.savingStructure = false;
          this.modifyingStructure = false;
        }
        break;    
    }
  }

  public changeInfos(param : string){
    switch (param) {
      case 'prenom' :
        this.modifyingPrenom = true;
        break;
      case 'nom' :
        this.modifyingNom = true;
        break; 
      case 'email' :
        this.modifyingEmail = true;
        break;  
      case 'mdp' :
        this.modifyingMdp = true;
        break;   
      case 'structure' :
        this.modifyingStructure = true;
        break;    
    }
  }

  public cancel(param : string){
    this.setFormsValues();
    switch (param) {
      case 'prenom' :
        this.modifyingPrenom = false;
        break;
      case 'nom' :
        this.modifyingNom = false;
        break; 
      case 'email' :
        this.modifyingEmail = false;
        break;  
      case 'mdp' :
        this.modifyingMdp = false;
        break;   
      case 'structure' :
        this.modifyingStructure = false;
        break;    
    }
  }

  openSnackBar(message: string, action? : string) {
    this._snackBar.open(message, action ? action : undefined);
  }

}
