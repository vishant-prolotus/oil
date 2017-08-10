import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css']
})
export class AdministratorComponent implements OnInit {
CaseData;
adminId;
proposalData;
date;
Interval;
file;
hedgers;
baseValue;
ResrvRequired;
loanData;
Term;
Amount;
  constructor(private router: Router,public request:RequestService,public http: Http) { }

  ngOnInit() {
    // this.adminId = JSON.parse(localStorage.getItem('User'));//admin id 
    // let obj={
    //   arg:this.adminId._id
    // };
    // this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
    //   this.CaseData = JSON.parse(res._body);
    //   this.CaseData = JSON.parse(this.CaseData);
    //   console.log(this.CaseData);
    //   this.loanData = this.CaseData.loans;
    //   this.CaseData = this.CaseData.Cases;
    // },(err)=>{
    //   console.log(err);
    // });
  }

  notify() {
    this.adminId = JSON.parse(localStorage.getItem('User'));//admin id 
    let obj={
      arg:this.adminId._id
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      this.CaseData = JSON.parse(res._body);
      this.CaseData = JSON.parse(this.CaseData);
      console.log(this.CaseData);
      this.loanData = this.CaseData.loans;
      this.CaseData = this.CaseData.Cases;
    },(err)=>{
      console.log(err);
    });
  }

  ModalData(o) {
    this.proposalData = o;
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  UpdateLoanPackage(u) {
    let obj={
      administrativeAgentId:this.adminId._id,
      CaseId:u.id,
      status:u.status
    }
    this.request.post('http://localhost:8182/api/updateLoanPackage',obj).subscribe((res:any)=>{
      console.log(res);
    },(err)=>{
      console.log(err);
    });
  }

  MakeLoanPackage(e) {
    let obj={
      adminId:this.adminId._id,
      caseId:this.proposalData.id,
      approvalDate:this.date,
      term:this.Term,
      loanAmount:this.Amount,
      numOfLenders:'1',
      lenders:['fd167df29135dedccb1e063216fda6a2'],
    }
    console.log(obj);
    this.request.post('http://localhost:8182/api/makeLoanPackage',obj).subscribe((res:any)=>{
      window.location.reload();
      console.log(res);
    },(err)=>{
      console.log(err);
    });
  }

  MakeCreditAgrement() {
    let obj={
      adminId:this.adminId._id,
      loanId:this.proposalData.loanId,
      interval:this.Interval,
      reserveRequired:this.ResrvRequired,
    }
    console.log(obj);
    this.request.post('http://localhost:8182/api/makeCreditAgreement',obj).subscribe((res:any)=>{
      window.location.reload();
      console.log(res);
    },(err)=>{
      console.log(err);
    });
  }

  AddHedgeAgreement() {
    let formData:FormData = new FormData();
    formData.append("file", this.file, this.file.name);
    let obj = {
      adminId:this.adminId._id,
      loanId:this.proposalData.loanId,
      baseValue:this.baseValue,
      hedgers:this.hedgers
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('http://localhost:8182/api/addHedgeAgreementByAdminAgent', formData, options)
    .map(res => res.json())
    .subscribe(
        data => {
          console.log('success')
          window.location.reload();
        },
        error => console.log(error)
    );
  }
}
