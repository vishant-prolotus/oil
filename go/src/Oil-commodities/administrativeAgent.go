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
		for t := range lenderAcc.Proposals {
			if lenderAcc.Proposals[t].CaseId == caseId {
				lenderAcc.Proposals[t].Status = `loanPack made`
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		e := stub.PutState(lenderId, newLenderAsbytes)
		if e != nil {
			return shim.Error(fmt.Sprintf("didnt write state"))
		}
	}
	var loans []loan
	loanStackAsbytes, _ := stub.GetState(loanStackKey)
	err := json.Unmarshal(loanStackAsbytes, &loans)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt unmarshall loanstack"))
	}
	loans = append(loans, loanPack)
	newLoanStackAsbytes, _ := json.Marshal(loans)
	err = stub.PutState(loanStackKey, newLoanStackAsbytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt write state"))
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
			adminAcc.Loans[i].Status = `credit made`
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
			borrowerAcc.Loans[i].Status = `credit made`
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

func (t *Oilchain) AddHedgeAgreementByAdminAgent(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 7 {
		return shim.Error(fmt.Sprintf("wrong number of aarguments"))
	}

	adminId := args[0]
	loanId := args[1]
	hedgeId := args[2]
	baseValue := args[3]
	docId := args[4]
	docName := args[5]
	numOfHedgers, e := strconv.Atoi(args[6])
	if e != nil {
		return shim.Error(fmt.Sprintf("number of hedgers wrong"))
	}
	var err error
	var borrowerId string
	hedgeAgree := hedgeAgreement{}
	if len(hedgeId) != 0 {

		hedgeAgree.BaseValue, err = strconv.ParseFloat(baseValue, 64)
		if err != nil {
			return shim.Error(fmt.Sprintf("C:expected a float number in argument"))
		}
		hedgeAgree.HedgerId = adminId
		hedgeAgree.Doc.Id = docId
		hedgeAgree.Doc.DocName = docName
		hedgeAgree.Status = `active`
		hedgeAgree.HedgeId = hedgeId
		hedgeAgree.MarkToMarket = 0
		hedgeAgree.LoanId = loanId
	}
	adminAcc := administrativeAgent{}
	adminAsBytes, err := stub.GetState(adminId)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt read state"))
	}
	err = json.Unmarshal(adminAsBytes, &adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
	}
	for i := range adminAcc.Loans {
		if adminAcc.Loans[i].LoanId == loanId {
			if len(hedgeId) != 0 {
				adminAcc.Loans[i].HedgeAgreements = append(adminAcc.Loans[i].HedgeAgreements, hedgeAgree)
			}
			borrowerId = adminAcc.Loans[i].LoanCase.BorrowerId
		}
	}
	if len(hedgeId) != 0 {
		adminAcc.HedgeAgreements = append(adminAcc.HedgeAgreements, hedgeAgree)
	}
	var hedgeAgreements []hedgeAgreement
	var lenders []string
	var hedgerIds []string
	if len(hedgeId) != 0 {
		hedgeAgreements = append(hedgeAgreements, hedgeAgree)
	}

	for j := range adminAcc.Loans {
		if adminAcc.Loans[j].LoanId == loanId {
			lenders = adminAcc.Loans[j].Lenders
			for k := range adminAcc.Loans[j].HedgeProposals {
				fmt.Printf(strconv.Itoa(k))
				for l := 7; l < 7+numOfHedgers; l++ {
					fmt.Printf(strconv.Itoa(l))
					if args[l] == adminAcc.Loans[j].HedgeProposals[k].HedgeId {
						adminAcc.Loans[j].HedgeProposals[k].Status = `active`
						adminAcc.Loans[j].HedgeAgreements = append(adminAcc.Loans[j].HedgeAgreements, adminAcc.Loans[j].HedgeProposals[k])
						hedgeAgreements = append(hedgeAgreements, adminAcc.Loans[j].HedgeProposals[k])
						hedgerIds = append(hedgerIds, adminAcc.Loans[j].HedgeProposals[k].HedgerId)
					}
				}

			}
		}
	}

	for k := range hedgerIds { //hedgers proposals updated
		lenderAcc := lender{}
		lenderAsBytes, _ := stub.GetState(hedgerIds[k])
		erro := json.Unmarshal(lenderAsBytes, &lenderAcc)
		if erro != nil {
			return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
		}
		for z := range lenderAcc.HedgeAgreements {
			for x := 7; x < 7+numOfHedgers; x++ {
				if lenderAcc.HedgeAgreements[z].HedgeId == args[x] {
					lenderAcc.HedgeAgreements[z].Status = `active`
				}
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		_ = stub.PutState(hedgerIds[k], newLenderAsbytes)
	}

	for t := range lenders { //lenders hedge documents updated
		lenderAcc := lender{}
		lenderAsBytes, _ := stub.GetState(lenders[t])
		e := json.Unmarshal(lenderAsBytes, &lenderAcc)
		if e != nil {
			return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
		}
		for o := range lenderAcc.Loans {
			if lenderAcc.Loans[o].LoanId == loanId {
				for hedgeIndex := range hedgeAgreements {
					lenderAcc.Loans[o].HedgeAgreements = append(lenderAcc.Loans[o].HedgeAgreements, hedgeAgreements[hedgeIndex])
				}
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderAcc)
		_ = stub.PutState(lenders[t], newLenderAsbytes)
	}

	borrowerAcc := borrower{}
	borrowerAsbytes, _ := stub.GetState(borrowerId)
	err = json.Unmarshal(borrowerAsbytes, &borrowerAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt unmarshal"))
	}
	for index := range borrowerAcc.Loans {
		if borrowerAcc.Loans[index].LoanId == loanId {
			for hedgeInd := range hedgeAgreements {
				borrowerAcc.Loans[index].HedgeAgreements = append(borrowerAcc.Loans[index].HedgeAgreements, hedgeAgreements[hedgeInd])
			}
		}
	}
	newBorrowerAsbytes, _ := json.Marshal(borrowerAcc)
	_ = stub.PutState(borrowerId, newBorrowerAsbytes)

	newAdminAsbytes, err := json.Marshal(adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:couldnt marshal"))
	}
	_ = stub.PutState(adminId, newAdminAsbytes)

	return shim.Success(nil)
}

func (t *Oilchain) BreakHedgeForAdmin(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("C:wrong number of arguments"))
	}
	adminId := args[0]
	hedgeId := args[1]
	markToMarket, err := strconv.ParseFloat(args[2], 64)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:expected float in arguments"))
	}
	adminAcc := administrativeAgent{}
	adminAsBytes, _ := stub.GetState(adminId)
	var borrowerId, loanId string
	var lenderIds []string
	err = json.Unmarshal(adminAsBytes, &adminAcc)
	if err != nil {
		return shim.Error(fmt.Sprintf("C:wrong number of arguments"))
	}
	for i := range adminAcc.HedgeAgreements {
		if adminAcc.HedgeAgreements[i].HedgeId == hedgeId {
			adminAcc.HedgeAgreements[i].MarkToMarket = markToMarket
			adminAcc.HedgeAgreements[i].Status = `discontinued`
			loanId = adminAcc.HedgeAgreements[i].LoanId
		}
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
					return shim.Error(fmt.Sprintf("C:error unmarshalling"))
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

	for j := range adminAcc.Loans { //updating in current lender
		if adminAcc.Loans[j].LoanId == loanId {
			borrowerId = adminAcc.Loans[j].LoanCase.BorrowerId
			lenderIds = adminAcc.Loans[j].Lenders
			for k := range adminAcc.Loans[j].HedgeAgreements {
				if adminAcc.Loans[j].HedgeAgreements[k].HedgeId == hedgeId {
					adminAcc.Loans[j].HedgeAgreements[k].Status = `discontinued`
					adminAcc.Loans[j].HedgeAgreements[k].MarkToMarket = markToMarket

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
		///////////
		for j := range lenderLocalAcc.Loans {
			if lenderLocalAcc.Loans[j].LoanId == loanId {
				lenderIds = lenderLocalAcc.Loans[j].Lenders
				for k := range lenderLocalAcc.Loans[j].HedgeAgreements {
					if lenderLocalAcc.Loans[j].HedgeAgreements[k].HedgeId == hedgeId {
						lenderLocalAcc.Loans[j].HedgeAgreements[k].Status = `discontinued`
						lenderLocalAcc.Loans[j].HedgeAgreements[k].MarkToMarket = markToMarket

					}
				}
			}
		}
		newLenderAsbytes, _ := json.Marshal(lenderLocalAcc)
		_ = stub.PutState(lenderIds[l], newLenderAsbytes)
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
	newAdminAsbytes, _ := json.Marshal(adminAcc)
	_ = stub.PutState(adminId, newAdminAsbytes)

	return shim.Success(nil)
}
