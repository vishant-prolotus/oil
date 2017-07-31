import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-manage-case',
  templateUrl: './manage-case.component.html',
  styleUrls: ['./manage-case.component.css']
})
export class ManageCaseComponent implements OnInit {

  constructor(public http: Http) { }

  ngOnInit() {
  }

  fileChange(event) {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
        let file: File = fileList[0];
        let formData:FormData = new FormData();
        formData.append('uploadFile', file, file.name);
        let headers = new Headers();
        headers.append('enctype', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        let options = new RequestOptions({ headers: headers });
        this.http.post('http://localhost:8182/register', formData, options)
            .map(res => res.json())
            .subscribe(
                data => console.log('success'),
                error => console.log(error)
            );
    }
  }

}
