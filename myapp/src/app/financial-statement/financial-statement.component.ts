import { Component, OnInit } from '@angular/core';
import { RequestService } from '../request.service';
import { Router}  from '@angular/router';

@Component({
  selector: 'app-financial-statement',
  templateUrl: './financial-statement.component.html',
  styleUrls: ['./financial-statement.component.css']
})
export class FinancialStatementComponent implements OnInit {
  data;
  borrower;
  selectedAuditor;
  constructor(public request:RequestService ,private router: Router) { }

  ngOnInit() {
    this.borrower = JSON.parse(localStorage.getItem('User'));
    var obj={
        borrowerid:this.borrower._id
    }
    this.request.post('http://localhost:8182/api/getInitData',obj).subscribe((res:any)=>{
        this.data = JSON.parse(res._body).mongodb;
        console.log(this.data);
    },(err)=>{
        console.log(err);
    });
  }

  RequestStmt() {
    let obj ={
      auditorId:this.selectedAuditor,
      borrowerId:this.borrower._id
    }
    this.request.post('http://localhost:8182/api/requestFinancialStatement',obj).subscribe((res:any)=>{
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
