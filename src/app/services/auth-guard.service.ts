import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

const TOKEN_KEY = 'TOKEN_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router: Router,) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let val = window.localStorage.getItem(TOKEN_KEY);
    if (val != null) {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
