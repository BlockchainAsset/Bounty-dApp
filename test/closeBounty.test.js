const { BN, toWei } = web3.utils;

// bdAv1 = Bounty dApp v1
const bdAv1 = artifacts.require("bountydAppv1");

const truffleAssert = require('truffle-assertions');

const amount = new BN(toWei("0.001")); // <-- Change the amount value here for testing
const deadline = new BN(0); // <-- Change the deadline value here for testing
const valueDeadline = new BN(process.env.WAIT_TIME_IN_CONTRACT); // <-- Change the deadline value here for testing
const description = "Please do X for Y Ethers";  // <-- Change the description here for testing
const solution = "X is done";  // <-- Change the solution here for testing
const comment = "X was not done correctly" // <-- Change the comment for testing
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
  let _bountyIDOne, _bountyIDTwo, _bountyIDThree;
  let _solutionIDOne;
  let _disputeIndexZero = zeroInBN;
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
    let _bountyIDOneReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyIDOne = _bountyIDOneReceipt.receipt.logs[1].args.bountyID;
    var d = new Date();
    var seconds = new BN(Math.round(d.getTime() / 1000));
    let _bountyIDTwoReceipt = await bdAv1Instance.createBounty(amount, valueDeadline.add(seconds), description, {from: alice, value: amount});
    _bountyIDTwo = _bountyIDTwoReceipt.receipt.logs[1].args.bountyID;
    let _bountyIDThreeReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyIDThree = _bountyIDThreeReceipt.receipt.logs[1].args.bountyID;
    let _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyIDThree, zeroInBN, solution, {from: bob});
    _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
    await bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice});
    await bdAv1Instance.raiseDispute(_solutionIDOne, {from: bob});
  });

  describe("Function: closeBounty", function() {

    describe("Basic Working", function() {

      it('Should close a bounty correctly', async () => {
        let beforeFunctionCallValue = new BN(await bdAv1Instance.balances(alice));
        await bdAv1Instance.closeBounty(_bountyIDOne, {from: alice});
        let afterFunctionCallValue = new BN(await bdAv1Instance.balances(alice));

        let _bountyDetails = await bdAv1Instance.bounties(_bountyIDOne);
        let _status = _bountyDetails.status;
  
        assert.strictEqual(beforeFunctionCallValue.toString(10), afterFunctionCallValue.sub(amount).toString(10), "Balance don't match");
        assert.strictEqual(afterFunctionCallValue.toString(10), amount.toString(10), "Balance not updated correctly");
        assert.strictEqual(_status.toString(10), twoInBN.toString(10), "Bounty Status don't match");
      });

    });

    describe("Input Cases", function() {
    
      it('Without Bounty ID', async () => {
        await truffleAssert.fails(
          bdAv1Instance.closeBounty({from: alice}),
          null,
          ''
        );
      });

    });

    describe("Edge Cases", function() {

      it('closeBounty function can be called by Bounty Creator only', async () => {
        await truffleAssert.fails(
          bdAv1Instance.closeBounty(_bountyIDOne, {from: bob}),
          null,
          'Only Bounty Creator can close its bounty'
        );
      });

      it('Only Open bounty can be closed', async () => {
        await truffleAssert.fails(
          bdAv1Instance.closeBounty(_bountyIDThree, {from: alice}),
          null,
          'Only open bounties can be closed.'
        );
      });

      it('Cannot close bounty whose deadline has not passed yet', async () => {
        await truffleAssert.fails(
          bdAv1Instance.closeBounty(_bountyIDTwo, {from: alice}),
          null,
          'Only bounties whose deadline has been passed can be closed.'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: DisputeSolved", async () => {

        let _bountyClosedReceipt = await bdAv1Instance.closeBounty(_bountyIDOne, {from: alice});

        assert.strictEqual(_bountyClosedReceipt.logs.length, 1);
        const log = _bountyClosedReceipt.logs[0];

        assert.strictEqual(log.event, "BountyClosedWithoutWinner");
        assert.strictEqual(log.args.bountyID.toString(10), _bountyIDOne.toString(10));
        assert.strictEqual(log.args.bountyCloser.toString(10), alice);
      });

    });

  });

});