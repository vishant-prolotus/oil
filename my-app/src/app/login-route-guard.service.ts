import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router}  from '@angular/router';
import { AuthService } from './auth.service';
import { User } from './users/user';
import { Subscription }   from 'rxjs/Subscription';

@Injectable()
export class LoginRouteGuardService implements CanActivate {
user: User;
message: String;
  constructor(private router: Router, private authService: AuthService) { }

  canActivate() {
    let currUser = JSON.parse(localStorage.getItem('currentUser')); 
        if(currUser){
          this.router.navigate(['/borrower']);
        return true;
      }
      this.router.navigate(['/login']);
      return false;
  }
}
