import { Component, OnInit } from '@angular/core';
import { RequestService } from '../request.service';
import { Router}  from '@angular/router';
import * as _ from 'lodash';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-hedge-agrement',
  templateUrl: './hedge-agrement.component.html',
  styleUrls: ['./hedge-agrement.component.css']
})
export class HedgeAgrementComponent implements OnInit {
HedgeAgreements=[];
modalData;
loanId;
BreakHedgeAgreements=[];
adminId;
hedgeData=[];
file;
BaseValue;
HedgeData;
markTomarket;
HedgeProposals;
loanLenders=[];
  constructor(private router: Router,public request:RequestService,public http: Http) { }

  ngOnInit() {
    this.adminId = JSON.parse(localStorage.getItem('User'));//admin id 
    let obj1={
      arg:'loanStackKey'
    }
    this.request.post('http://localhost:8182/api/readData',obj1).subscribe((res:any)=>{
        this.HedgeAgreements = JSON.parse(JSON.parse(res._body));
        console.log(this.HedgeAgreements);
        let obj={
        arg:this.adminId._id
        };
        this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
          let data = JSON.parse(JSON.parse(res._body));
          console.log(data);
          this.HedgeData = data.hedgeAgreements;
          console.log(this.HedgeData);
          this.HedgeProposals = data.loans;
          console.log(this.HedgeProposals);
          let self = this;
          _.each(self.HedgeData,function(hd) {
            _.each(self.HedgeAgreements,function(he,index) {
              if(hd.loanId==he.loanId){
                self.HedgeAgreements.splice(index);
                self.BreakHedgeAgreements.push(he);
                console.log(he);
              }
            })
          })
        },(err)=>{
          console.log(err);
        });
    },(err)=>{
        console.log(err);
    });
  }

  HedgerSelect(e) {
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

  LenderSelect(e) {
    this.loanLenders.push(e);
    console.log(this.loanLenders);
  }

   Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ModalData(e,msg) {
    this.modalData =e;
    if(msg=='add' && this.adminId.type=='Admin') {
      let self = this;
      _.each(this.HedgeProposals,function(hp,index) {
        if(e.loanId==hp.loanId) {
          self.loanId = e.loanId;
          self.modalData = hp.hedgeProposals;
        }
      });
      console.log(this.modalData);
    }
  }

  fileChange(event) {
    const files = event.target.files;
    this.file = files[0];
  }

  AddHedgeAgreement() {
    let obj;
    let formData:FormData = new FormData();
    formData.append("file", this.file, this.file.name);
    if(this.adminId.type=='Admin') {
      obj = {
      adminId:this.adminId._id,
      loanId:this.loanId,
      baseValue:this.BaseValue,
      hedgers:this.loanLenders
    }
    var string = JSON.stringify(obj);
    formData.append('fields',string);
    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
    headers.append('Accept', 'application/json');
    console.log(obj);
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
  }  else if(this.adminId.type=='Lender') {
      obj = {
        lenderId:this.adminId._id,
        loanId:this.modalData.loanId,
        baseValue:this.BaseValue,
      }
      console.log(obj);
      var string = JSON.stringify(obj);
      formData.append('fields',string);
      let headers = new Headers();
      headers.append('enctype', 'multipart/form-data');
      headers.append('Authorization', 'Bearer '+ localStorage.getItem("token"));
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post('http://localhost:8182/api/addHedgeAgreementByLender', formData, options)
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

  BreakHedgeAgreement() {

    if(this.adminId.type=='Admin') {

      let obj={
      adminId:this.adminId._id,
      hedgeId:this.modalData.hedgeId,
      markToMarket:this.markTomarket
      }
      this.request.post('http://localhost:8182/api/breakHedgeForAdmin',obj).subscribe((res:any)=>{
        window.location.reload();
        console.log(res);
      },(err)=>{
        console.log(err);
      });
    } else if(this.adminId.type=='Lender') {

      let obj={
        lenderId:this.adminId._id,
        hedgeId:this.modalData.hedgeId,
        markToMarket:this.markTomarket
      }
      this.request.post('http://localhost:8182/api/breakHedgeForLender',obj).subscribe((res:any)=>{
        window.location.reload();
        console.log(res);
      },(err)=>{
        console.log(err);
      });
    }
  }

  DashBoard() {
        switch(this.adminId.type){
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
