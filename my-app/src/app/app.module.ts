import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { appRouterModule } from "./app.routes";
import { UPLOAD_DIRECTIVES } from 'ng2-file-uploader/ng2-file-uploader';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AuditorComponent } from './auditor/auditor.component';
import { BorrowerComponent } from './borrower/borrower.component';
import { AdministratorComponent } from './administrator/administrator.component';
import { LenderComponent } from './lender/lender.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { EngineerComponent } from './engineer/engineer.component';
import { ManageCaseComponent } from './manage-case/manage-case.component';
import { NewCaseComponent } from './new-case/new-case.component';
import { FinancialStatementComponent } from './financial-statement/financial-statement.component';
import { LoginRouteGuardService } from './login-route-guard.service';
import { RequestService } from './request.service';
import { DatePickerModule } from 'ng2-datepicker';

@NgModule({
  declarations: [
    AppComponent,
    AuditorComponent,
    BorrowerComponent,
    UPLOAD_DIRECTIVES,
    AdministratorComponent,
    LenderComponent,
    LoginComponent,
    SignupComponent,
    EngineerComponent,
    ManageCaseComponent,
    NewCaseComponent,
    FinancialStatementComponent,
  ],
  imports: [
    BrowserModule,
    appRouterModule,
    HttpModule,
    FormsModule,
    DatePickerModule
  ],
  providers: [LoginRouteGuardService,RequestService],
  bootstrap: [AppComponent]
})
export class AppModule { }