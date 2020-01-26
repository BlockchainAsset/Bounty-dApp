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
const zeroAdd = "0x0000000000000000000000000000000000000000";

contract('bountydAppv1', (accounts) => {

  let bdAv1Instance;
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
  });

  describe("Contract: Owned", function() {

    describe("Basic Working", function() {

      it('Only admin should be able to call addResolver', async () => {
        await truffleAssert.fails(
          bdAv1Instance.addResolver(resolverOne, {from: alice}),
          null,
          'Only owner can use this function'
        );
      });

      it('Only admin should be able to call updateResolver', async () => {
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: alice}),
          null,
          'Only owner can use this function'
        );
      });

      it('Should update the owner correctly', async () => {
        await bdAv1Instance.setOwner(resolverOne, {from: owner});

        let _resolverOne = await bdAv1Instance.getOwner();
  
        assert.strictEqual(_resolverOne, resolverOne, "New Owner was not set correctly");
      });

    });

    describe("Input Cases", function() {
      
      it('Without new Owner', async () => {
        await truffleAssert.fails(
          bdAv1Instance.setOwner({from: owner}),
          null,
          ''
        );
      });

      it('New Owner as zero address', async () => {
        await truffleAssert.fails(
          bdAv1Instance.setOwner(zeroAdd, {from: owner}),
          null,
          ''
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: LogOwnerChanged", async () => {

        let _setOwnerReceipt = await bdAv1Instance.setOwner(resolverOne, {from: owner});

        assert.strictEqual(_setOwnerReceipt.logs.length, 1);
        const log = _setOwnerReceipt.logs[0];
    
        assert.strictEqual(log.event, "LogOwnerChanged");
        assert.strictEqual(log.args.newOwner, resolverOne);
        assert.strictEqual(log.args.oldOwner, owner);
      });

    });

  });

});