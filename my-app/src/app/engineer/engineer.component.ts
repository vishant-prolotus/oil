import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';

@Component({
  selector: 'app-engineer',
  templateUrl: './engineer.component.html',
  styleUrls: ['./engineer.component.css']
})
export class EngineerComponent implements OnInit {
CaseData;
engineerid;
file;
modalData;
Develop;
CrediData;
Undevelop;
date: DateModel;
options: DatePickerOptions;
  constructor(private router: Router,public request:RequestService,public http: Http) {
    this.options = new DatePickerOptions();
   }

  ngOnInit() {
    this.engineerid = JSON.parse(localStorage.getItem('User'));
    let obj={
      arg:this.engineerid._id
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      this.CaseData = JSON.parse(res._body);
      this.CaseData = JSON.parse(this.CaseData);
      console.log(this.CaseData);
      this.CrediData = this.CaseData.creditAgreements;
      this.CaseData = this.CaseData.requests;
    },(err)=>{
      console.log(err);
    });
  }

  Fileevent(e) {
    const files = e.target.files;
    this.file = files[0];
  }

  AddFinancialStmnt() {
    let formData:FormData = new FormData();
    formData.append("file", this.file, this.file.name);
    let obj = {
      engineerId:this.engineerid._id,
      developed:this.Develop,
      undeveloped: this.Undevelop,
      requestId:this.modalData.id,
      date:this.date,
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    console.log(obj);
    this.http.post('http://localhost:8182/api/makeReserveReport', formData, options)
    .map(res => res.json())
    .subscribe(
        data => {
          console.log('success')
         window.location.reload(); 
        },
        error => console.log(error)
    );
  }

  ModalData(u) {
    this.modalData = u;
  }

  UpdateResrvReprt() {
    let formData:FormData = new FormData();
    formData.append("file", this.file, this.file.name);
    let obj={
      engineerId:this.engineerid._id,
      creditId:this.modalData.creditId,
      date:this.date,
      developedCrude:this.Develop,
      undevelopedCrude:this.Undevelop
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    console.log(obj);
    this.http.post('http://localhost:8182/api/updateReserveRep',formData, options)
    .map(res => res.json())
    .subscribe(
        data => {
          console.log('success')
         window.location.reload(); 
        },
        error => console.log(error)
    );
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
