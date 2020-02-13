import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PdfGenerationComponent } from './components/pdf-generation/pdf-generation.component';

@NgModule({
  declarations: [
    AppComponent,
    PdfGenerationComponent
  ],
  imports: [
    BrowserModule, RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
