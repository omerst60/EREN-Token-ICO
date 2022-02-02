var ErenToken = artifacts.require("./ErenToken.sol");
var ErenTokenSale = artifacts.require("./ErenTokenSale.sol");

module.exports = function (deployer) {
    deployer.deploy(ErenToken, 1000000).then(function (i) {
        tokenInstance = i;
        //token price is 0,001 ether
        var tokenPrice = 1000000000000000;
        return deployer.deploy(ErenTokenSale, tokenInstance.address, tokenPrice);
    });
};