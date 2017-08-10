import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { RequestService } from '../request.service';
import { User } from '../users/user';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  name;
  password;
  OrgName;
  user;
  User=['Select_User_Type','Admin','Borrower','Lender','Auditor','Engineer'];

  constructor(private router: Router, private authService: AuthService,
  public http: Http,public request:RequestService) {
  }

  Login(){
    let obj = {
      name:this.name,
      password:this.password,
      OrgName:this.OrgName,
      UserType:this.user
    }
    this.request.post('http://localhost:8182/login',obj).subscribe((res:any)=>{
      let result = JSON.parse(res._body);
      localStorage.setItem("token", result.message.token);
      localStorage.setItem("User",JSON.stringify(result.mongod));
      switch(result.mongod.type){
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
    },(err)=>{
      console.log(err);
    });
  }

  onChange(e){
    this.user =e;
  }

}
