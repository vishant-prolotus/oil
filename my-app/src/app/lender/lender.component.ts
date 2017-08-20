import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import * as _ from 'lodash';

@Component({
  selector: 'app-lender',
  templateUrl: './lender.component.html',
  styleUrls: ['./lender.component.css']
})
export class LenderComponent implements OnInit {
lenderID;
CaseData;
Amount;
file;
NotificationData;
length;
loanData;
baseValue;
ReadData;
showdata;
modalData;
proposalsData;
  constructor(private router: Router,public request:RequestService,public http: Http) { }

  ngOnInit() {
    let self = this;
    this.lenderID = JSON.parse(localStorage.getItem('User'));
    let obj={
      arg:this.lenderID._id,//caseStack
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      this.ReadData = JSON.parse(JSON.parse(res._body));
      this.proposalsData = this.ReadData.proposals;
      console.log(this.ReadData);
      let obj1={
        arg:'caseStack'
      }
      this.request.post('http://localhost:8182/api/readData',obj1).subscribe((data:any)=>{
        this.CaseData = JSON.parse(JSON.parse(data._body));
        console.log(this.CaseData);
        _.each(self.CaseData,function(cd) {
          let count=0;
          let data;
          _.each(self.proposalsData,function(pd) {
            if(cd.id==pd.CaseId) {
              count++;
              data=cd;
            }
          });
          if(count>0) {
            self.CaseData.pop(data);
          }
        });
      });
    },(err)=>{
      console.log(err);
    });
    let obj2={
      arg:'loanStackKey'
    }
    this.request.post('http://localhost:8182/api/readData',obj2).subscribe((loan:any)=>{
      this.loanData = JSON.parse(JSON.parse(loan._body));
      console.log(this.loanData);
    },(err)=>{
      console.log(err);
    });
    this.request.post('http://localhost:8182/api/getnotifications',obj).subscribe((res:any)=>{
      this.NotificationData = JSON.parse(res._body);
      this.length = this.NotificationData.length;
    },(err)=>{
      console.log(err);
    });
  }


  ModalChange(e) {
    this.modalData = e;
    console.log(this.modalData);
  }

  MakeProposal() {
    let obj={
      lenderId:this.lenderID._id,
      caseId:this.modalData.id,
      adminId:this.modalData.administrativeAgentId,
      amount:this.Amount,
    }
    this.request.post('http://localhost:8182/api/makeProposals',obj).subscribe((res:any)=>{
      console.log(res);
      window.location.reload();
    },(err)=>{
      console.log(err);
    });
  }

  fileChange(event) {
    const files = event.target.files;
    this.file = files[0];
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
