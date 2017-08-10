import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { RequestService } from '../request.service';
import { Router}  from '@angular/router';

@Component({
  selector: 'app-manage-case',
  templateUrl: './manage-case.component.html',
  styleUrls: ['./manage-case.component.css']
})
export class ManageCaseComponent implements OnInit {
  uploadedFiles: any[] = [];
  Buisness_name;
  data;
  selectedAdmin;
  selectedEngineer;
  Loan_Amount;
  Credit_Period;
  borrower;
  constructor(public http: Http,public request:RequestService ,private router: Router) { }

  ngOnInit() {
    this.borrower = JSON.parse(localStorage.getItem('User'));
    var obj={
        borrowerid:this.borrower._id
    }
    this.request.post('http://localhost:8182/api/getInitData',obj).subscribe((res:any)=>{
        this.data = JSON.parse(res._body).mongodb
    },(err)=>{
        console.log(err);
    });
  }

  fileChange(event) {
    const files = event.target.files;
    const file = files[0];
    this.uploadedFiles.push(file);
  }

  Upload() {
     let formData:FormData = new FormData();
    for (let i = 0; i < this.uploadedFiles.length; i++) {
        formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    let obj={
        Buisness_name:this.Buisness_name,
        amountRequested:this.Loan_Amount,
        borrowerId:this.borrower._id,
        adminAgentId:this.selectedAdmin,
        requestTo:this.selectedEngineer,
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('http://localhost:8182/api/createCase', formData, options)
        .map(res => res.json())
        .subscribe(
            data => {
                console.log('success')
             window.location.reload();   
            },
            error => console.log(error)
        );
  }

  Download() {
      let obj={
          abc:"abc"
      }
    this.http.post('http://localhost:8182/register/download',obj).subscribe((res)=>{
        console.log(res);
    },(err)=>{
        console.log(err);
    });
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  }
