import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../dialogs/info-dialog/info-dialog.component';
import {FormControl, Validators} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ResetpwdDialogComponent } from '../dialogs/resetpwd-dialog/resetpwd-dialog.component';
import { RegisterDialogComponent } from '../dialogs/register-dialog/register-dialog.component';

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
  

  email = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]);
  password = new FormControl('', [Validators.required]);
  hide = true;
  langSelected = "";
  languageIconPath = ""
  serverIconPath = "https://www.agrotic.org/apexv3-sync/traduction/assets/countriesIcons/";

  //Trad objects
  errorConn = { key : "errorConn", value : ""};
  wrongID = { key : "wrongID", value : ""};
  emailSent  = { key : "emailSent", value : ""};
  emailDoesntExist  = { key : "emailDoesntExist", value : ""};
  okBtn  = { key : "okBtn", value : ""};
  tabOfVars = [ this.errorConn,  this.wrongID, this.emailSent, this.emailDoesntExist,
    this.okBtn];

  constructor(private auth: AuthenticationService,
              private router: Router,
              public _snackBar : MatSnackBar,
              public dialog : MatDialog,
              private _translate: TranslateService,
              
              ) { }

  ngOnInit() {
    this.langSelected = "fr";
    this._translateLanguage();
  }

  changeLang(value : string){
    this._translate.use(value);
    for(const elem of this.tabOfVars){
      this._translate.get(elem.key).subscribe( res => {
        elem.value = res;
      })
    }
    this.langSelected = value;
    this.languageIconPath = this.serverIconPath+this.langSelected+".png";
  }

  _translateLanguage(): void {
    this.languageIconPath = this.serverIconPath+this.langSelected+".png";
    this._translate.use(this.langSelected);
    for(const elem of this.tabOfVars){
      this._translate.get(elem.key).subscribe( res => {
        elem.value = res;
      })
    }
  }

  login() {
    let credentials = {
        email: this.email.value!,
        mot_de_passe: this.password.value!
    };
    this.auth.login(credentials).subscribe(async res => {
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
    this.presentPrompt();
  }

  async presentPrompt() {
    const dialogRef = this.dialog.open(ResetpwdDialogComponent, {
      data: {
        emailSent: this.emailSent.value,
        emailDoesntExist : this.emailDoesntExist.value,
      },
    });
  }

  showRegisterForm(){
    const dialogRef = this.dialog.open(RegisterDialogComponent);
  }

  openSnackBar(message: string, action? : string) {
    this._snackBar.open(message, action ? action : undefined);
  }
  
}
