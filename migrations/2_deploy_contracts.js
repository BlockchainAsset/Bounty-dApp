var BountydAppv1 = artifacts.require("bountydAppv1");
var resolverOne = process.env.RESOLVER_ONE;
var resolverTwo = process.env.RESOLVER_TWO;
var resolverThree = process.env.RESOLVER_THREE;
var initialState = process.env.INITIAL_STATE;

module.exports = function(deployer, network, accounts) {

  deployer.deploy(BountydAppv1, resolverOne, resolverTwo, resolverThree, initialState);

};
