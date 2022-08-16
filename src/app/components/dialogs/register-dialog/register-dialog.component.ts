import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    public _snackBar : MatSnackBar) {}

  ngOnInit(): void {
  }

  register(){
    this.auth.register(this.registrationForm.value).subscribe(async res => {
      if (res.status) {
        this.router.navigateByUrl('/login');
        this.openSnackBar('Inscription réussie ! Vous pouvez vous connecter.');
      } else {
        this.openSnackBar('Cet e-mail est déjà inscrit. Si vous ne vous souvenez pas de votre mot de passe utilisez la procédure mot de passe oublié, merci.');
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
