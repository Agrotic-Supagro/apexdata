import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-resetpwd-dialog',
  templateUrl: './resetpwd-dialog.component.html',
  styleUrls: ['./resetpwd-dialog.component.scss']
})
export class ResetpwdDialogComponent implements OnInit {

  email = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$')]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {emailSent : string, emailDoesntExist : string, },
    private auth: AuthenticationService,
    public _snackBar : MatSnackBar,) { }

  ngOnInit(): void {
  }

  resetPwd() {
    const pwd = Math.random().toString(36).slice(-8);
    const dataPwd = {mot_de_passe: pwd, email: this.email.value};
    this.auth.resetPassword(dataPwd).subscribe(async res => {
      if (res.status) {
        this.openSnackBar(this.data.emailSent);
      } else {
        this.openSnackBar(this.data.emailDoesntExist);
      }
    });
  }

  openSnackBar(message: string, action? : string) {
    this._snackBar.open(message, action ? action : undefined);
  }
}
