import { Component, OnInit } from '@angular/core';
import { RequestService } from '../request.service';
import { Router}  from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';

@Component({
  selector: 'app-auditor',
  templateUrl: './auditor.component.html',
  styleUrls: ['./auditor.component.css']
})
export class AuditorComponent implements OnInit {
file;
date;
data;
requestID;
creditDays;
auditorID;
loanAmount;
  constructor(public http: Http,private router: Router,public request:RequestService) { }

  ngOnInit() {
    this.auditorID = JSON.parse(localStorage.getItem('User'));//admin id 
    let obj={
      arg:this.auditorID._id
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      this.data = JSON.parse(res._body);
      this.data = JSON.parse(this.data);
      console.log(this.data);
      this.data = this.data.requests;
      console.log(this.data);
    },(err)=>{
      console.log(err);
    });
  }

  ModalChange(e) {
    this.requestID = e.id;
  }

  Fileevent(e) {
    const files = e.target.files;
    this.file = files[0];
  }

  Submit() {
    let formData:FormData = new FormData();
    formData.append("file", this.file, this.file.name);
    let obj = {
      requestId:this.requestID,
      auditorId:this.auditorID._id,
      creditDays: this.creditDays,
      loanAmount:this.loanAmount,
      date:this.date
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('http://localhost:8182/api/addFinancialStatement', formData, options)
    .map(res => res.json())
    .subscribe(
        data => console.log('success'),
        error => console.log(error)
    );
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
