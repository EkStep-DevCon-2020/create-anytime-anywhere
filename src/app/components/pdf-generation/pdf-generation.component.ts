import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Mercury from '@postlight/mercury-parser';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pdf-generation',
  templateUrl: './pdf-generation.component.html',
  styleUrls: ['./pdf-generation.component.css']
})
export class PdfGenerationComponent implements OnInit {

  private readonly createContentUrl = 'https://devcon.sunbirded.org/api/private/content/v3/create';
  private readonly presignedUrl = 'https://devcon.sunbirded.org/api/private/content/v3/upload/url'
  private readonly uploadUrl = 'https://devcon.sunbirded.org/api/private/content/v3/upload'
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE',
      'user-id': 'mahesh',
      'X-Channel-Id': 'in.ekstep'
    })
  };
  

  public url: any;
  public parsedContent: any;
  public isLoading: Boolean = false;
  public successMsgs;
  constructor(
    private ref: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  public read() {
    this.isLoading = true;
    this.getCurrentActiveTabUrl();
  }

  public getCurrentActiveTabUrl() {
    let url;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs: any)  => {
      url = tabs[0].url;
      this.getReadableContent(url);
    });
  }

  public getReadableContent(url) {
    if (url) {
      Mercury.parse(url)
      .then((result: any) => {
        console.log('result', result);
        this.setContent(result);
      });
    } else {
      this.parsedContent = 'Please try some other page';
    }
  }

  public setContent(result) {
    this.parsedContent = result;
    this.isLoading = false;
    this.ref.detectChanges();
    this.createContent(result);
  }

  
  private createContent(content){
    
    const data = {
      request: {
        content: {
          name: content.title,
          contentType: 'Resource',
          mediaType: 'content',
          code: 'kp.test.res.1',
          mimeType: 'application/pdf'
        }
      }
    }
    this.http.post(this.createContentUrl, data, this.httpOptions)
    .subscribe(
      resp => {
        console.log('success createContent', resp),
        // this.getPresignedUrl(resp);
        this.createYouTubeContent(resp);
      },
      error => console.log('oops', error)
    );
  }

  createYouTubeContent(res){
    const formData = new FormData();
    formData.append('fileUrl', this.parsedContent.url);
    formData.append('mimeType', 'video/x-youtube');

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE',
        'user-id': 'mahesh',
        'X-Channel-Id': 'in.ekstep',
        'enctype': 'multipart/form-data',
        'processData': 'false',
        'contentType': 'false',
        'cache': 'false'
      })
    };
   
    const contentId = res['result'].node_id;
    const url = this.uploadUrl + '/'+ contentId;
    this.http.post(url, formData, httpOptions)
    .subscribe(
      data => {
        console.log('createYouTubeContent success', data),
        this.successMsgs = {
          title : 'content created successfully',
          subTitle: 'Click here to view content',
          url: `https://devcon.sunbirded.org/play/content/${data['result'].node_id}?contentType=Resource`
        }
        console.log('successMsgs', this.successMsgs);
        this.ref.detectChanges();
      },
      error => console.log('oops createYouTubeContent', error)
    );
  }

  getPresignedUrl(res){
    // 
    const contentId = res['result'].node_id;
    const data = {
      request: {
        content: {
          fileName: this.parsedContent.title
        }
      }
    };
    const url = this.presignedUrl + '/'+ contentId;
    
    this.http.post(url, data, this.httpOptions)
    .subscribe(
      data => {
        console.log('getPresignedUrl success', data);
        // this.hitPresignedUrl(data);
        this.uploadFile(data)
      },
      error => console.log('oops getPresignedUrl', error)
    );
  }

  hitPresignedUrl(resp){
    // const url = this.presignedUrl + '/'+resp.contentId
    // this.http.put(url, data, this.httpOptions)
    // .subscribe(
    //   data => {
    //     console.log('success', data),
    //     this.sendContentForm(data);
    //   },
    //   error => console.log('oops', error)
    // );
  }

  uploadFile(res){
    
    const url = res['result'].pre_signed_url;
    const blob = this.str2blob(this.parsedContent.content)
    const file = new File([blob], this.parsedContent.title)
    const formData = new FormData();
    formData.append('file', file)

    console.log('file', file);

    const config = {
      processData: false,
      contentType: 'Asset',
      headers: {
        'x-ms-blob-type': 'BlockBlob'
      }
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'enctype': 'multipart/form-data',
        'x-ms-blob-type': 'BlockBlob',
        'processData': 'false'
      })
    };

    this.http.put(url, formData, httpOptions)
    .subscribe(
      data => {
        console.log('uploadFile success', data);
      },
      error => console.log('oops uploadFile', error)
    );
  }

  str2blob(str) {
    return new Blob([str], {type: 'text/html'})
  }

  openContent(e){
    //TODO
    console.log('in openContent');
    e.preventDefault();
  }

}
