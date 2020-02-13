import { Component, OnInit } from '@angular/core';
import Mercury from '@postlight/mercury-parser';

@Component({
  selector: 'app-pdf-generation',
  templateUrl: './pdf-generation.component.html',
  styleUrls: ['./pdf-generation.component.css']
})
export class PdfGenerationComponent implements OnInit {

  public url = 'https://trackchanges.postlight.com/building-awesome-cms-f034344d8ed';
  constructor() { }
  public parsedContent: any;

  ngOnInit() {

      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if ( request.message === 'all_urls_fetched' ) {

          }
        }
      );
  }

  public read() {

    console.log('saddadd');
    Mercury.parse(this.url)
      .then((result: any) => {
        console.log(result);
        this.parsedContent = result.content;
      });
  }

}
