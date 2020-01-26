var BountydAppv1 = artifacts.require("bountydAppv1");
var initialState = process.env.INITIAL_STATE;

module.exports = function(deployer, network, accounts) {

  deployer.deploy(BountydAppv1, initialState);

};
