import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../dialogs/info-dialog/info-dialog.component';
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /*credentials = {
      email: 'toto@gmail.com',
      mot_de_passe: 'toto'
    };*/
  credentials = {
    email: '',
    mot_de_passe: ''
  };

  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  hide = true;

  //Trad objects
  errorConn = { key : "errorConn", value : ""};
  wrongID = { key : "wrongID", value : ""};
  reInitMdp  = { key : "reInitMdp", value : ""};
  yourEmail = { key : "yourEmail", value : ""};
  emailSent  = { key : "emailSent", value : ""};
  emailDoesntExist  = { key : "emailDoesntExist", value : ""};
  error  = { key : "error", value : ""};
  waitMsg  = { key : "waitMsg", value : ""};
  okBtn  = { key : "okBtn", value : ""};
  dlMsg  = { key : "dlMsg", value : ""};
  cancel  = { key : "cancel", value : ""};
  send  = { key : "send", value : ""};
  tabOfVars = [ this.errorConn,  this.wrongID, this.reInitMdp, this.yourEmail, this.emailSent, this.emailDoesntExist, this.error, this.waitMsg,
    this.okBtn, this.dlMsg, this.cancel, this.send,];

  constructor(private auth: AuthenticationService,
              private router: Router,
              public _snackBar : MatSnackBar,
              public dialog : MatDialog,
              private _translate: TranslateService,
              
              ) { }

  ngOnInit() {
    this._translateLanguage();
  }

  ngAfterViewInit() {
  }

  _translateLanguage(): void {
    this._translate.use("fr");
    for(const elem of this.tabOfVars){
      this._translate.get(elem.key).subscribe( res => {
        elem.value = res;
      })
    }
  }

  login() {
    console.log('formulaire :', this.credentials);
    this.auth.login(this.credentials).subscribe(async res => {
      console.log('in login return: ', res);
      if (res.status) {
        const navigationExtras: NavigationExtras = {
          state: {
            jwt: res.jwt
          }
        };
        this.router.navigateByUrl('/home');
      } else {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          data: { 
            title: this.errorConn.value,
            text: this.wrongID.value,
            btn: this.okBtn.value
          },
        });
      }
    });
  }

  forgetpwd() {
    console.log('ToDo > mot de passe oublié');
    //this.presentPrompt();
  }

  insert() {
    const data = {id_utilisateur: '4d1h3b977-0611-4a14-8673-6cb3fbd3ce61',
    prenom: 'D',
    nom: 'S',
    email: 'd@gt.gg',
    mot_de_passe: 'x',
    structure: 's'
  };
  }

  // async presentPrompt() {
  //   const alert = await this.alertCtrl.create({
  //     header: this.reInitMdp.value,
  //     inputs: [
  //       {
  //         name: 'email',
  //         type: 'email',
  //         placeholder: this.yourEmail.value
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: this.cancel.value,
  //         role: 'cancel',
  //         handler: data => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: this.send.value,
  //         handler: data => {
  //           const pwd = Math.random().toString(36).slice(-8);
  //           const dataPwd = {mot_de_passe: pwd, email: data.email};
  //           console.log(dataPwd);
  //           this.auth.resetPassword(dataPwd).subscribe(async res => {
  //             if (res.status) {
  //               console.log('## Return reset pwd :', res.data);
  //               this.openSnackBar(this.emailSent.value);
  //             } else {
  //               this.openSnackBar(this.emailDoesntExist.value);
  //             }
  //           });

  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

  openSnackBar(message: string, action? : string) {
    this._snackBar.open(message, action ? action : undefined, {
      verticalPosition : 'top'
    });
  }
  
}
