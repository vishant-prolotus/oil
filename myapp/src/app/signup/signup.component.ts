import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
Name;
LegalBNo;
TaxIdNo;
phone;
user;
email;
password1;
password2;
User=['Select_User_Type','Admin','Borrower','Lender','Auditor','Engineer'];

  constructor(public http: Http,private router: Router,public request:RequestService) { }

  ngOnInit() {
  }

  Signup(){
    let obj={
      Name:this.Name,
      UserType:this.user,
      LegalBNo:this.LegalBNo,
      TaxIdNo:this.TaxIdNo,
      phone:this.phone,
      Email:this.email,
      password:this.password1,
    };
    this.request.post('http://localhost:8182/register',obj).subscribe((res:any)=>{
      let result = JSON.parse(res._body);
      localStorage.setItem("token", result.response.token);
      switch(obj.UserType){
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
