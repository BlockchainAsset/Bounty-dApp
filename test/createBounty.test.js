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

  describe("Function: createBounty", function() {

    describe("Basic Working", function() {

      it('Should create a new bounty correctly', async () => {
        let _bountyIDReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});
        let _bountyID = _bountyIDReceipt.receipt.logs[1].args.bountyID;
        let _bountyDetails = await bdAv1Instance.bounties(_bountyID);
        let _amount = _bountyDetails.amount;
        let _deadline = _bountyDetails.deadline;
        let _description = _bountyDetails.description;
 
        assert.strictEqual(_bountyID.toString(10), oneInBN.toString(10), "Bounty ID don't match");
        assert.strictEqual(_amount.toString(10), amount.toString(10), "Amount don't match");
        assert.strictEqual(_deadline.toString(10), deadline.toString(10), "Deadline don't match");
        assert.strictEqual(_description, description, "Description don't match");
      });

    });

    describe("Input Cases", function() {

      describe("Should not work if all three inputs are not given", function() {

        it('Without amount', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(deadline, description, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without deadline', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(amount, description, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without desciption', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(amount, deadline, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without amount & deadline', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(description, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without amount & description', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(deadline, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without deadline & description', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty(amount, {from: alice, value: amount}),
            null,
            ''
          );
        });
  
        it('Without any parameters', async () => {
          await truffleAssert.fails(
            bdAv1Instance.createBounty({from: alice, value: amount}),
            null,
            ''
          );
        });
  
      });

    });

    describe("Edge Cases", function() {

      it('Should not create bounty of amount, if user balance < amount', async () => {
        await truffleAssert.fails(
          bdAv1Instance.createBounty(amount, deadline, description, {from: alice}),
          null,
          'Not enough balance to create Bounty'
        );
      });

      it('Should not create bounty where deadline is already passed', async () => {
        await truffleAssert.fails(
          bdAv1Instance.createBounty(amount, oneInBN, description, {from: alice, value: amount}),
          null,
          'Deadline specified is already passed'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: BountyCreated", async () => {

        let _bountyIDReceipt = await bdAv1Instance.createBounty(amount, deadline, description, {from: alice, value: amount});

        assert.strictEqual(_bountyIDReceipt.logs.length, 2);
        const log = _bountyIDReceipt.logs[1];
    
        assert.strictEqual(log.event, "BountyCreated");
        assert.strictEqual(log.args.bountyID.toString(10), oneInBN.toString(10));
        assert.strictEqual(log.args.bountyCreator, alice);
        assert.strictEqual(log.args.value.toString(10), amount.toString(10));
      });

    });

  });

});