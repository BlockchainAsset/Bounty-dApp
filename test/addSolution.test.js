const { BN, toWei } = web3.utils;

// bdAv1 = Bounty dApp v1
const bdAv1 = artifacts.require("bountydAppv1");
require('dotenv').config()

const truffleAssert = require('truffle-assertions');

const amount = new BN(toWei("0.001")); // <-- Change the amount value here for testing
const deadline = new BN(0); // <-- Change the deadline value here for testing
const description = "Please do X for Y Ethers";  // <-- Change the description here for testing
const solution = "X is done";  // <-- Change the solution here for testing
const oneEtherInWei = new BN(toWei("1"));
const zeroInBN = new BN(0);
const oneInBN = new BN(1);
const twoInBN = new BN(2);
const waitTimeInContract = new BN(process.env.WAIT_TIME_IN_CONTRACT);
const waitTimeInTest = process.env.WAIT_TIME_IN_TEST;

function wait(seconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds*1000));
}

contract('bountydAppv1', (accounts) => {

  let bdAv1Instance;
  let _bountyIDReceipt, _bountyID;
  let owner, alice, bob, carol, resolverOne, resolverTwo, resolverThree;

  before("Preparing Accounts and Initial Checks", async function() {
    assert.isAtLeast(accounts.length, 7, "Atleast three accounts required");

    // Setup 7 accounts.
    [owner, alice, bob, carol, resolverOne, resolverTwo, resolverThree] = accounts;

    //Checking if all accounts have atleast 1 ETH or more for test
    assert.isTrue((new BN(await web3.eth.getBalance(owner))).gt(oneEtherInWei), "Owner Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(alice))).gt(oneEtherInWei), "Alice Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(bob))).gt(oneEtherInWei), "Bob Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(carol))).gt(oneEtherInWei), "Carol Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverOne))).gt(oneEtherInWei), "Resolver One Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverTwo))).gt(oneEtherInWei), "Resolver Two Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverThree))).gt(oneEtherInWei), "Resolver Three Account has less than 1 ETH");

  });

  beforeEach("Creating New Instance", async function() {
    bdAv1Instance = await bdAv1.new(true, { from: owner});
    _bountyIDReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyID = _bountyIDReceipt.receipt.logs[1].args.bountyID;
});

  describe("Function: addSolution", function() {

    describe("Basic Working", function() {

      it('Should create a new bounty correctly', async () => {
        let _solutionIDReceipt = await bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob});
        let _solutionID = _solutionIDReceipt.receipt.logs[0].args.solutionID;

        let _solutionDetails = await bdAv1Instance.solutions(_solutionID);
        let _bountyIDinSolution = _solutionDetails.bountyID;
        let _linkedSolution = _solutionDetails.linkedSolution;
        let _bountyHunter = _solutionDetails.bountyHunter;
        let _solution = _solutionDetails.solution;
 
        assert.strictEqual(_bountyID.toString(10), _bountyIDinSolution.toString(10), "Bounty ID don't match");
        assert.strictEqual(_linkedSolution.toString(10), _solutionID.toString(10), "Linked Solution don't match");
        assert.strictEqual(_bountyHunter.toString(10), bob, "Bounty Hunter don't match");
        assert.strictEqual(_solution, solution, "Solution don't match");
      });

    });

    describe("Input Cases", function() {

      describe("Should not work if all three inputs are not given", function() {
    
        it('Without bounty ID', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(zeroInBN, solution, {from: bob}),
            null,
            ''
          );
        });

        it('Without Linked Solution', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(_bountyID, solution, {from: bob}),
            null,
            ''
          );
        });

        it('Without Solution', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(_bountyID, zeroInBN, {from: bob}),
            null,
            ''
          );
        });

        it('Without bounty ID & Linked Solution', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(solution, {from: bob}),
            null,
            ''
          );
        });

        it('Without bounty ID & Solution', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(zeroInBN, {from: bob}),
            null,
            ''
          );
        });

        it('Without Linked Solution and Solution', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution(_bountyID, {from: bob}),
            null,
            ''
          );
        });

        it('Without any Parameter', async () => {
          await truffleAssert.fails(
            bdAv1Instance.addSolution({from: bob}),
            null,
            ''
          );
        });

      });

    });

    describe("Edge Cases", function() {

      it('Should only add solution if bounty status is Open', async () => {
        await bdAv1Instance.closeBounty(_bountyID, {from: alice});
        await truffleAssert.fails(
          bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob}),
          null,
          'Solution can only be submitted to Open Bounties'
        );
      });

      it('Solution should not be submittable if deadline has passed.', async () => {
        var d = new Date();
        var seconds = new BN(Math.round(d.getTime() / 1000));
        _bountyIDReceipt = await bdAv1Instance.createBounty(amount, seconds.add(waitTimeInContract), description, {from: alice, value: amount});
        _bountyID = _bountyIDReceipt.receipt.logs[1].args.bountyID;
        await wait(waitTimeInTest);
        await truffleAssert.fails(
          bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob}),
          null,
          'Bounty Deadline has Reached!'
        );
      });

      it('If linked solution specified is zero, then it should save its own solution ID as Linked Solution', async () => {
        let _solutionIDReceipt = await bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob});
        let _solutionID = _solutionIDReceipt.receipt.logs[0].args.solutionID;

        let _solutionDetails = await bdAv1Instance.solutions(_solutionID);
        let _linkedSolution = _solutionDetails.linkedSolution;
 
        assert.strictEqual(_linkedSolution.toString(10), _solutionID.toString(10), "Linked Solution don't match");
      });

      it('If linked solution is specified, then it should save its without using own Solution ID', async () => {
        let _solutionIDReceipt = await bdAv1Instance.addSolution(_bountyID, oneInBN, solution, {from: bob});
        let _solutionID = _solutionIDReceipt.receipt.logs[0].args.solutionID;

        let _solutionDetails = await bdAv1Instance.solutions(_solutionID);
        let _linkedSolution = _solutionDetails.linkedSolution;
 
        assert.strictEqual(_linkedSolution.toString(10), oneInBN.toString(10), "Linked Solution don't match");
      });

      it('Solution List in bounties should contain the solution ID', async () => {
        let _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyID, oneInBN, solution, {from: bob});
        let _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
        let _solutionIDReceiptTwo = await bdAv1Instance.addSolution(_bountyID, oneInBN, solution, {from: bob});
        let _solutionIDTwo = _solutionIDReceiptTwo.receipt.logs[0].args.solutionID;

        let _solutionListOne = await bdAv1Instance.bountyToSolutionList(_bountyID, 0);
        let _solutionListTwo = await bdAv1Instance.bountyToSolutionList(_bountyID, 1);

        assert.strictEqual(_solutionListOne.toString(10), _solutionIDOne.toString(10), "First Solution don't match");
        assert.strictEqual(_solutionListTwo.toString(10), _solutionIDTwo.toString(10), "Second Solution don't match");
      });

      it('Address to Solution List in contract should contain the solution ID', async () => {
        let _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyID, oneInBN, solution, {from: bob});
        let _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
        let _solutionIDReceiptTwo = await bdAv1Instance.addSolution(_bountyID, _solutionIDOne, solution, {from: bob});
        let _solutionIDTwo = _solutionIDReceiptTwo.receipt.logs[0].args.solutionID;
        let _solutionIDReceiptThree = await bdAv1Instance.addSolution(_bountyID, oneInBN, solution, {from: carol});
        let _solutionIDThree = _solutionIDReceiptThree.receipt.logs[0].args.solutionID;

        let _solutionListOne = await bdAv1Instance.addressToSolutionList(bob, 0);
        let _solutionListTwo = await bdAv1Instance.addressToSolutionList(bob, 1);
        let _solutionListThree = await bdAv1Instance.addressToSolutionList(carol, 0);

        assert.strictEqual(_solutionListOne.toString(10), _solutionIDOne.toString(10), "First Solution don't match");
        assert.strictEqual(_solutionListTwo.toString(10), _solutionIDTwo.toString(10), "Second Solution don't match");
        assert.strictEqual(_solutionListThree.toString(10), _solutionIDThree.toString(10), "Third Solution don't match");
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: SolutionCreated", async () => {

        let _solutionIDReceipt = await bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob});
        let _solutionID = _solutionIDReceipt.receipt.logs[0].args.solutionID;

        assert.strictEqual(_solutionIDReceipt.logs.length, 1);
        const log = _solutionIDReceipt.logs[0];
    
        assert.strictEqual(log.event, "SolutionCreated");
        assert.strictEqual(log.args.bountyID.toString(10), _bountyID.toString(10));
        assert.strictEqual(log.args.solutionID.toString(10), _solutionID.toString(10));
        assert.strictEqual(log.args.solutionCreator, bob);
      });

    });

  });

});