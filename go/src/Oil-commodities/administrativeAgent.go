package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) InitAdministrativeAgent(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	adminId := args[0]
	name := args[1]
	email := args[2]

	adminAcc := administrativeAgent{}
	/////////////////////////////////////////////
	//        administrator parsing
	/////////////////////////////////////////////
	adminAcc.Id = adminId
	adminAcc.Name = name
	adminAcc.Email = email

	adminAsbytes, _ := json.Marshal(adminAcc)
	err := stub.PutState(adminId, adminAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}
	return shim.Success(nil)
}

func (t *Oilchain) UpdateLoanPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	administrativeAgentId := args[0]
	CaseId := args[1]
	status := args[2]

	adminAgentAcc := administrativeAgent{}
	adminAgentAsbytes, _ := stub.GetState(administrativeAgentId)
	_ = json.Unmarshal(adminAgentAsbytes, &adminAgentAcc)
	loanPack := Case{}
	var borrowerId string
	for i := range adminAgentAcc.Cases {
		if adminAgentAcc.Cases[i].Id == CaseId {
			adminAgentAcc.Cases[i].Status = status
			loanPack = adminAgentAcc.Cases[i]
			borrowerId = adminAgentAcc.Cases[i].BorrowerId
		}
	}

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)

	for i := range borrowerAcc.Cases {
		if borrowerAcc.Cases[i].Id == CaseId {
			borrowerAcc.Cases[i].Status = status
		}
	}

	newBorrowerAbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, newBorrowerAbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	newAdminagentAsbytes, _ := json.Marshal(adminAgentAcc)

	err = stub.PutState(administrativeAgentId, newAdminagentAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}
	var loanStack []Case
	loansAsbytes, _ := stub.GetState(casestack)
	_ = json.Unmarshal(loansAsbytes, &loanStack)
	if loanPack.Status == `verified` {
		loanStack = append(loanStack, loanPack)
	}
	newLoansAsbytes, _ := json.Marshal(loanStack)
	_ = stub.PutState(casestack, newLoansAsbytes)

	return shim.Success(nil)
}

func (t *Oilchain) MakeLoanPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 6 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	adminId := args[0]
	caseId := args[1]
	loanId := args[2]
	approvalDate := args[3]
	term := args[4]
	loanAmount := args[5]
	numOfLenders, _ := strconv.Atoi(args[6])
	var lenders []string
	var borrowerId string
	loanPack := loan{}
	loanPack.LoanId = loanId
	loanPack.ApprovalDate = approvalDate
	loanPack.Term, _ = strconv.ParseFloat(term, 64)
	loanPack.LoanAmount, _ = strconv.ParseFloat(loanAmount, 64)
	loanPack.Status = `valid`

	for i := 7; i < 7+numOfLenders; i++ {
		lenders = append(lenders, args[i])
	}
	loanPack.Lenders = lenders
	adminAcc := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	_ = json.Unmarshal(adminAsbytes, &adminAcc)
	for i := range adminAcc.Cases {
		if adminAcc.Cases[i].Id == caseId {
			loanPack.LoanCase = adminAcc.Cases[i]
			adminAcc.Cases[i].Status = `loanPackage made`
			borrowerId = adminAcc.Cases[i].BorrowerId
		}
	}
	adminAcc.Loans = append(adminAcc.Loans, loanPack)
	newAdminAsbytes, _ := json.Marshal(adminAcc)
	_ = stub.PutState(adminId, newAdminAsbytes)

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)

	borrowerAcc.Loans = append(borrowerAcc.Loans, loanPack)
	for i := range borrowerAcc.Cases {
		if borrowerAcc.Cases[i].Id == caseId {
			borrowerAcc.Cases[i].Status = `loanPackage made`
		}
	}
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes) //
	//
	for i := 7; i < 7+numOfLenders; i++ {
		lenderAcc := lender{}
		lenderId := args[i]
		lenderAsbytes, _ := stub.GetState(lenderId)
		_ = json.Unmarshal(lenderAsbytes, &lenderAcc)
		lenderAcc.Loans = append(lenderAcc.Loans, loanPack)
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		e := stub.PutState(lenderId, newLenderAsbytes)
		if e != nil {
			return shim.Error(fmt.Sprintf("didnt write state"))
		}
	}

	return shim.Success(nil)
}

func (t *Oilchain) MakeCreditAgreement(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	adminId := args[0]
	creditId := args[1]
	loanId := args[2]
	interval := args[3]
	reserveRequired := args[4]
	var borrowerId string
	var engineerId string
	var lenders []string
	adminAcc := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	_ = json.Unmarshal(adminAsbytes, &adminAcc)

	credit := creditAgreement{}
	credit.CreditId = creditId
	credit.Interval, _ = strconv.ParseFloat(interval, 64)
	credit.RequiredReserve, _ = strconv.ParseFloat(reserveRequired, 64)
	credit.LoanId = loanId
	credit.AdminId = adminId
	for i := range adminAcc.Loans {

		if adminAcc.Loans[i].LoanId == loanId {
			adminAcc.Loans[i].CreditAgreement = credit
			borrowerId = adminAcc.Loans[i].LoanCase.BorrowerId
			engineerId = adminAcc.Loans[i].LoanCase.EngineerId
			lenders = adminAcc.Loans[i].Lenders
		}
	}
	newAdminAsbytes, _ := json.Marshal(adminAcc)
	err := stub.PutState(adminId, newAdminAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)

	for i := range borrowerAcc.Loans {
		if borrowerAcc.Loans[i].LoanId == loanId {
			borrowerAcc.Loans[i].CreditAgreement = credit
		}
	}

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err = stub.PutState(borrowerId, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}
	for j := range lenders {
		lenderAcc := lender{}
		lenderAsbytes, _ := stub.GetState(lenders[j])
		_ = json.Unmarshal(lenderAsbytes, &lenderAcc)
		for i := range lenderAcc.Loans {
			if lenderAcc.Loans[i].LoanId == loanId {
				lenderAcc.Loans[i].CreditAgreement = credit
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		_ = stub.PutState(lenders[j], newLenderAsbytes)

	}
	engineerAcc := engineer{}
	engineerAsbytes, _ := stub.GetState(engineerId)
	_ = json.Unmarshal(engineerAsbytes, &engineerAcc)
	engineerAcc.CreditAgreements = append(engineerAcc.CreditAgreements, credit)
	newEngineerAsbytes, _ := json.Marshal(engineerAcc)
	_ = stub.PutState(engineerId, newEngineerAsbytes)

	return shim.Success(nil)
}
