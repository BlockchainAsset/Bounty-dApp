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
const twoInBN = new BN(2);
const waitTimeInContract = new BN(process.env.WAIT_TIME_IN_CONTRACT);
const waitTimeInTest = process.env.WAIT_TIME_IN_TEST;

function wait(seconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds*1000));
}

contract('bountydAppv1', (accounts) => {

  let bdAv1Instance;
  let _bountyIDReceipt, _bountyID;
  let _solutionIDReceiptOne, _solutionIDOne;
  let owner, alice, bob, carol, resolverOne, resolverTwo, resolverThree;

  before("Preparing Accounts and Initial Checks", async function() {
    assert.isAtLeast(accounts.length, 7, "Atleast three accounts required");

    // Setup 4 accounts.
    [owner, alice, bob, carol, resolverOne, resolverTwo, resolverThree] = accounts;

    //Checking if all accounts have atleast 2 ETH or more for test
    assert.isTrue((new BN(await web3.eth.getBalance(owner))).gt(oneEtherInWei), "Owner Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(alice))).gt(oneEtherInWei), "Alice Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(bob))).gt(oneEtherInWei), "Bob Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(carol))).gt(oneEtherInWei), "Carol Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverOne))).gt(oneEtherInWei), "Resolver One Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverTwo))).gt(oneEtherInWei), "Resolver Two Account has less than 1 ETH");
    assert.isTrue((new BN(await web3.eth.getBalance(resolverThree))).gt(oneEtherInWei), "Resolver Three Account has less than 1 ETH");

  });

  beforeEach("Creating New Instance", async function() {
    bdAv1Instance = await bdAv1.new([resolverOne, resolverTwo, resolverThree], { from: owner});
    _bountyIDReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyID = _bountyIDReceipt.receipt.logs[1].args.bountyID;
    _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyID, zeroInBN, solution, {from: bob});
    _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
});

  describe("Function: rejectSolution", function() {

    describe("Basic Working", function() {

      it('Should reject a solution for a bounty correctly', async () => {
        let beforeFunctionCallValue = new BN(await bdAv1Instance.balances(bob));
        await bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice});
        let afterFunctionCallValue = new BN(await bdAv1Instance.balances(bob));

        let _solutionDetails = await bdAv1Instance.solutions(_solutionIDOne);
        let _acceptanceStatus = _solutionDetails.acceptanceStatus;
        let _comment = _solutionDetails.comment;
 
        assert.strictEqual(_acceptanceStatus.toString(10), twoInBN.toString(10), "Acceptance Status don't match");
        assert.strictEqual(beforeFunctionCallValue.toString(10), afterFunctionCallValue.toString(10), "Balance not match");
        assert.strictEqual(_comment, comment, "Comment don't match");
      });

    });

    describe("Input Cases", function() {
    
      it('Without solution ID', async () => {
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(comment, {from: alice}),
          null,
          ''
        );
      });

      it('Without comment', async () => {
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, {from: alice}),
          null,
          ''
        );
      });

      it('Without any parameters', async () => {
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution({from: alice}),
          null,
          ''
        );
      });

    });

    describe("Edge Cases", function() {

      it('Solution can be rejected by the Creator only', async () => {
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: carol}),
          null,
          'Only bounty creator can reject a solution'
        );
      });

      it('Should only reject solution once', async () => {
        await bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice});
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice}),
          null,
          'Only pending solutions can be rejected.'
        );
      });

      it('Should only reject solution if the solution is in Pending State', async () => {
        await bdAv1Instance.acceptSolution(_solutionIDOne, {from: alice});
        await truffleAssert.fails(
          bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice}),
          null,
          'Only pending solutions can be rejected.'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: BountyClosedWithWinner", async () => {

        let _solutionRejectReceipt = await bdAv1Instance.rejectSolution(_solutionIDOne, comment, {from: alice});

        assert.strictEqual(_solutionRejectReceipt.logs.length, 1);
        const log = _solutionRejectReceipt.logs[0];
    
        assert.strictEqual(log.event, "SolutionRejected");
        assert.strictEqual(log.args.bountyID.toString(10), _bountyID.toString(10));
        assert.strictEqual(log.args.solutionID.toString(10), _solutionIDOne.toString(10));
      });

    });

  });

});