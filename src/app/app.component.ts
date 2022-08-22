import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ApeX Territoires';

  constructor(
    private userService : UserService,
    private auth: AuthenticationService,
  ) {
  }

  ngOnInit(){
    let credentials = {
      email: this.userService.getUser().email,
      mot_de_passe: this.userService.getUser().mot_de_passe,
    };
    this.userService.getServerUser(credentials).then((res) => {
    })
    .catch(error => {
      console.log(error)
      this.auth.logout();
    })
  }
}
