import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent implements OnInit {

  registrationForm = new FormGroup({
    id_utilisateur: new FormControl(this.create_UUID()),
    prenom: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    nom: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    mot_de_passe: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]),
    structure: new FormControl('', [Validators.required, Validators.maxLength(40)]),
  });

  //Trad objects
  successRegister = { key : "successRegister", value : ""};
  emailAlreadyExists = { key : "emailAlreadyExists", value : ""};
  tabOfVars = [this.successRegister, this.emailAlreadyExists];

  constructor(
    private _translate: TranslateService,
    private auth: AuthenticationService,
    private router: Router,
    public _snackBar : MatSnackBar) {}

  ngOnInit(): void {
    this._translateLanguage();
  }

  _translateLanguage(): void {
    for(const elem of this.tabOfVars){
      this._translate.get(elem.key).subscribe( res => {
        elem.value = res;
      })
    }
  }

  register(){
    this.auth.register(this.registrationForm.value).subscribe(async res => {
      if (res.status) {
        this.router.navigateByUrl('/login');
        this.openSnackBar(this.successRegister.value);
      } else {
        this.openSnackBar(this.emailAlreadyExists.value);
        this.registrationForm.controls.email.setValue('');
      }
    });
  }

  create_UUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  openSnackBar(message: string, action? : string) {
    this._snackBar.open(message, action ? action : undefined);
  }

}
