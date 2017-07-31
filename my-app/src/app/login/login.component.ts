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

  constructor(private router: Router, private authService: AuthService,
  public http: Http,public request:RequestService) {
  }

  Login(){
    let obj = {
      name:this.name,
      password:this.password,
      OrgName:this.OrgName
    }
    this.request.post('http://localhost:8182/login',obj).subscribe((res:any)=>{
      let result = JSON.parse(res._body);
      localStorage.setItem("token", result.token);
      console.log(result);
      console.log(result.token);
      this.router.navigate(['/borrower']);
    },(err)=>{
      console.log(err);
    });
  }

}
