import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';
import {MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import { InfoDialogComponent } from './components/dialogs/info-dialog/info-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {MatSelectModule} from '@angular/material/select';
import { ResetpwdDialogComponent } from './components/dialogs/resetpwd-dialog/resetpwd-dialog.component';
import { RegisterDialogComponent } from './components/dialogs/register-dialog/register-dialog.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { NavbarComponent } from './components/navbar/navbar.component';
import {MatIconModule} from '@angular/material/icon';
import { ExportComponent } from './components/export/export.component';
import { AccountComponent } from './components/account/account.component';
import { MapComponent } from './components/map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "https://www.agrotic.org/apexv3-sync/traduction/assets/i18n/", ".json");
}

const appRoutes: Routes = [
  { path: '', component: AppComponent },
]; 

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    InfoDialogComponent,
    ResetpwdDialogComponent,
    RegisterDialogComponent,
    NavbarComponent,
    ExportComponent,
    AccountComponent,
    MapComponent,
    ParcelleDetailComponent
  ],
  imports: [
    MatButtonModule,
    MatStepperModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatGridListModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    MatIconModule,
    LeafletModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000, verticalPosition : 'top'}},
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
