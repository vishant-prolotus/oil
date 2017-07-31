package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) InitEngineer(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	engineerId := args[0]
	engineerName := args[1]
	engineerEmail := args[2]
	registrationId := args[3]

	engineerAcc := engineer{}
	////////////////////////////////////////////////
	//       engineer account parsing
	////////////////////////////////////////////////
	engineerAcc.Id = engineerId
	engineerAcc.Name = engineerName
	engineerAcc.Email = engineerEmail
	engineerAcc.RegistratonID = registrationId

	engineerAsbytes, _ := json.Marshal(engineerAcc)
	err := stub.PutState(engineerId, engineerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) MakeReserveReport(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 6 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	engineerId := args[0]
	reqId := args[1]
	reportId := args[2]
	date := args[3]
	developedCrude := args[4]
	undevelopedCrude := args[5]

	engineerAcc := engineer{}
	engineerAsbytes, _ := stub.GetState(engineerId)
	_ = json.Unmarshal(engineerAsbytes, &engineerAcc)
	var borrowerid string
	var CaseId string
	for i := range engineerAcc.Requests {
		if engineerAcc.Requests[i].Id == reqId {
			borrowerid = engineerAcc.Requests[i].BorrowerId
			engineerAcc.Requests[i].Status = `done`
			CaseId = engineerAcc.Requests[i].LoanId
		}
	}

	reserveRep := reserveReport{}
	////////////////////////////////////////////////
	//       reserve report  parsing
	////////////////////////////////////////////////
	reserveRep.Id = reportId
	reserveRep.RequestId = reqId
	reserveRep.BorrowerId = borrowerid
	reserveRep.EngineerId = engineerId
	reserveRep.Date = date
	reserveRep.DevelopedCrude, _ = strconv.ParseFloat(developedCrude, 64)
	reserveRep.UndevelopedCrude, _ = strconv.ParseFloat(undevelopedCrude, 64)

	engineerAcc.ReserveReports = append(engineerAcc.ReserveReports, reserveRep)

	newEngineerAsbytes, _ := json.Marshal(engineerAcc)
	err := stub.PutState(engineerId, newEngineerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerid)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)
	for i := range borrowerAcc.Cases {
		if borrowerAcc.Cases[i].Id == CaseId {
			borrowerAcc.Cases[i].ReserveReports = append(borrowerAcc.Cases[i].ReserveReports, reserveRep)
			borrowerAcc.Cases[i].Status = `delivered`
			borrowerAcc.Cases[i].RequestReserveReport.Status = `done`
			erro := sendLoanPackage(stub, borrowerAcc.Cases[i].AdministrativeAgentId, borrowerAcc.Cases[i])
			if erro != nil {
				return shim.Error(fmt.Sprintf("couldnt send loan package to admminAgent"))
			}
		}
	}
	borrowerAcc.ReserveReports = append(borrowerAcc.ReserveReports, reserveRep)
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	err = stub.PutState(borrowerid, newBorrowerAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) UpdateReserveRep(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 6 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	engineerId := args[0]
	creditId := args[1]
	reportId := args[2]
	date := args[3]
	developedCrude := args[4]
	undevelopedCrude := args[5]
	var borrowerId string
	var adminId string
	var loanId string
	var lenders []string
	credit := creditAgreement{}
	reserveRep := reserveReport{}
	reserveRep.DevelopedCrude, _ = strconv.ParseFloat(developedCrude, 64)
	reserveRep.UndevelopedCrude, _ = strconv.ParseFloat(undevelopedCrude, 64)
	reserveRep.Date = date
	reserveRep.Id = reportId

	engineerAcc := engineer{}
	engineerAsbytes, _ := stub.GetState(engineerId)
	_ = json.Unmarshal(engineerAsbytes, &engineerAcc)

	for i := range engineerAcc.CreditAgreements {
		if engineerAcc.CreditAgreements[i].CreditId == creditId {

			adminId = engineerAcc.CreditAgreements[i].AdminId
			loanId = engineerAcc.CreditAgreements[i].LoanId
			credit = engineerAcc.CreditAgreements[i]
		}
	}
	nullError := checkNullandVoid(credit, reserveRep)

	adminAcc := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	_ = json.Unmarshal(adminAsbytes, &adminAcc)
	for i := range adminAcc.Loans {
		if adminAcc.Loans[i].LoanId == loanId {
			reserveRep.BorrowerId = adminAcc.Loans[i].LoanCase.BorrowerId
			borrowerId = adminAcc.Loans[i].LoanCase.BorrowerId
			reserveRep.RequestId = adminAcc.Loans[i].LoanCase.ReserveReports[0].RequestId
			adminAcc.Loans[i].LoanCase.ReserveReports = append(adminAcc.Loans[i].LoanCase.ReserveReports, reserveRep)
			lenders = adminAcc.Loans[i].Lenders
			if nullError != nil {
				adminAcc.Loans[i].Status = `not valid`
			}
		}
	}
	newAdminAsbytes, _ := json.Marshal(adminAcc)
	_ = stub.PutState(adminId, newAdminAsbytes)

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	_ = json.Unmarshal(borrowerAsbytes, &borrowerAcc)

	for i := range borrowerAcc.Loans {
		if borrowerAcc.Loans[i].LoanId == loanId {
			borrowerAcc.Loans[i].LoanCase.ReserveReports = append(borrowerAcc.Loans[i].LoanCase.ReserveReports, reserveRep)
			if nullError != nil {
				borrowerAcc.Loans[i].Status = `not valid`
			}
		}
	}
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes)

	for i := range engineerAcc.CreditAgreements {
		if engineerAcc.CreditAgreements[i].CreditId == creditId {

			engineerAcc.ReserveReports = append(engineerAcc.ReserveReports, reserveRep)
		}
	}
	newEngineerAsbytes, _ := json.Marshal(engineerAcc)
	_ = stub.PutState(engineerId, newEngineerAsbytes)

	for i := range lenders {
		lenderAcc := lender{}
		lenderAsbytes, _ := stub.GetState(lenders[i])
		_ = json.Unmarshal(lenderAsbytes, &lenderAcc)
		for j := range lenderAcc.Loans {
			if lenderAcc.Loans[j].LoanId == loanId {
				lenderAcc.Loans[j].LoanCase.ReserveReports = append(lenderAcc.Loans[j].LoanCase.ReserveReports, reserveRep)
				if nullError != nil {
					lenderAcc.Loans[j].Status = `not valid`
				}
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		_ = stub.PutState(lenders[i], newLenderAsbytes)
	}

	return shim.Success(nil)
}

func checkNullandVoid(credit creditAgreement, reserveRep reserveReport) error {

	if credit.RequiredReserve > reserveRep.DevelopedCrude {
		return errors.New(`crude amount depleted`)
	} else {
		return nil
	}

}

func sendLoanPackage(stub shim.ChaincodeStubInterface, adminId string, c Case) error {

	adminAcc := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	_ = json.Unmarshal(adminAsbytes, &adminAcc)
	adminAcc.Cases = append(adminAcc.Cases, c)
	newAdminAsbytes, _ := json.Marshal(adminAcc)
	err := stub.PutState(adminId, newAdminAsbytes)
	if err != nil {
		return err
	}
	return nil

}
