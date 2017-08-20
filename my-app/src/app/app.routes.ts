import { Routes, RouterModule }  from '@angular/router';
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
import { HedgeAgrementComponent } from './hedge-agrement/hedge-agrement.component'
import { ViewLoanComponent } from './view-loan/view-loan.component'


const routes: Routes = [
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'loanView',
    component: ViewLoanComponent
  },
  {
    path: 'hedgeAgreement',
    component: HedgeAgrementComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'admin',
    component: AdministratorComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'borrower',
    component: BorrowerComponent
  },
  {
    path: 'auditor',
    component: AuditorComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'new-case',
    component: NewCaseComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'financial-statement',
    component: FinancialStatementComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'engineer',
    component: EngineerComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'manage-case',
    component: ManageCaseComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'lender',
    component: LenderComponent,
    // canActivate: [LoginRouteGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: SignupComponent
  }
];

export const appRouterModule = RouterModule.forRoot(routes);