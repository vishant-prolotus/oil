package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *Oilchain) InitLender(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}

	lenderId := args[0]
	lenderName := args[1]
	lenderEmail := args[2]

	lenderAcc := lender{}
	////////////////////////////////////
	//      lender parsing
	/////////////////////////////////////
	lenderAcc.Id = lenderId
	lenderAcc.Name = lenderName
	lenderAcc.Email = lenderEmail

	lenderAsbytes, _ := json.Marshal(lenderAcc)
	err := stub.PutState(lenderId, lenderAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write any state"))
	}

	return shim.Success(nil)
}

func (t *Oilchain) MakeProposals(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error(fmt.Sprintf("Wrong number of arguments"))
	}
	lenderId := args[0]
	caseId := args[1]
	adminId := args[2]
	amount := args[3]

	pro := proposal{}
	pro.CaseId = caseId
	pro.LenderId = lenderId
	pro.Amount, _ = strconv.ParseFloat(amount, 64)
	pro.Status = `pending`

	var cases []Case
	CaseStackAsbytes, _ := stub.GetState(casestack)
	_ = json.Unmarshal(CaseStackAsbytes, &cases)
	for i := range cases {
		if cases[i].Id == caseId {
			cases[i].Proposals = append(cases[i].Proposals, pro)
		}
	}
	newCaseStackAsbytes, _ := json.Marshal(cases)
	err := stub.PutState(casestack, newCaseStackAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	adminAgent := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	_ = json.Unmarshal(adminAsbytes, &adminAgent)
	for i := range adminAgent.Cases {
		if adminAgent.Cases[i].Id == caseId {
			adminAgent.Cases[i].Proposals = append(adminAgent.Cases[i].Proposals, pro)
		}
	}
	newAdminAsbytes, _ := json.Marshal(adminAgent)
	err = stub.PutState(adminId, newAdminAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("didnt write state"))
	}

	return shim.Success(nil)
}
