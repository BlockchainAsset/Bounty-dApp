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
const twoInBN = new BN(2);
const waitTimeInContract = new BN(60);
const waitTimeInTest = 120;

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
    await bdAv1Instance.addResolver(resolverOne, {from: owner});
    await bdAv1Instance.addResolver(resolverTwo, {from: owner});
    await bdAv1Instance.addResolver(resolverThree, {from: owner});
  });

  describe("Function: updateResolver", function() {

    describe("Basic Working", function() {

      it('Should update Resolver correctly', async () => {

        let _resolverOneStatusBefore = await bdAv1Instance.resolverStatus(resolverOne);

        await bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner});

        let _resolverOneStatusAfter = await bdAv1Instance.resolverStatus(resolverOne);
  
        assert.strictEqual(_resolverOneStatusBefore.toString(10), oneInBN.toString(10), "Resolver Validity before don't match");
        assert.strictEqual(_resolverOneStatusAfter.toString(10), zeroInBN.toString(10), "Resolver Validity after don't match");
      });

      it('Should update the number of Resolvers correctly', async () => {
        await bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner});

        let _noOfResolvers = await bdAv1Instance.noOfResolvers();
  
        assert.strictEqual(_noOfResolvers.toString(10), twoInBN.toString(10), "No. of Resolver don't match");
      });

      it('Should update the majority correctly', async () => {
        await bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner});

        let _majority = await bdAv1Instance.majority();
  
        assert.strictEqual(_majority.toString(10), twoInBN.toString(10), "Majority don't match");

      });

    });
    describe("Input Cases", function() {

      it('Without Resolver Address', async () => {
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(zeroInBN, {from: owner}),
          null,
          ''
        );
      });    

      it('Without Resolver Status', async () => {
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(resolverOne, {from: owner}),
          null,
          ''
        );
      });    

      it('Without any parameter', async () => {
        await truffleAssert.fails(
          bdAv1Instance.updateResolver({from: owner}),
          null,
          ''
        );
      });    

    });

    describe("Edge Cases", function() {

      it('Should only update Resolver who was already added', async () => {
        await truffleAssert.fails(
          bdAv1Instance.updateResolver(alice, zeroInBN, {from: owner}),
          null,
          'Resolver not previously added by Owner'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: ResolverUpdated", async () => {

        let _resolverUpdaterReceipt = await bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner});

        assert.strictEqual(_resolverUpdaterReceipt.logs.length, 1);
        const log = _resolverUpdaterReceipt.logs[0];
    
        assert.strictEqual(log.event, "ResolverUpdated");
        assert.strictEqual(log.args.resolverUpdater, owner);
        assert.strictEqual(log.args.resolver, resolverOne);
        assert.strictEqual(log.args.status.toString(10), zeroInBN.toString(10));
      });

    });

  });

});