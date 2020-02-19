import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PdfGenerationComponent } from './components/pdf-generation/pdf-generation.component';
import {SuiSelectModule} from 'ng2-semantic-ui';
import { ContentService } from './components/pdf-generation/services/content.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    PdfGenerationComponent,
  ],
  imports: [
    BrowserModule, FormsModule, RouterModule, SuiSelectModule, HttpClientModule, ReactiveFormsModule
  ],
  providers: [ContentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
