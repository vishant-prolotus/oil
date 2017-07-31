package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) InitAuditor(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	auditorId := args[0]
	auditorName := args[1]
	auditorEmail := args[2]
	auditorAcc := auditor{}
	//////////////////////////////////////////
	//      auditor parsing
	//////////////////////////////////////////
	auditorAcc.Id = auditorId
	auditorAcc.Name = auditorName
	auditorAcc.Email = auditorEmail
	auditorAsbytes, _ := json.Marshal(auditorAcc)
	err := stub.PutState(auditorId, auditorAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) AddFinancialStatement(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 6 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	requestId := args[0]
	auditorId := args[1]
	reportId := args[2]
	creditDays := args[3]
	date := args[4]
	loanAmount := args[5]
	var borrowerId string

	auditorAcc := auditor{}
	auditorAsbytes, _ := stub.GetState(auditorId)
	_ = json.Unmarshal(auditorAsbytes, &auditorAcc)
	for i := range auditorAcc.Requests {
		if requestId == auditorAcc.Requests[i].Id {
			borrowerId = auditorAcc.Requests[i].BorrowerId
			auditorAcc.Requests[i].Status = `audit generated`
		}
	}

	var financialrep = financialReport{}
	//////////////////////////////////////////////////
	//  financialrep data parsing
	//////////////////////////////////////////////////
	financialrep.Id = reportId
	financialrep.RequestId = requestId
	financialrep.CreditPeriod, _ = strconv.Atoi(creditDays)
	financialrep.Date = date
	financialrep.LoanAmount, _ = strconv.ParseFloat(loanAmount, 64)
	financialrep.Status = `pending`
	financialrep.BorrowerId = borrowerId

	borrowerAcc := borrower{}
	borrowerAsytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsytes, &borrowerAcc)
	borrowerAcc.FinancialReports = append(borrowerAcc.FinancialReports, financialrep)
	for i := range borrowerAcc.Requests {
		if requestId == borrowerAcc.Requests[i].Id {
			borrowerAcc.Requests[i].Status = `audit generated`
		}
	}

	for z := range borrowerAcc.Cases {
		borrowerAcc.Cases[z].FinancialReports = append(borrowerAcc.Cases[z].FinancialReports, financialrep)
	}

	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err := stub.PutState(borrowerId, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	auditorAcc.FinancialReports = append(auditorAcc.FinancialReports, financialrep)
	newAuditorAsbytes, _ := json.Marshal(auditorAcc)
	err = stub.PutState(auditorId, newAuditorAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}
