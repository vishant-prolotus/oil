import { Component, OnInit } from '@angular/core';
import { Router}  from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-view-loan',
  templateUrl: './view-loan.component.html',
  styleUrls: ['./view-loan.component.css']
})
export class ViewLoanComponent implements OnInit {
LoanData;
adminId;
  constructor(private router: Router,public request:RequestService,public http: Http,private route: ActivatedRoute) { }

  ngOnInit() {
    this.adminId = JSON.parse(localStorage.getItem('User'));//admin id 
    console.log(JSON.parse(this.route.snapshot.params['data']));
    this.LoanData = JSON.parse(this.route.snapshot.params['data']);
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
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

DownloadFile(id) {
  window.open('http://localhost:8182/downloadFile?cid='+id);
}

}
