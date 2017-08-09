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
	lenderAcc := lender{}
	lenderAsbytes, _ := stub.GetState(lenderId)
	err := json.Unmarshal(lenderAsbytes, &lenderAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("couldnt unmarshal"))
	}
	lenderAcc.Proposals = append(lenderAcc.Proposals, pro)
	newLenderAsbytes, _ := json.Marshal(lenderAcc)
	_ = stub.PutState(lenderId, newLenderAsbytes)
	newCaseStackAsbytes, _ := json.Marshal(cases)
	err = stub.PutState(casestack, newCaseStackAsbytes)
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

func (t *Oilchain) AddHedgeAgreementByLender(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 6 {
		shim.Error(fmt.Sprintf("wrong number of arguments"))
	}

	lenderId := args[0]
	hedgeId := args[1]
	loanId := args[2]
	baseValue := args[3]
	docId := args[4]
	docName := args[5]
	var adminId string
	var err error
	hedgeAgree := hedgeAgreement{}
	hedgeAgree.BaseValue, err = strconv.ParseFloat(baseValue, 64)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:expected float in arguments"))
	}
	hedgeAgree.HedgerId = lenderId
	hedgeAgree.Doc.Id = docId
	hedgeAgree.Doc.DocName = docName
	hedgeAgree.Status = `pending`
	hedgeAgree.HedgeId = hedgeId
	hedgeAgree.MarkToMarket = 0
	hedgeAgree.LoanId = loanId

	lenderAcc := lender{}
	lenderAsBytes, _ := stub.GetState(lenderId)

	err = json.Unmarshal(lenderAsBytes, &lenderAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:unmarshalling err with the state"))
	}
	var loans []loan
	loansAsbytes, _ := stub.GetState(loanStackKey)
	_ = json.Unmarshal(loansAsbytes, &loans)
	for i := range loans {
		if loans[i].LoanId == loanId {
			adminId = loans[i].LoanCase.AdministrativeAgentId
		}
	}
	/*for i := range lenderAcc.Loans {
		if lenderAcc.Loans[i].LoanId == loanId {
			adminId = lenderAcc.Loans[i].LoanCase.AdministrativeAgentId
		}
	}*/
	lenderAcc.HedgeAgreements = append(lenderAcc.HedgeAgreements, hedgeAgree)
	newLenderAsBytes, _ := json.Marshal(lenderAcc)
	_ = stub.PutState(lenderId, newLenderAsBytes)

	adminAcc := administrativeAgent{}
	adminAsBytes, _ := stub.GetState(adminId)
	err = json.Unmarshal(adminAsBytes, &adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:unmarshalling err with the state"))
	}
	for j := range adminAcc.Loans {
		if adminAcc.Loans[j].LoanId == loanId {
			adminAcc.Loans[j].HedgeProposals = append(adminAcc.Loans[j].HedgeProposals, hedgeAgree)
		}
	}
	newAdminAsBytes, _ := json.Marshal(adminAcc)
	_ = stub.PutState(adminId, newAdminAsBytes)

	return shim.Success(nil)
}

func (t *Oilchain) BreakHedgeForLender(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("C:wrong number of arguments"))
	}
	lenderId := args[0]
	hedgeId := args[1]
	markToMarket, err := strconv.ParseFloat(args[2], 64)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:expected float in argument"))
	}
	lenderAcc := lender{}
	lenderAsBytes, _ := stub.GetState(lenderId)
	var borrowerId, loanId string
	var lenderIds []string
	var adminId string
	var loans []loan

	err = json.Unmarshal(lenderAsBytes, &lenderAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:2error unmarshalling"))
	}
	for i := range lenderAcc.HedgeAgreements {
		if lenderAcc.HedgeAgreements[i].HedgeId == hedgeId {
			lenderAcc.HedgeAgreements[i].MarkToMarket = markToMarket
			lenderAcc.HedgeAgreements[i].Status = `discontinued`
			loanId = lenderAcc.HedgeAgreements[i].LoanId
		}
	}
	loanStackAsbytes, _ := stub.GetState(loanStackKey)
	err = json.Unmarshal(loanStackAsbytes, &loans)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:0 error unmarshalling"))
	}
	for h := range loans {
		if loans[h].LoanId == loanId {
			adminId = loans[h].LoanCase.AdministrativeAgentId
		}
	}
	adminAcc := administrativeAgent{}
	adminAsbytes, _ := stub.GetState(adminId)
	err = json.Unmarshal(adminAsbytes, &adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:1error unmarshalling"))
	}
	for p := range adminAcc.Loans { //hedgers updated
		if adminAcc.Loans[p].LoanId == loanId {
			borrowerId = adminAcc.Loans[p].LoanCase.BorrowerId
			lenderIds = adminAcc.Loans[p].Lenders
			for t := range adminAcc.Loans[p].HedgeAgreements {
				hedgerAcc := lender{}
				hedgerAsBytes, _ := stub.GetState(adminAcc.Loans[p].HedgeAgreements[t].HedgerId)
				err = json.Unmarshal(hedgerAsBytes, &hedgerAcc)
				if err != nil {
					return shim.Error(fmt.Sprintf("C:3error unmarshalling"))
				}
				for f := range hedgerAcc.Loans {
					if hedgerAcc.Loans[f].LoanId == loanId {
						for d := range hedgerAcc.Loans[f].HedgeAgreements {
							if hedgerAcc.Loans[f].HedgeAgreements[d].HedgeId == hedgeId {
								hedgerAcc.Loans[f].HedgeAgreements[d].MarkToMarket = markToMarket
								hedgerAcc.Loans[f].HedgeAgreements[d].Status = `discontinued`
							}
						}
					}
				}
				newHedgerAsbytes, _ := json.Marshal(hedgerAcc)
				_ = stub.PutState(adminAcc.Loans[p].HedgeAgreements[t].HedgerId, newHedgerAsbytes)
			}
		}
	}

	for j := range lenderAcc.Loans { //updating in current lender
		if lenderAcc.Loans[j].LoanId == loanId {
			for k := range lenderAcc.Loans[j].HedgeAgreements {
				if lenderAcc.Loans[j].HedgeAgreements[k].HedgeId == hedgeId {
					lenderAcc.Loans[j].HedgeAgreements[k].Status = `discontinued`
					lenderAcc.Loans[j].HedgeAgreements[k].MarkToMarket = markToMarket

				}
			}
		}
	}
	for l := range lenderIds { //updating in all lenders

		lenderLocalAcc := lender{}
		lenderLocalAsBytes, _ := stub.GetState(lenderIds[l])
		e := json.Unmarshal(lenderLocalAsBytes, &lenderLocalAcc)
		if e != nil {
			return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
		}

		for r := range lenderLocalAcc.Loans {
			if lenderLocalAcc.Loans[r].LoanId == loanId {
				lenderIds = lenderLocalAcc.Loans[r].Lenders
				for k := range lenderLocalAcc.Loans[r].HedgeAgreements {
					if lenderLocalAcc.Loans[r].HedgeAgreements[k].HedgeId == hedgeId {
						lenderLocalAcc.Loans[r].HedgeAgreements[k].Status = `discontinued`
						lenderLocalAcc.Loans[r].HedgeAgreements[k].MarkToMarket = markToMarket

					}
				}
			}
		}
		newLocalLenderAsbytes, _ := json.Marshal(lenderLocalAcc)
		_ = stub.PutState(lenderIds[l], newLocalLenderAsbytes)

	}

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	err = json.Unmarshal(borrowerAsbytes, &borrowerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
	}
	for z := range borrowerAcc.Loans {
		if borrowerAcc.Loans[z].LoanId == loanId {
			for x := range borrowerAcc.Loans[z].HedgeAgreements {
				if borrowerAcc.Loans[z].HedgeAgreements[x].HedgeId == hedgeId {
					borrowerAcc.Loans[z].HedgeAgreements[x].MarkToMarket = markToMarket
					borrowerAcc.Loans[z].HedgeAgreements[x].Status = `discontinued`
				}
			}
		}
	}
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes)

	newLenderAsbytes, _ := json.Marshal(lenderAcc)
	_ = stub.PutState(lenderId, newLenderAsbytes)

	return shim.Success(nil)
}
