import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  user! : User;

  constructor(
    private auth: AuthenticationService,
    private userService : UserService,
    ) { }

  ngOnInit(): void {
    this.user = this.userService.getUser();
  }

  public logout() {
    this.auth.logout();
  }

}
