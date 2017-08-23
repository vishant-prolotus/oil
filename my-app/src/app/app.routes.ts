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
import { HedgeAgrementComponent } from './hedge-agrement/hedge-agrement.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';


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
  },
  {
    path: 'admin',
    component: AdministratorComponent,
  },
  {
    path: 'borrower',
    component: BorrowerComponent
  },
  {
    path: 'auditor',
    component: AuditorComponent,
  },
  {
    path: 'new-case',
    component: NewCaseComponent,
  },
  {
    path: 'financial-statement',
    component: FinancialStatementComponent,
  },
  {
    path: 'engineer',
    component: EngineerComponent,
  },
  {
    path: 'manage-case',
    component: ManageCaseComponent,
  },
  {
    path: 'lender',
    component: LenderComponent,
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