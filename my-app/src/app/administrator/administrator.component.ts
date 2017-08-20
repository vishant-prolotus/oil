import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';
import * as _ from 'lodash';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css']
})
export class AdministratorComponent implements OnInit {
CaseData;
adminId;
loanStackData;
modalData;
date;
Interval;
BaseValue;
file;
InitData;
NotificationData;
HedgeData;
hedgers;
baseValue;
ResrvRequired;
loanData;
Term;
loanLenders= [];
length;
Amount;
  constructor(private router: Router,public request:RequestService,public http: Http) { }

  ngOnInit() {
    let self = this;
    this.adminId = JSON.parse(localStorage.getItem('User'));//admin id 
    let obj={
      arg:this.adminId._id
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      console.log(JSON.parse(JSON.parse(res._body)));
      let data = JSON.parse(JSON.parse(res._body));
      this.HedgeData = data.hedgeAgreements;
      this.loanData = data.loans;
      this.CaseData = data.Cases;
    },(err)=>{
      console.log(err);
    });
    this.request.post('http://localhost:8182/api/getnotifications',obj).subscribe((res:any)=>{
      this.NotificationData = JSON.parse(res._body);
      this.length = this.NotificationData.length;
    },(err)=>{
      console.log(err);
    });
    this.request.post('http://localhost:8182/api/getInitData',obj).subscribe((res:any)=>{
        self.InitData = JSON.parse(res._body).mongodb.Lender;
        console.log(self.InitData);
    },(err)=>{
        console.log(err);
    });
    let obj2={
      arg:'loanStackKey'
    }
    this.request.post('http://localhost:8182/api/readData',obj2).subscribe((loan:any)=>{
      this.loanStackData = JSON.parse(JSON.parse(loan._body));
      console.log(this.loanData);
    },(err)=>{
      console.log(err);
    });
  }

  ModalData(o) {
    this.modalData = o;
    let self = this;
    if(this.modalData.proposals) {
      _.each(this.modalData.proposals,function(pro) {
        _.each(self.InitData,function(id) {
          if(pro.lenderId==id._id) {
            pro['name'] = id.User_name;
          }
        });
      });
    }
    console.log(this.modalData);
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  fileChange(event) {
    const files = event.target.files;
    this.file = files[0];
  }

  UpdateLoanPackage(u) {
    let obj={
      administrativeAgentId:this.adminId._id,
      CaseId:u.id,
      status:u.status
    }
    this.request.post('http://localhost:8182/api/updateLoanPackage',obj).subscribe((res:any)=>{
      console.log(res);
      window.location.reload();
    },(err)=>{
      console.log(err);
    });
  }

  MakeLoanPackage(e) {
    let obj={
      adminId:this.adminId._id,
      caseId:this.modalData.id,
      approvalDate:this.date,
      term:this.Term,
      loanAmount:this.Amount,
      lenders:this.loanLenders,
    }
    console.log(obj);
    this.request.post('http://localhost:8182/api/makeLoanPackage',obj).subscribe((res:any)=>{
      window.location.reload();
      console.log(res);
    },(err)=>{
      console.log(err);
    });
  }

  LenderSelect(e) {
    let self = this;
    if(e.target.checked==false) {
      _.each(this.loanLenders,function(ll,index) {
        if(ll==e.target.value) {
          self.loanLenders.splice(index);
        }
      })
    }else if(e.target.checked==true) {
      self.loanLenders.push(e.target.value);
    }
    console.log(self.loanLenders);
  }

  ChangePage(u) {
    this.router.navigate(['/loanView',{data:JSON.stringify(u)}]);
  }

  MakeCreditAgrement() {
    let obj={
      adminId:this.adminId._id,
      loanId:this.modalData.loanId,
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

}
