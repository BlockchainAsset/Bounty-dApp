const { BN, toWei } = web3.utils;

// bdAv1 = Bounty dApp v1
const bdAv1 = artifacts.require("bountydAppv1");

const truffleAssert = require('truffle-assertions');

const amount = new BN(toWei("0.001")); // <-- Change the amount value here for testing
const deadline = new BN(0); // <-- Change the deadline value here for testing
const description = "Please do X for Y Ethers";  // <-- Change the description here for testing
const solution = "X is done";  // <-- Change the solution here for testing
const comment = "X was not done correctly" // <-- Change the comment for testing
const oneEtherInWei = new BN(toWei("1"));
const zeroInBN = new BN(0);
const oneInBN = new BN(1);
const waitTimeInContract = new BN(60);
const waitTimeInTest = 120;
const zeroAdd = "0x0000000000000000000000000000000000000000";
const withdrawAmount = new BN(toWei("0.0001")); // <-- Change the withdraw amount value here for testing

contract('bountydAppv1', (accounts) => {

  let bdAv1Instance;
  let _bountyIDReceiptOne, _bountyIDOne;
  let _solutionIDReceiptOne, _solutionIDOne;
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
    _bountyIDReceiptOne = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyIDOne = _bountyIDReceiptOne.receipt.logs[1].args.bountyID;
    _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyIDOne, zeroInBN, solution, {from: bob});
    _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
});

  describe("Contract: Stoppable", function() {

    describe("Basic Working", function() {

      it('Should update the pause/stop status correctly', async () => {
        let _contractStatus = await bdAv1Instance.getRunningStatus();

        assert.strictEqual(_contractStatus, true, "Contract is not running currently")

        await bdAv1Instance.pauseContract({from: owner});

        _contractStatus = await bdAv1Instance.getRunningStatus();
 
        assert.strictEqual(_contractStatus, false, "Contract is running currently")

        await bdAv1Instance.resumeContract({from: owner});

        _contractStatus = await bdAv1Instance.getRunningStatus();

        assert.strictEqual(_contractStatus, true, "Contract is not running currently")

        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});

        _contractStatus = await bdAv1Instance.getStopStatus();

        assert.strictEqual(_contractStatus, true, "Contract is running currently")

      });

      it('Paused contract function addResolver should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addResolver(resolverOne, {from: owner}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function addResolver should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addResolver(resolverOne, {from: owner}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function updateResolver should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function updateResolver should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function createBounty should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function createBounty should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function addSolution should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addSolution(_bountyIDOne, zeroInBN, solution, {from: bob}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function addSolution should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addSolution(_bountyIDOne, zeroInBN, solution, {from: bob}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function acceptSolution should not be able to run', async () => {
            await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.acceptSolution(_solutionIDOne, {from: alice}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function acceptSolution should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.acceptSolution(_solutionIDOne, {from: alice}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function rejectSolution should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function rejectSolution should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function raiseDispute should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.raiseDispute(_solutionIDOne, {from: bob}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function raiseDispute should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.raiseDispute(_solutionIDOne, {from: bob}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function solveDispute should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.solveDispute(zeroInBN, oneInBN, {from: resolverTwo}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function solveDispute should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.solveDispute(zeroInBN, oneInBN, {from: resolverTwo}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function closeBounty should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.closeBounty(_bountyIDOne, {from: alice}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function closeBounty should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.closeBounty(_bountyIDOne, {from: alice}),
          null,
          'Contract is Stopped permanently'
        );
      });

      it('Paused contract function withdraw should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.withdraw(withdrawAmount, {from: alice}),
          null,
          'Contract is Paused at the moment'
        );
      });

      it('Closed contract function withdraw should not be able to run', async () => {
        await bdAv1Instance.pauseContract({from: owner});
        await bdAv1Instance.stopContract({from: owner});
        await truffleAssert.fails(
          bdAv1Instance.withdraw(withdrawAmount, {from: alice}),
          null,
          'Contract is Stopped permanently'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: LogPausedContract", async () => {

        let _resumeReceipt = await bdAv1Instance.pauseContract({from: owner});

        assert.strictEqual(_resumeReceipt.logs.length, 1);
        const log = _resumeReceipt.logs[0];
    
        assert.strictEqual(log.event, "LogPausedContract");
        assert.strictEqual(log.args.sender, owner);
      });

      it("Should correctly emit the proper event: LogResumedContract", async () => {

        await bdAv1Instance.pauseContract({from: owner});
        let _resumeReceipt = await bdAv1Instance.resumeContract({from: owner});

        assert.strictEqual(_resumeReceipt.logs.length, 1);
        const log = _resumeReceipt.logs[0];
    
        assert.strictEqual(log.event, "LogResumedContract");
        assert.strictEqual(log.args.sender, owner);
      });

      it("Should correctly emit the proper event: LogStoppedContract", async () => {

        await bdAv1Instance.pauseContract({from: owner});
        let _stopReceipt = await bdAv1Instance.stopContract({from: owner});

        assert.strictEqual(_stopReceipt.logs.length, 1);
        const log = _stopReceipt.logs[0];
    
        assert.strictEqual(log.event, "LogStoppedContract");
        assert.strictEqual(log.args.sender, owner);
      });

    });

  });

});