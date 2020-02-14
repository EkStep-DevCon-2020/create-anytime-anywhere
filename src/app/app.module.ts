import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PdfGenerationComponent } from './components/pdf-generation/pdf-generation.component';
import {SuiModule} from 'ng2-semantic-ui';
import { ContentService } from './components/pdf-generation/services/content.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    PdfGenerationComponent,
  ],
  imports: [
    BrowserModule, RouterModule, SuiModule, HttpClientModule
  ],
  providers: [ContentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
