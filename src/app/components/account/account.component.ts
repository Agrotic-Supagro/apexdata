import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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

  modifyingPrenom : boolean = false;
  modifyingNom : boolean = false;
  modifyingEmail : boolean = false;
  modifyingMdp : boolean = false;
  modifyingStructure : boolean = false;

  savingInfo : boolean = false;
  sendingData : boolean = false;

  modificationForm = new FormGroup({
    prenom: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    nom: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    mot_de_passe: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]),
    structure: new FormControl('', [Validators.required, Validators.maxLength(40)]),
  });

  constructor(
    private auth: AuthenticationService,
    private userService : UserService,
    private dateformat : DateService,
    private dialog : MatDialog,
    ) { }

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.setFormsValues();
  }

  saveInfo(){
    const today = this.dateformat.getDatetime(new Date().toISOString());
    const dataUpdate = {
      prenom: this.modificationForm.value.prenom,
      nom: this.modificationForm.value.nom,
      email: this.modificationForm.value.email,
      structure: this.modificationForm.value.structure,
      date_maj: today,
      etat: 0,
      id_utilisateur: this.user.id_utilisateur
    };
    const dataServer = {
      table: 'utilisateur',
      data: dataUpdate
    };
    this.savingInfo = true;
    this.userService.syncUser(dataServer).then( (res : any) => {
      this.savingInfo = false;
      if (res.status) {
        this.updateLocalUser();
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Succès',
            text: 'Informations mises à jour',
            btn: 'OK'
          },
        });
        dialogRef.afterClosed().subscribe( () => {
          this.resetBooleans();
          this.setFormsValues();
        })
      }
     else {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Erreur',
            text: 'Erreur dans la mise à jour de vos informations',
            btn: 'OK'
          },
        });
        dialogRef.afterClosed().subscribe( () => {
          this.resetBooleans();
          this.setFormsValues();
        })
      }
    })
    .catch(error => {
      this.savingInfo = false;
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        data: { 
          title: 'Erreur',
          text: 'Erreur dans la mise à jour de vos informations',
          btn: 'OK'
        },
      });
      dialogRef.afterClosed().subscribe( () => {
        this.resetBooleans();
        this.setFormsValues();
      })
    })
  }

  async changePwd() {
    const pwd = this.modificationForm.value.mot_de_passe!;
    const dataPwd = {mot_de_passe: pwd, email: this.user.email, idUser: this.user.id_utilisateur};
    this.savingInfo = true;
    this.auth.changePassword(dataPwd).subscribe(async res => {
      this.savingInfo = false;
      if (res.status) {
        this.updateLocalUser();
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Succès',
            text: 'Mot de passe mis à jour',
            btn: 'OK'
          },
        });
        dialogRef.afterClosed().subscribe( () => {
          this.resetBooleans();
          this.setFormsValues();
        })
      } else {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Erreur',
            text: 'Erreur dans la mise à jour de votre mot de passe',
            btn: 'OK'
          },
        });
        dialogRef.afterClosed().subscribe( () => {
          this.resetBooleans();
          this.setFormsValues();
        })
      }
    });
  }

  public updateLocalUser(){
    const dataUser = {
      id_utilisateur: this.user.id_utilisateur,
      prenom: this.modificationForm.value.prenom!,
      nom: this.modificationForm.value.nom!,
      email: this.modificationForm.value.email!.toLocaleLowerCase(),
      mot_de_passe: this.modificationForm.value.mot_de_passe!,
      structure: this.modificationForm.value.structure!
    };
    window.localStorage.removeItem('user');
    window.localStorage.setItem('user', JSON.stringify(dataUser));
    this.userService.initUser();
    this.user = this.userService.getUser();
  }

  public resetBooleans(){
    this.modifyingPrenom = false;
    this.modifyingNom = false;
    this.modifyingEmail = false;
    this.modifyingMdp = false;
    this.modifyingStructure = false;
  }

  public setFormsValues(){
    this.modificationForm.controls.prenom.setValue(this.user.prenom);
    this.modificationForm.controls.nom.setValue(this.user.nom);
    this.modificationForm.controls.mot_de_passe.setValue(this.user.mot_de_passe);
    this.modificationForm.controls.email.setValue(this.user.email);
    this.modificationForm.controls.structure.setValue(this.user.structure);
  }

  public sendData() {
    this.sendingData = true;
    const data = { email: this.user.email, method: 'all', userName: this.user.nom, idUser: this.user.id_utilisateur};
    this.userService.sendData(data).subscribe((res : any) => {
      this.sendingData = false;
      if (res.status) {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Succès',
            text: 'Données envoyées, veuillez consulter votre e-mail.',
            btn: 'OK'
          },
        });
      } else {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: 'Erreur',
            text: "Erreur dans l'envoi de vos données",
            btn: 'OK'
          },
        });
      }
    });
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

}
