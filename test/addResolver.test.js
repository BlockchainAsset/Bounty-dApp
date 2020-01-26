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
  });

  describe("Function: addResolver", function() {

    describe("Basic Working", function() {

      it('Should add a new Resolver correctly', async () => {
        await bdAv1Instance.addResolver(resolverOne, {from: owner});

        let _resolverOne = await bdAv1Instance.resolvers(zeroInBN);
        let _resolverOneStatus = await bdAv1Instance.resolverStatus(_resolverOne);
  
        assert.strictEqual(_resolverOne, resolverOne, "Resolver Address don't match");
        assert.strictEqual(_resolverOneStatus.toString(10), oneInBN.toString(10), "Resolver Validity don't match");
      });

      it('Should update the number of Resolvers correctly', async () => {
        await bdAv1Instance.addResolver(resolverOne, {from: owner});
        await bdAv1Instance.addResolver(resolverTwo, {from: owner});

        let _noOfResolvers = await bdAv1Instance.noOfResolvers();
  
        assert.strictEqual(_noOfResolvers.toString(10), twoInBN.toString(10), "No. of Resolver don't match");
      });

      it('Should update the majority correctly', async () => {
        await bdAv1Instance.addResolver(resolverOne, {from: owner});

        let _majority = await bdAv1Instance.majority();

        assert.strictEqual(_majority.toString(10), oneInBN.toString(10), "Majority don't match");

        await bdAv1Instance.addResolver(resolverTwo, {from: owner});

        _majority = await bdAv1Instance.majority();

        assert.strictEqual(_majority.toString(10), twoInBN.toString(10), "Majority don't match");

        await bdAv1Instance.addResolver(resolverThree, {from: owner});

        _majority = await bdAv1Instance.majority();
  
        assert.strictEqual(_majority.toString(10), twoInBN.toString(10), "Majority don't match");

      });

    });
    describe("Input Cases", function() {

      it('Without Resolver Address', async () => {
        await truffleAssert.fails(
          bdAv1Instance.addResolver({from: owner}),
          null,
          ''
        );
      });    

    });

    describe("Edge Cases", function() {

      it('Should only add Resolver, if not already added Part 1', async () => {
        await bdAv1Instance.addResolver(resolverOne, {from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addResolver(resolverOne, {from: owner}),
          null,
          'Already a Valid Resolver'
        );
      });

      it('Should only add Resolver, if not already added Part 2', async () => {
        await bdAv1Instance.addResolver(resolverOne, {from: owner});
        await bdAv1Instance.updateResolver(resolverOne, zeroInBN, {from: owner});
        await truffleAssert.fails(
          bdAv1Instance.addResolver(resolverOne, {from: owner}),
          null,
          'Resolver previously added by Owner, use updateResolver()'
        );
      });

    });

    describe("Event Cases", function() {

      it("Should correctly emit the proper event: ResolverAdded", async () => {

        let _resolverAddedReceipt = await bdAv1Instance.addResolver(resolverOne, {from: owner});

        assert.strictEqual(_resolverAddedReceipt.logs.length, 1);
        const log = _resolverAddedReceipt.logs[0];
    
        assert.strictEqual(log.event, "ResolverAdded");
        assert.strictEqual(log.args.resolverCreator, owner);
        assert.strictEqual(log.args.resolver, resolverOne);
      });

    });

  });

});