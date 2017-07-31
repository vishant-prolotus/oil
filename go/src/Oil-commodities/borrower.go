package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) InitBorrower(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 4 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	var borrowerId = args[0]
	var name = args[1]
	var registrationId = args[2]
	var email = args[3]
	var compCert []complianceCertificate
	var financialRep []financialReport
	var reserveRep []reserveReport
	//////////////////////////////////////////////////
	//  borrower account data parsing
	//////////////////////////////////////////////////
	borrowerAcc := borrower{}
	borrowerAcc.Id = borrowerId
	borrowerAcc.Name = name
	borrowerAcc.RegistratonID = registrationId
	borrowerAcc.Email = email
	borrowerAcc.ComplianceCertificates = compCert
	borrowerAcc.FinancialReports = financialRep
	borrowerAcc.ReserveReports = reserveRep
	borrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, borrowerAsbytes)

	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) RequestFinancialStatement(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	requestId := args[0]
	borrowerId := args[1]
	auditorId := args[2]
	currentT := time.Now().Local()
	date := currentT.Format("02-01-2006")

	var req request
	req.Id = requestId
	req.BorrowerId = borrowerId
	req.Date = date
	req.Status = "pending"
	req.RequestTo = auditorId
	req.Type = "financialStatement"

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)
	borrowerAcc.Requests = append(borrowerAcc.Requests, req)

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	auditorAcc := auditor{}
	auditorAsbytes, _ := stub.GetState(auditorId)
	_ = json.Unmarshal(auditorAsbytes, &auditorAcc)
	auditorAcc.Requests = append(auditorAcc.Requests, req)
	newAuditorAsbytes, _ := json.Marshal(auditorAcc)

	err = stub.PutState(auditorId, newAuditorAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) AddComplianceCertificate(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	borrowerId := args[0]
	complianceRepId := args[1]
	date := args[2]

	complianceCert := complianceCertificate{}
	//////////////////////////////////////////////////
	//  complianceCert data parsing
	//////////////////////////////////////////////////
	complianceCert.BorrowerId = borrowerId
	complianceCert.Id = complianceRepId
	complianceCert.Date = date

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)
	borrowerAcc.ComplianceCertificates = append(borrowerAcc.ComplianceCertificates, complianceCert)
	for i := range borrowerAcc.Cases {
		borrowerAcc.Cases[i].ComplianceCertificates = append(borrowerAcc.Cases[i].ComplianceCertificates, complianceCert)
	}

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}
	return shim.Success(nil)
}

func (t *Oilchain) CreateCase(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 6 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	borrowerId := args[0]
	CaseId := args[1]
	amountRequested := args[2]
	adminAgentId := args[3]
	//financialStatementNumber := strconv.Atoi(args[3])
	requestTo := args[4]
	numOfDocs, _ := strconv.Atoi(args[5])

	borrowerAcc := borrower{}
	requestId, borrowerAsbytes := RequestReserveReport(stub, requestTo, borrowerId, CaseId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)

	var docs []document
	loanPack := Case{}
	////////////////////////////////////////////////////
	//          loan package parsing
	////////////////////////////////////////////////////
	loanPack.Id = CaseId
	loanPack.AmountRequested, _ = strconv.ParseFloat(amountRequested, 64)
	loanPack.BorrowerId = borrowerId
	loanPack.EngineerId = requestTo
	loanPack.AdministrativeAgentId = adminAgentId
	loanPack.ComplianceCertificates = borrowerAcc.ComplianceCertificates
	// for i := 0; i < len(borrowerAcc.ComplianceCertificates); i++ {
	// 	if borrowerAcc.ComplianceCertificates[i].Id == complianceId {
	// 		loanPack.ComplianceCertificate = borrowerAcc.ComplianceCertificates[i]
	// 	}
	// }

	loanPack.BorrowerName = borrowerAcc.Name
	loanPack.Status = `pending`
	var i int
	for i = 6; i < 6+numOfDocs*2; i++ {
		doc := document{}
		doc.DocName = args[i]
		i = i + 1
		doc.Id = args[i]
		docs = append(docs, doc)
	}
	loanPack.Documents = docs
	loanPack.RequestReserveReport.RequestTo = requestTo
	for i := range borrowerAcc.Requests {
		if borrowerAcc.Requests[i].Id == requestId {
			loanPack.RequestReserveReport = borrowerAcc.Requests[i]
		}
	}
	for j := range borrowerAcc.FinancialReports {
		loanPack.FinancialReports = append(loanPack.FinancialReports, borrowerAcc.FinancialReports[j])
	}

	borrowerAcc.Cases = append(borrowerAcc.Cases, loanPack)
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) RequestHedging(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	borrowerId := args[0]
	requestId := args[1]
	hedgerId := args[2]
	loanId := args[3]

	hedgeReq := hedgeRequest{}
	hedgeReq.BorrowerId = borrowerId
	hedgeReq.Id = requestId
	hedgeReq.RequestTo = hedgerId

	borrowerAcc := borrower{}
	borrowerAsBytes, _ := stub.GetState(borrowerId)
	err := json.Unmarshal(borrowerAsBytes, &borrowerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("unmarshalling done wrong"))
	}
	for i := range borrowerAcc.Loans {
		if borrowerAcc.Loans[i].LoanId == loanId {
			hedgeReq.Loan = borrowerAcc.Loans[i]
		}
	}
	hedgeReq.Status = "pending"

	borrowerAcc.HedgeRequests = append(borrowerAcc.HedgeRequests, hedgeReq)

	hedgerAcc := hedgeProvider{}
	hedgerAsBytes, _ := stub.GetState(hedgerId)
	err = json.Unmarshal(hedgerAsBytes, &hedgerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("unmarshalling done wrong"))
	}

	hedgerAcc.Requests = append(hedgerAcc.Requests, hedgeReq)

	newHedgerAsbytes, _ := json.Marshal(hedgerAcc)
	_ = stub.PutState(hedgerId, newHedgerAsbytes)

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes)

	return shim.Success(nil)
}

func RequestReserveReport(stub shim.ChaincodeStubInterface, to string, borrowerId string, CaseId string) (string, []byte) {
	req := reserveRequest{}
	req.BorrowerId = borrowerId
	req.EngineerId = to
	req.Status = `pending`
	req.Type = `reserveReport`
	req.LoanId = CaseId
	currentT := time.Now().Local()
	date := currentT.Format("02-01-2006")
	req.Date = date
	h := sha256.New()
	h.Write([]byte(currentT.String()))
	req.Id = hex.EncodeToString(h.Sum(nil)) //h.Sum(nil)

	engineerAcc := engineer{}
	engineerAsbytes, _ := stub.GetState(to)
	_ = json.Unmarshal(engineerAsbytes, &engineerAcc)
	engineerAcc.Requests = append(engineerAcc.Requests, req)
	newEngineerAsbytes, _ := json.Marshal(engineerAcc)
	_ = stub.PutState(to, newEngineerAsbytes)

	borrowerAsbytes, _ := stub.GetState(borrowerId)

	return req.Id, borrowerAsbytes
}
