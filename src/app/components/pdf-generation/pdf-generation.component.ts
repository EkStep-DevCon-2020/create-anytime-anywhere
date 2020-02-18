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
      // tslint:disable-next-line:max-line-length
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE',
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
      // this.isYouTubeURL(url) ? this.createYouTubeContent(url) : this.getReadableContent(url);
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
    this.isYouTubeURL(result.url) ? this.createYouTubeContent(result) : this.createPDFContent(result);
  }


  public isYouTubeURL(url) {
    if (url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? true : false;
    }
}

  createYouTubeContent(result) {
    const createdContent = this.createContent(result.title, 'video/x-youtube');
    createdContent.subscribe(response => {
      console.log('success createContent', response);
      // this.getPresignedUrl(resp);
      // this.createYouTubeContent(resp);
        const contentId = response['result'].node_id;
        const formData = new FormData();
        formData.append('fileUrl', result.url);
        formData.append('mimeType', 'video/x-youtube');

        const httpOptions = {
          headers: new HttpHeaders({
            // tslint:disable-next-line:max-line-length
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE',
            'user-id': 'mahesh',
            'X-Channel-Id': 'in.ekstep',
            'enctype': 'multipart/form-data',
            'processData': 'false',
            'contentType': 'false',
            'cache': 'false'
          })
        };

        const url = this.uploadUrl + '/' + contentId;
        this.http.post(url, formData, httpOptions)
        .subscribe(
          data => {
            console.log('createYouTubeContent success', data),
            this.successMsgs = {
              title : 'content created successfully',
              subTitle: 'Click here to view content',
              url: `https://devcon.sunbirded.org/play/content/${data['result'].node_id}?contentType=Resource`
            };
            console.log('successMsgs', this.successMsgs);
            this.ref.detectChanges();
          },
          error => console.log('oops createYouTubeContent', error)
        );
    },
    error => {
      console.log('oops', error);
      return error;
    });


  }

  private createPDFContent(result) {
    const createdContent = this.createContent(result.title, 'text/html');

    createdContent.subscribe(response => {
      console.log('success createContent', response);
      this.getPresignedUrl(response);
      // this.createYouTubeContent(resp);
    },
    error => {
      console.log('oops', error);
      return error;
    });
  }

  private createContent(title, mimeType) {
    const data = {
      request: {
        content: {
          name: title,
          contentType: 'Resource',
          mediaType: 'content',
          code: 'kp.test.res.1',
          mimeType: 'application/pdf'
        }
      }
    };
    return this.http.post(this.createContentUrl, data, this.httpOptions);
  }


  getPresignedUrl(res) {
    //
    const contentId = res['result'].node_id;
    const data = {
      request: {
        content: {
          fileName: this.parsedContent.title+'.html'
        }
      }
    };
    const url = `${this.presignedUrl}/${contentId}`;

    this.http.post(url, data, this.httpOptions)
    .subscribe(
      (response: any) => {
        console.log('getPresignedUrl success', response);
        this.uploadFile(response);
      },
      error => console.log('oops getPresignedUrl', error)
    );
  }

  uploadFile(res) {
    const url = res['result'].pre_signed_url;
    const blob = new Blob([this.parsedContent.content], {type: 'text/html'});
    const file = new File([blob], `${this.parsedContent.title}.html`, {type: 'text/html'});

    const httpOptions = {
      headers: new HttpHeaders({
        'enctype': 'multipart/form-data',
        'x-ms-blob-type': 'BlockBlob',
        'processData': 'false'
      })
    };
    console.log('file', file);
    this.http.put(url, file, httpOptions)
    .subscribe(
      data => {
        console.log('uploadFile success', data);
        const fileUrl = `${res['result'].pre_signed_url.split('?')[0]}`;
        this.getConvertedPdfUrl(fileUrl, res['result'].content_id);
        // this.updateContentWithPDFURL(fileUrl, res['result'].content_id);
      },
      error => console.log('oops uploadFile', error)
    );
  }

  getConvertedPdfUrl(fileUrl, contentId){
    console.log('fileUrl', fileUrl);
    const url = "http://11.2.6.6/print/v1/print/preview/generate";
    // let params = new URLSearchParams();
    // params.set('fileUrl', fileUrl);
    const httpOptions = {
      headers: new HttpHeaders({
        'contentType': 'application/json',
      },
      )
    };
    const data = new FormData();
    data.append('fileUrl', fileUrl);
    
    // this.http.post(url, '', params, httpOptions)
    this.http.post(url, data, httpOptions)
    .subscribe(
      (response: any) => {
        console.log('getConvertedPdfUrl success', response);
        this.updateContentWithPDFURL(response['result'].pdfUrl, contentId);
      },
      error => console.log('oops getConvertedPdfUrl', error)
    );
  }

  updateContentWithPDFURL(fileURL, contentId) {
    // const fileURLTest = "https://sunbirddev.blob.core.windows.net/sunbird-content-dev/print-service/26b4cf10-5162-11ea-9254-abb1d8cfed4e.pdf";
    console.log('getConvertedPdfUrl', fileURL);
    const data = new FormData();
    data.append('fileUrl', fileURL);
    data.append('mimeType', 'application/pdf');
    const httpOptions = {
      headers: new HttpHeaders({
        // tslint:disable-next-line:max-line-length
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE',
        'user-id': 'mahesh',
        'X-Channel-Id': 'in.ekstep',
        'enctype': 'multipart/form-data',
        'processData': 'false',
        'contentType': 'false',
        'cache': 'false'
      })
    };
    const url = this.uploadUrl + '/' + contentId;
    
    this.http.post(url, data, httpOptions)
    .subscribe(
      (response: any) => {
        console.log('updateContentWithURL success', response);
        this.successMsgs = {
          title : 'content created successfully',
          subTitle: 'Click here to view content',
          url: `https://devcon.sunbirded.org/play/content/${response['result'].node_id}?contentType=Resource`
        };
        console.log('successMsgs', this.successMsgs);

      },
      error => console.log('oops updateContentWithURL', error)
    );
  }

  openContent(url) {
    chrome.tabs.create({ url: url });
  }

  // createCustomPDF(){
  //   var base64Img = null;
  //   var margins = {
  //     top: 70,
  //     bottom: 40,
  //     left: 30,
  //     width: 550
  //   };
  //   var pdf = new jsPDF('p', 'pt', 'a4');
  //   pdf.setFontSize(18);
  //   pdf.fromHTML(document.getElementById('html-2-pdfwrapper'), 
  //     margins.left, // x coord
  //     margins.top,
  //     {
  //       // y coord
  //       width: margins.width// max width of content on PDF
  //     },function(dispose) {
  //       // headerFooterFormatting(pdf)
  //     }, 
  //     margins);
      
  //   var iframe = document.createElement('iframe');
  //   iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:650px; padding:20px;');
  //   document.body.appendChild(iframe);
    
  //   iframe.src = pdf.output('datauristring');
  //   return pdf.output('blob');
  // }

}
