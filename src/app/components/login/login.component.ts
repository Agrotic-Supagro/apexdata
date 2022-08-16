import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../dialogs/info-dialog/info-dialog.component';
import {FormControl, Validators} from '@angular/forms';
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

  constructor(private auth: AuthenticationService,
              private router: Router,
              public _snackBar : MatSnackBar,
              public dialog : MatDialog,
              
              ) { }

  ngOnInit() {
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
            title: 'Erreur',
            text: 'Identifiants incorrects, veuillez réessayer.',
            btn: 'Ok'
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
        emailSent: "L'email a été envoyé.",
        emailDoesntExist : "Erreur. L'email n'existe pas. Veuillez vous inscrire.",
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
