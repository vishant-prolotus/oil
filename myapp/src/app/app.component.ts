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
    let currUser = JSON.parse(localStorage.getItem("User"));
    if(currUser){
        switch(currUser.type){
        case "Lender":
            this.router.navigate(['/lender']);
            break;
        case "Admin":
            this.router.navigate(['/admin']);
            break;
        case "Auditor":
            this.router.navigate(['/auditor']);
            break;
        case "Engineer":
            this.router.navigate(['/engineer']);
            break;
        case "Borrower":
            this.router.navigate(['/borrower']);
            break;
    }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
