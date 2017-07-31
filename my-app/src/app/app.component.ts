import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from './users/user';
import { Router}  from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent implements OnInit, OnDestroy {
  articles;
  user: User;
  header: boolean = true;
  auditor: boolean = false;
  message: String;
  subscription: Subscription;

  constructor( private authService: AuthService,private router: Router) {
    this.articles = [];
    this.subscription = authService.user$.subscribe( (user) => this.user = user );
    let currUser = localStorage.getItem('token'); 
        if(currUser){
          this.router.navigate(['/borrower']);
        return;
      }
      return;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
