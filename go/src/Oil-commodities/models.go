package main

type borrower struct {
	Id                     string                  `json:"id"`
	RegistratonID          string                  `json:"registrationId"`
	Name                   string                  `json:"name"`
	Email                  string                  `json:"email"`
	FinancialReports       []financialReport       `json:"financialReport"`
	ComplianceCertificates []complianceCertificate `json:"complianceCertifiacte"`
	Requests               []request               `json:"Requests"`
	HedgeRequests          []hedgeRequest          `json:"hedgeRequests"`
	ReserveReports         []reserveReport         `json:"reserveReports"`
	Cases                  []Case                  `json:"Cases"`
	Loans                  []loan                  `json:"loans"`
}

type financialReport struct {
	Id           string  `json:"id"`
	RequestId    string  `json:"requestId"`
	BorrowerId   string  `json:"borrowerId"`
	Date         string  `json:"date"`
	LoanAmount   float64 `json:"loanAmount"`
	CreditPeriod int     `json:"creditPeriod"`
	Status       string  `json:"status"`
}

type complianceCertificate struct {
	Id         string `json:"id"`
	Date       string `json:"date"`
	BorrowerId string `json:"borrowerId"`
}

type engineer struct {
	Id               string            `json:"id"`
	Name             string            `json:"name"`
	RegistratonID    string            `json:"registrationId"`
	Email            string            `json:"email"`
	Requests         []reserveRequest  `json:"requests"`
	ReserveReports   []reserveReport   `json:"reserveReports"`
	CreditAgreements []creditAgreement `json:"creditAgreements"`
}
type request struct {
	Id         string `json:"id"`
	BorrowerId string `json:"borrowerId"`
	RequestTo  string `json:"requestTo"`
	Type       string `json:"type"`
	Status     string `json:"status"`
	Date       string `json:"date"`
}

type reserveRequest struct {
	LoanId     string `json:"loanId"`
	Id         string `json:"id"`
	BorrowerId string `json:"borrowerId"`
	EngineerId string `json:"engineerId"`
	Type       string `json:"type"`
	Status     string `json:"status"`
	Date       string `json:"date"`
}

type reserveReport struct {
	RequestId        string  `json:"requestId"`
	Id               string  `json:"id"`
	Date             string  `json:"date"`
	EngineerId       string  `json:"engineerId"`
	BorrowerId       string  `json:"borrowerId"`
	DevelopedCrude   float64 `json:"developedCrude"`
	UndevelopedCrude float64 `json:"undevelopedCrude"`
}
type document struct {
	Id      string `json:"id"`
	DocName string `json:"docName"`
}
type Case struct {
	Id                     string                  `json:"id"`
	BorrowerId             string                  `json:"borrowerId"`
	EngineerId             string                  `json:"engineerId"`
	AdministrativeAgentId  string                  `json:"administrativeAgentId"`
	FinancialReports       []financialReport       `json:"financialReports"`
	ComplianceCertificates []complianceCertificate `json:"complianceCertificates"`
	RequestReserveReport   request                 `json:"requestReserveReport"`
	ReserveReports         []reserveReport         `json:"reserveReports"`
	Documents              []document              `json:"documents"`
	AmountRequested        float64                 `json:"amountRequested"`
	BorrowerName           string                  `json:"borrowerName"`
	Status                 string                  `json:"status"`
	Proposals              []proposal              `json:"proposals"`
}

type proposal struct {
	CaseId   string  `json:"CaseId"`
	LenderId string  `json:"lenderId"`
	Amount   float64 `json;"amount"`
	Status   string  `json:"status"`
}

type auditor struct {
	Id               string            `json:"id"`
	Name             string            `json:"name"`
	Email            string            `json:"email"`
	Requests         []request         `json:"requests"`
	FinancialReports []financialReport `json:"financialReport"`
}

type administrativeAgent struct {
	Id    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Cases []Case `json:"Cases"`
	Loans []loan `json:"loans"`
}

type loan struct {
	LoanId          string          `json:"loanId"`
	LoanCase        Case            `json:"loanCase"`
	LoanAmount      float64         `json:"loanAmount"`
	ApprovalDate    string          `json:"approvalDate"`
	Term            float64         `json:"term"`
	Lenders         []string        `json:"lenders"`
	CreditAgreement creditAgreement `json:"creditAgreement"`
	HedgeAgreement  hedgeAgreement  `json:"hedgeAgreement"`
	Status          string          `json:"status"`
}
type creditAgreement struct {
	LoanId          string  `json:"loanId"`
	AdminId         string  `json:"adminId"`
	CreditId        string  `json:"creditId"`
	Interval        float64 `json:"interval"`
	RequiredReserve float64 `json:"requiredReserve"`
}

type lender struct {
	Id        string     `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Cases     []Case     `json:"Cases"`
	Proposals []proposal `json:"proposals"`
	Loans     []loan     `json:"loans"`
}

type hedgeAgreement struct {
	Doc document `json:"doc"`
}

type hedgeRequest struct {
	Id         string `json:"id"`
	BorrowerId string `json:"borrowerId"`
	RequestTo  string `json:"requestTo"`
	Loan       loan   `json:"loan"`
	Status     string `json:"status"`
	Date       string `json:"date"`
}

type hedgeProvider struct {
	Id              string           `json:"id"`
	Name            string           `json:"name"`
	Email           string           `json:"email"`
	Requests        []hedgeRequest   `json:"requests"`
	HedgeAgreements []hedgeAgreement `json:"hedgeAgreements"`
}
