package main

/*
import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) initHedger(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	id := args[0]
	name := args[1]
	email := args[2]

	hedgerAccount := hedgeProvider{}
	hedgerAccount.Id = id
	hedgerAccount.Email = email
	hedgerAccount.Name = name

	hedgerAsBytes, _ := json.Marshal(hedgerAccount)
	_ = stub.PutState(id, hedgerAsBytes)

	return shim.Success(nil)
}

func (t *Oilchain) AddHedgeAggreement(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	hedgerId := args[0]
	requestId := args[1]
	documentId := args[2]
	docName := args[3]
	var borrowerId string
	var loanId string

	hedgeAgree := hedgeAgreement{}
	hedgeAgree.Doc.DocName = docName
	hedgeAgree.Doc.Id = documentId
	hedgerAcc := hedgeProvider{}
	hedgerAsBytes, _ := stub.GetState(hedgerId)
	err := json.Unmarshal(hedgerAsBytes, &hedgerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("couldnt unmarshal"))
	}

	for i := range hedgerAcc.Requests {
		if hedgerAcc.Requests[i].Id == requestId {
			hedgerAcc.Requests[i].Status = "completed"
			borrowerId = hedgerAcc.Requests[i].Loan.LoanCase.BorrowerId
			loanId = hedgerAcc.Requests[i].Loan.LoanId
		}
	}

	borrowerAcc := borrower{}
	borrowerAsBytes, _ := stub.GetState(borrowerId)
	err = json.Unmarshal(borrowerAsBytes, &borrowerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("couldnt unmarshal"))
	}

	for i := range borrowerAcc.HedgeRequests {
		if borrowerAcc.HedgeRequests[i].Id == requestId {
			borrowerAcc.HedgeRequests[i].Status = "completed"

		}
	}

	var adminId string
	for j := range borrowerAcc.Loans {
		if borrowerAcc.Loans[j].LoanId == loanId {
			borrowerAcc.Loans[j].HedgeAgreement = hedgeAgree
			adminId = borrowerAcc.Loans[j].LoanCase.AdministrativeAgentId
		}
	}
	adminAcc := administrativeAgent{}
	adminAsBytes, _ := stub.GetState(adminId)
	err = json.Unmarshal(adminAsBytes, &adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("couldnt unmarshal"))
	}
	for a := range adminAcc.Loans {
		if adminAcc.Loans[a].LoanId == loanId {
			adminAcc.Loans[a].HedgeAgreement = hedgeAgree
		}
	}
	hedgerAcc.HedgeAgreements = append(hedgerAcc.HedgeAgreements, hedgeAgree)

	newAdminAsbytes, _ := json.Marshal(adminAcc)
	_ = stub.PutState(adminId, newAdminAsbytes)

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes)

	newHedgerAsbytes, _ := json.Marshal(hedgerAcc)
	_ = stub.PutState(hedgerId, newHedgerAsbytes)

	return shim.Success(nil)

}*/
