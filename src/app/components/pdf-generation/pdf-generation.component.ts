import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Mercury from '@postlight/mercury-parser';

@Component({
  selector: 'app-pdf-generation',
  templateUrl: './pdf-generation.component.html',
  styleUrls: ['./pdf-generation.component.css']
})
export class PdfGenerationComponent implements OnInit {

  public url: any;
  public parsedContent: any;
  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  public read() {
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
        this.setContent(result.content);
      });
    } else {
      this.parsedContent = 'Please try some other page';
    }
  }

  public setContent(content) {
    this.parsedContent = content;
    this.ref.detectChanges();
  }

}
