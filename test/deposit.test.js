const { BN, toWei } = web3.utils;

// bdAv1 = Bounty dApp v1
const bdAv1 = artifacts.require("bountydAppv1");

const truffleAssert = require('truffle-assertions');

const amount = new BN(toWei("0.001")); // <-- Change the amount value here for testing
const deadline = new BN(0); // <-- Change the deadline value here for testing
const description = "Please do X for Y Ethers";  // <-- Change the description here for testing
const solution = "X is done";  // <-- Change the solution here for testing
const oneEtherInWei = new BN(toWei("1"));
const zeroInBN = new BN(0);
const oneInBN = new BN(1);
const waitTimeInContract = new BN(60);
const waitTimeInTest = 120;

contract('bountydAppv1', (accounts) => {

  let bdAv1Instance;
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
  });

  describe("Function: deposit", function() {

    describe("Basic Working", function() {

      it('Should update the balance correctly during bounty creation', async () => {
        let beforeFunctionCallValue = new BN(await bdAv1Instance.balances(alice));
        await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
        let afterFunctionCallValue = new BN(await bdAv1Instance.balances(alice));

        assert.strictEqual(beforeFunctionCallValue.toString(10), afterFunctionCallValue.toString(10), "Bounty ID don't match");
      });

      it('Should add the balance correctly during bounty creation', async () => {
        await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount.add(amount)});
        let afterFunctionCallValue = new BN(await bdAv1Instance.balances(alice));

        assert.strictEqual(amount.toString(10), afterFunctionCallValue.toString(10), "Bounty ID don't match");
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: Deposit", async () => {

        let _bountyIDReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});

        assert.strictEqual(_bountyIDReceipt.logs.length, 2);
        const log = _bountyIDReceipt.logs[0];
    
        assert.strictEqual(log.event, "Deposit");
        assert.strictEqual(log.args.from, alice);
        assert.strictEqual(log.args.value.toString(10), amount.toString(10));
      });

    });

  });

});