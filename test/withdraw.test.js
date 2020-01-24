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
const withdrawAmount = new BN(toWei("0.0001")); // <-- Change the withdraw amount value here for testing

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
    bdAv1Instance = await bdAv1.new([resolverOne, resolverTwo, resolverThree], { from: owner});
    let _bountyIDOneReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyIDOne = _bountyIDOneReceipt.receipt.logs[1].args.bountyID;
    let _bountyIDTwoReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
    _bountyIDTwo = _bountyIDTwoReceipt.receipt.logs[1].args.bountyID;
    let _solutionIDReceiptOne = await bdAv1Instance.addSolution(_bountyIDTwo, zeroInBN, solution, {from: bob});
    _solutionIDOne = _solutionIDReceiptOne.receipt.logs[0].args.solutionID;
    await bdAv1Instance.acceptSolution(_solutionIDOne, {from: alice});
    await bdAv1Instance.closeBounty(_bountyIDOne, {from: alice});
  });

  describe("Function: closeBounty", function() {

    describe("Function: withdraw", function() {

      it('Should withdraw a winning amount correctly', async () => {

        // Get initial balance of the account before the transaction is made.
        const startingBalanceOfBob = new BN(await web3.eth.getBalance(bob));
    
        // Withdraw Amount
        const txReceiptOfWithdraw = await bdAv1Instance.withdraw(withdrawAmount, {from: bob});
        const gasUsedInWithdraw = new BN(txReceiptOfWithdraw.receipt.gasUsed);
        const gasPriceInWithdraw = new BN((await web3.eth.getTransaction(txReceiptOfWithdraw.tx)).gasPrice);

        // Get balance after the transactions.
        const endingBalanceOfBob = new BN(await web3.eth.getBalance(bob));
    
        const bobStartAmountGas = startingBalanceOfBob.add(withdrawAmount).sub(gasUsedInWithdraw.mul(gasPriceInWithdraw));
    
        // Check if the result is correct or not
        assert.strictEqual(endingBalanceOfBob.toString(10),bobStartAmountGas.toString(10), "Amount wasn't correctly received by Bob");
      });

      it('Should withdraw a closed bounty amount correctly', async () => {

        // Get initial balance of the account before the transaction is made.
        const startingBalanceOfAlice = new BN(await web3.eth.getBalance(alice));
    
        // Withdraw Amount
        const txReceiptOfWithdraw = await bdAv1Instance.withdraw(withdrawAmount, {from: alice});
        const gasUsedInWithdraw = new BN(txReceiptOfWithdraw.receipt.gasUsed);
        const gasPriceInWithdraw = new BN((await web3.eth.getTransaction(txReceiptOfWithdraw.tx)).gasPrice);

        // Get balance after the transactions.
        const endingBalanceOfAlice = new BN(await web3.eth.getBalance(alice));
    
        const aliceStartAmountGas = startingBalanceOfAlice.add(withdrawAmount).sub(gasUsedInWithdraw.mul(gasPriceInWithdraw));

        // Check if the result is correct or not
        assert.strictEqual(endingBalanceOfAlice.toString(10),aliceStartAmountGas.toString(10), "Amount wasn't correctly received by Alice");
      });

    });

    describe("Input Cases", function() {

      it('Should only work if amount is given', async () => {
        await truffleAssert.fails(
          bdAv1Instance.withdraw({from: alice}),
          null,
          'invalid number value'
        );
      })

    });

    describe("Edge Cases", function() {

      it('Should only work if amount > 0', async () => {
        await truffleAssert.fails(
          bdAv1Instance.withdraw(zeroInBN, {from: alice}),
          null,
          'Zero cant be withdrawn'
        );
      })
    
      it('Should only work if balance > amount', async () => {
        await truffleAssert.fails(
          bdAv1Instance.withdraw(withdrawAmount, {from: carol}),
          null,
          'SafeMath: subtraction overflow.'
        );
      })
  
    });

    describe("Event Cases", function() {
  
      it("Should correctly emit the proper event: Withdrawed", async () => {
        const withdrawReceipt = await bdAv1Instance.withdraw(withdrawAmount, {from: alice});

        assert.strictEqual(withdrawReceipt.logs.length, 1);
        const log = withdrawReceipt.logs[0];
    
        assert.strictEqual(log.event, "Withdrawed");
        assert.strictEqual(log.args.to, alice);
        assert.strictEqual(log.args.value.toString(10), withdrawAmount.toString(10));
      });
  
    });

  });

});
