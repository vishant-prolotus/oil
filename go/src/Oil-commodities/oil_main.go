package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type Oilchain struct {
}

var loanStackKey = `loanStackKey`
var borrowersKey = `borrowersKey`
var casestack = `caseStack`

func main() {

	err := shim.Start(new(Oilchain))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

func (t *Oilchain) Init(stub shim.ChaincodeStubInterface) pb.Response {
	_, args := stub.GetFunctionAndParameters()
	if len(args) != 0 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	var cases []Case
	casesAsbytes, _ := json.Marshal(cases)
	err := stub.PutState(casestack, casesAsbytes)

	var loans []loan
	loanAsbytes, _ := json.Marshal(loans)
	err = stub.PutState(loanStackKey, loanAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt put state"))
	}
	return shim.Success(nil)
}

//Invoking functionality
func (t *Oilchain) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	//handle different functions
	if function == "init" {
		return t.Init(stub)
	} else if function == "initBorrower" {
		return t.InitBorrower(stub, args)
	} else if function == "addFinancialStatement" {
		return t.AddFinancialStatement(stub, args)
	} else if function == "initEngineer" {
		return t.InitEngineer(stub, args)
	} else if function == "makeReserveReport" {
		return t.MakeReserveReport(stub, args)
	} else if function == "addComplianceCertificate" {
		return t.AddComplianceCertificate(stub, args)
	} else if function == "createCase" {
		return t.CreateCase(stub, args)
	} else if function == "initAdministrativeAgent" {
		return t.InitAdministrativeAgent(stub, args)
	} else if function == "initAuditor" {
		return t.InitAuditor(stub, args)
	} else if function == "updateLoanPackage" {
		return t.UpdateLoanPackage(stub, args)
	} else if function == "requestFinancialStatement" {
		return t.RequestFinancialStatement(stub, args)
	} else if function == "initLender" {
		return t.InitLender(stub, args)
	} else if function == "makeProposals" {
		return t.MakeProposals(stub, args)
	} else if function == "makeLoanPackage" {
		return t.MakeLoanPackage(stub, args)
	} else if function == "makeCreditAgreement" {
		return t.MakeCreditAgreement(stub, args)
	} else if function == "updateReserveRep" {
		return t.UpdateReserveRep(stub, args)
	} else if function == "addHedgeAgreementByLender" {
		return t.AddHedgeAgreementByLender(stub, args)
	} else if function == "read" {
		return t.Read(stub, args)
	} else if function == "addHedgeAgreementByAdminAgent" {
		return t.AddHedgeAgreementByAdminAgent(stub, args)
	} else if function == "breakHedgeForAdmin" {
		return t.BreakHedgeForAdmin(stub, args)
	} else if function == "breakHedgeForLender" {
		return t.BreakHedgeForLender(stub, args)
	}

	return shim.Error(fmt.Sprintf("No function called" + function))

}

// Query data
func (t *Oilchain) Query(stub shim.ChaincodeStubInterface, function string, args []string) pb.Response {
	if function == "read" {
		return t.Read(stub, args)
	} else if function == "readAllBorrowers" {
		return t.ReadAllBorrowers(stub, args)
	}

	return shim.Error(fmt.Sprintf("No function called with name of-" + function))
}

func (t *Oilchain) Read(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 1 {
		return shim.Error(fmt.Sprintf("wrong no. of args"))
	}

	valAsbytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf("wrong no. of args"))
	}
	return shim.Success(valAsbytes)

}

func (t *Oilchain) ReadAllBorrowers(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 0 {
		return shim.Error(fmt.Sprintf("wrong no. of args"))
	}

	return shim.Success(nil)
}
