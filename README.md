# Bounty-dApp ![](https://travis-ci.org/remedcu/Bounty-dApp.svg?branch=master)

Bounty dApp - Simple implementation of Bounty System in Blockchain

## Description

This dApp would help you to run a smart contract which allows anyone to create a bounty, and any valid hunter to submit a solution. If the Bounty creator gets a valid solution, he will accept it. He even has the option to reject a solution, along with a comment for the hunter to know what he can do, or how to improve. Then the bounty hunter can link his previous solution, if he wants, along with submitting a updated solution.

If there comes a situation, where there is a dispute, it could be solved by the resolvers, which would be added by the contract owner at any time. The decision of resolvers would be final. A bounty creator can also close his bounty, after deadline passes, if he doesn't get any valid result. A bounty creator who closed the bounty, or a bounty hunter who won a bounty can withdraw their winning as well.

## Function List

- *addResolver* : This function helps to add a new resolver. Takes the address of the resolver and adds it to the resolver array.
- *updateResolver* : This function helps to update a resolver status. Takes the address of the resolver and updates it's status along with majority and noOfResolvers.
- *createBountyID* : This function helps to create a unique bounty ID. Takes no inputs and returns unique bountyID recently created.
- *createBounty* : This function helps to create a bounty. Takes the necessary inputs and returns the bountyID recently created.
- *deposit* : This function helps to deposit money into the contract. Only people with enough balance will be able to create bounty.
- *addressToBountyListLength* : This function helps to get the length of the Bounty submitted by a single user. Takes no inputs and returns length of Bounty Queue.
- *bountyToSolutionListLength* : This function helps to get the length of the Solutions submitted to a single bounty. Takes the bounty ID as input and returns length of Solutions submitted.
- *createSolutionID* : This function helps to create a unique solution ID. Takes no inputs and returns unique solutionID recently created.
- *addSolution* : This function helps to create a solution. Takes the necessary inputs and returns the solutionID recently created.
- *addressToSolutionListLength* : This function helps to get the length of the Solution submitted by a single user. Takes no inputs and returns length of Solution Queue.
- *acceptSolution* : This function helps to accept a solution for a bounty. Takes the necessary inputs and updates the state of a bounty.
- *rejectSolution* : This function helps to reject a solution for a bounty. Takes the necessary inputs and updates the state of a solution.
- *disputeQueueLength* : This function helps to get the length of the Dispute Queue. Takes no inputs and returns length of Dispute Queue.
- *raiseDispute* : This function helps to raise a dispute for a solution which was rejected. Takes the necessary inputs and starts a dispute process for a solution.
- *solveDispute* : This function helps to check a dispute on solution raised by a hunter which was rejected. For the dispute to be solved a majority is formed from approved resolvers.
- *closeBounty* : This function helps to close a bounty without accepting any solution. Could be called by bounty maker to close it without a solution or internal call from acceptSolution function.
- *withdraw* : This function helps to withdraw money from the contract. Only people with balance not tied to any bounty will be able to withdraw.

## User Specification

*Bounty Owner* can :

- Add new resolvers
- Update resolver status
- Pause Contract
- Resume Contract
- Stop Contract
- Change Owner

*Bounty Creator* can :

- Create new bounty (Along with depositing)
- Accept solution
- Reject solution
- Close bounty
- Withdraw

*Bounty Hunter* can :

- Create new solution
- Create linked solution
- Raise Dispute
- Withdraw

*Bounty Resolver* can :

- Solve dispute

## Enhancement to do

- Currently there is a limitation of upto 10 resolvers
- Bounty creator can close bounty even when there are solutions which was not rejected.
- A dynamic system of assigning random 3 or 5 resolvers from the list of resolvers to solve a dispute
- A hunter cannot dispute, if another person has already disputed.
- A solution cannot be added, if the bounty is disputed.
- More detailed solution structure for submitting answers. Maybe, provide file with IPFS, etc.
- Create a separate storage contract.

## How to Run the Project

1. First clone this repo

`git clone https://github.com/remedcu/Bounty-dApp.git`

2. For this and some other step, you need to have Truffle & other modules installed in your system. Enter the Bounty-dApp folder and please run:

`npm install` OR `npm i`

# 3. [To Do]

## How to Test the Contract

1. Please follow the step 1 - 2 of *How to Run the Project*.

2. Now start the test using:

`npm test`

Note: You can also use `truffle test` to test the smart contract, if you already have `ganache-cli` or Ganache GUI running in the background for testing in local network.

## Tests written:

### Contract: bountydAppv1

    Function: acceptSolution

      Basic Working
        ✓ Should accept a solution for a bounty correctly (206ms)
      Input Cases
        ✓ Without solution ID
      Edge Cases
        ✓ Should only accept solution by the Creator (53ms)
        ✓ Should only accept solution once (93ms)
        ✓ Should only accept solution if the bounty is Open (115ms)
      Event Cases
        ✓ Should correctly emit the proper event: BountyClosedWithWinner (60ms)

    Function: addResolver

      Basic Working
        ✓ Should add a new Resolver correctly (82ms)
        ✓ Should update the number of Resolvers correctly (122ms)
        ✓ Should update the majority correctly (190ms)
      Input Cases
        ✓ Without Resolver Address
      Edge Cases
        ✓ Should only add Resolver, if not already added Part 1 (138ms)
        ✓ Should only add Resolver, if not already added Part 2 (142ms)
      Event Cases
        ✓ Should correctly emit the proper event: ResolverAdded (45ms)

    Function: addSolution

      Basic Working
        ✓ Should create a new bounty correctly (101ms)
      Input Cases
        Should not work if all three inputs are not given
          ✓ Without bounty ID
          ✓ Without Linked Solution
          ✓ Without Solution
          ✓ Without bounty ID & Linked Solution
          ✓ Without bounty ID & Solution
          ✓ Without Linked Solution and Solution
          ✓ Without any Parameter
      Edge Cases
        ✓ Should only add solution if bounty status is Open (98ms)
        ✓ Solution should not be submittable if deadline has passed. (30137ms)
        ✓ If linked solution specified is zero, then it should save its own solution ID as Linked Solution (128ms)
        ✓ If linked solution is specified, then it should save its without using own Solution ID (92ms)
        ✓ Solution List in bounties should contain the solution ID (190ms)
        ✓ Address to Solution List in contract should contain the solution ID (237ms)
      Event Cases
        ✓ Should correctly emit the proper event: SolutionCreated (53ms)

    Function: closeBounty

      Basic Working
        ✓ Should close a bounty correctly (119ms)
      Input Cases
        ✓ Without Bounty ID
      Edge Cases
        ✓ closeBounty function can be called by Bounty Creator only (42ms)
        ✓ Only Open bounty can be closed (51ms)
        ✓ Cannot close bounty whose deadline has not passed yet (61ms)
      Event Cases
        ✓ Should correctly emit the proper event: DisputeSolved (52ms)

    Function: createBounty

      Basic Working
        ✓ Should create a new bounty correctly (63ms)
      Input Cases
        Should not work if all three inputs are not given
          ✓ Without amount
          ✓ Without deadline
          ✓ Without desciption
          ✓ Without amount & deadline
          ✓ Without amount & description
          ✓ Without deadline & description
          ✓ Without any parameters
      Edge Cases
        ✓ Should not create bounty of amount, if user balance < amount (46ms)
        ✓ Should not create bounty where deadline is already passed (60ms)
      Event Cases
        ✓ Should correctly emit the proper event: BountyCreated (56ms)
  
    Function: createBountyID

      Basic Working
        ✓ Should increment the bountyID correctly (83ms)

    Function: createSolutionID

      Basic Working
        ✓ Should increment the solutionID correctly (147ms)

    Function: deposit

      Basic Working
        ✓ Should update the balance correctly during bounty creation (83ms)
        ✓ Should add the balance correctly during bounty creation (74ms)
      Event Cases
        ✓ Should correctly emit the proper event: Deposit (52ms)

    Function: raiseDispute

      Basic Working
        ✓ Should raise a dispute for a solution submitted to a bounty correctly (157ms)
      Input Cases
        ✓ Without solution ID
      Edge Cases
        ✓ Dispute can be raised by the Hunter only (46ms)
        ✓ Could only dispute the solution once (93ms)
        ✓ Could only dispute to Bounty which has not accepted a solution (125ms)
        ✓ Could only dispute the bounty by one solution at a time (111ms)
      Event Cases
        ✓ Should correctly emit the proper event: BountyClosedWithWinner (84ms)

    Function: rejectSolution

      Basic Working
        ✓ Should reject a solution for a bounty correctly (182ms)
      Input Cases
        ✓ Without solution ID
        ✓ Without comment
        ✓ Without any parameters
      Edge Cases
        ✓ Solution can be rejected by the Creator only (110ms)
        ✓ Should only reject solution once (160ms)
        ✓ Should only reject solution if the solution is in Pending State (163ms)
      Event Cases
        ✓ Should correctly emit the proper event: BountyClosedWithWinner (97ms)

    Function: solveDispute
    
      Basic Working
        ✓ Should solve a dispute for a solution submitted to a bounty correctly in favor (269ms)
        ✓ Should solve a dispute for a solution submitted to a bounty correctly in against (317ms)
      Input Cases
        ✓ Without Dispute Index
        ✓ Without Vote
        ✓ Without any parameter
      Edge Cases
        ✓ solveDispute function can be called by Valid Resolvers only (58ms)
        ✓ Resolver could only vote for dispute once (132ms)
        ✓ Could only vote either yes or no (71ms)
        ✓ Once majority is voted in favor, no need to vote again by remaining Resolvers (215ms)
      Event Cases
        ✓ Should correctly emit the proper event: BountyClosedWithWinner (148ms)
        ✓ Should correctly emit the proper event: DisputeSolved (144ms)
        ✓ Should correctly emit the proper event: DisputeSolved (198ms)

    Function: updateResolver

      Basic Working
        ✓ Should update Resolver correctly (99ms)
        ✓ Should update the number of Resolvers correctly (72ms)
        ✓ Should update the majority correctly (90ms)
      Input Cases
        ✓ Without Resolver Address
        ✓ Without Resolver Status
        ✓ Without any parameter
      Edge Cases
        ✓ Should only update Resolver who was already added (62ms)
      Event Cases
        ✓ Should correctly emit the proper event: ResolverUpdated (59ms)

    Function: withdraw

      Basic Working
        ✓ Should withdraw a winning amount correctly (60ms)
        ✓ Should withdraw a closed bounty amount correctly (60ms)
      Input Cases
        ✓ Should only work if amount is given
      Edge Cases
        ✓ Should only work if amount > 0 (51ms)
        ✓ Should only work if balance > amount (68ms)
      Event Cases
        ✓ Should correctly emit the proper event: Withdrawed (42ms)

### Contract: Owned

      Basic Working
        ✓ Only admin should be able to call addResolver (47ms)
        ✓ Only admin should be able to call updateResolver (56ms)
        ✓ Should update the owner correctly (58ms)
      Input Cases
        ✓ Without new Owner
        ✓ New Owner as zero address (49ms)
      Event Cases
        ✓ Should correctly emit the proper event: LogOwnerChanged

### Contract: Stoppable

      Basic Working
        ✓ Should update the pause/stop status correctly (261ms)
        ✓ Paused contract function addResolver should not be able to run (100ms)
        ✓ Closed contract function addResolver should not be able to run (154ms)
        ✓ Paused contract function updateResolver should not be able to run (115ms)
        ✓ Closed contract function updateResolver should not be able to run (139ms)
        ✓ Paused contract function createBounty should not be able to run (105ms)
        ✓ Closed contract function createBounty should not be able to run (151ms)
        ✓ Paused contract function addSolution should not be able to run (115ms)
        ✓ Closed contract function addSolution should not be able to run (186ms)
        ✓ Paused contract function acceptSolution should not be able to run (164ms)
        ✓ Closed contract function acceptSolution should not be able to run (139ms)
        ✓ Paused contract function rejectSolution should not be able to run (97ms)
        ✓ Closed contract function rejectSolution should not be able to run (147ms)
        ✓ Paused contract function raiseDispute should not be able to run (90ms)
        ✓ Closed contract function raiseDispute should not be able to run (151ms)
        ✓ Paused contract function solveDispute should not be able to run (113ms)
        ✓ Closed contract function solveDispute should not be able to run (143ms)
        ✓ Paused contract function closeBounty should not be able to run (108ms)
        ✓ Closed contract function closeBounty should not be able to run (136ms)
        ✓ Paused contract function withdraw should not be able to run (101ms)
        ✓ Closed contract function withdraw should not be able to run (151ms)
      Event Cases
        ✓ Should correctly emit the proper event: LogPausedContract (51ms)
        ✓ Should correctly emit the proper event: LogResumedContract (86ms)
        ✓ Should correctly emit the proper event: LogStoppedContract (84ms)

## Note

- This is a prototype, please don't use it unless you know what you are doing.
- A lot can be improved in this. Feedbacks are welcome.
- Don't forget to unlock ether wallet accounts when required.

## Thank You for checking out! Star if this helped you in anyway!
