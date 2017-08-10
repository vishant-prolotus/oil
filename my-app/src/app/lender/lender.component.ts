import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { RequestService } from '../request.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';

@Component({
  selector: 'app-lender',
  templateUrl: './lender.component.html',
  styleUrls: ['./lender.component.css']
})
export class LenderComponent implements OnInit {
lenderID;
CaseData;
Amount;
ReadData;
proposalData;
  constructor(private router: Router,public request:RequestService,public http: Http) { }

  ngOnInit() {
    this.lenderID = JSON.parse(localStorage.getItem('User'));
    let obj={
      arg:this.lenderID._id,//caseStack
    };
    this.request.post('http://localhost:8182/api/readData',obj).subscribe((res:any)=>{
      this.ReadData = JSON.parse(res._body);
      console.log(this.ReadData);
      let obj1={
        arg:'caseStack'
      }
      this.request.post('http://localhost:8182/api/readData',obj1).subscribe((data:any)=>{
        this.CaseData = JSON.parse(data._body);
        this.CaseData = JSON.parse(this.CaseData);
        console.log(this.CaseData);
      });
    },(err)=>{
      console.log(err);
    });
  }

  ModalChange(e) {
    this.proposalData = e;
  }

  MakeProposal() {
    let obj={
      lenderId:this.lenderID._id,
      caseId:this.proposalData.id,
      adminId:this.proposalData.administrativeAgentId,
      amount:this.Amount,
    }
    this.request.post('http://localhost:8182/api/makeProposals',obj).subscribe((res:any)=>{
      console.log(res);
      window.location.reload();
    },(err)=>{
      console.log(err);
    });
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
