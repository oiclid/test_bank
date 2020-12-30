const ether = 10**18; // 1 ether = 1000000000000000000 wei

var TestBank = artifacts.require("TestBank");

module.exports = function(deployer) {
  deployer.deploy(TestBank, { value: 25 * ether });
};