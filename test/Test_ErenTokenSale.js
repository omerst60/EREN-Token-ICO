var ErenTokenSale = artifacts.require("./ErenTokenSale.sol");
var ErenToken = artifacts.require("./ErenToken.sol");

contract(ErenTokenSale, function (accounts) {
    var token;
    var tokenPrice = 1000000000000000;
    var tokensAvaible = 750000;  //75 percent of 1,000,000
    var buyer = accounts[9];
    var numberOfTokens = 20;
    var admnin = accounts[0];
    it("initiliazes the contract with correct values", function () {
        return ErenTokenSale.deployed().then(function (i) {
            token = i;
            return token.tokenContract();
        }).then(function (address) {
            assert.notEqual(address, 0x0, address);
        });
    })

    it("facilitates  token buying", function () {
        var token;
        var tokenSale;
        return ErenToken.deployed().then(function (i) {
            token = i;
            return ErenTokenSale.deployed();
        }).then(function name(tokenS) {
            tokenSale = tokenS;
            return token.transfer(tokenSale.address, tokensAvaible, { from: admnin });
        }).then(function (recipt) {
            return token.balanceOf(tokenSale.address);
        }).then(function (balance) {
            assert.equal(balance, 750000, balance)
            return tokenSale.buyTokens(numberOfTokens, { from: buyer, value: tokenPrice * numberOfTokens });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigers on event');
            assert.equal(receipt.logs[0].event, "SellToken", "that should be tranfer event");
            assert.equal(receipt.logs[0].args._buyer, buyer, "that should be account 7");
            assert.equal(receipt.logs[0].args._amount, 20, "that shoul be 250,000");
            return tokenSale.tokenSold();
        }).then(function (soldTokens) {
            assert.equal(soldTokens, 20, token.balanceOf(tokenSale.address));
            return token.balanceOf(buyer);
        }).then(function (balance) {
            assert.equal(balance, 20, token.balanceOf(buyer));
            return token.balanceOf(tokenSale.address);
        }).then(function (balance) {
            assert.equal(balance, tokensAvaible - 20, balance);
            return tokenSale.buyTokens(numberOfTokens, { from: buyer, value: tokenPrice * numberOfTokens });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigers on event');
            assert.equal(receipt.logs[0].event, "SellToken", "that should be tranfer event");
            assert.equal(receipt.logs[0].args._buyer, buyer, "that should be account 7");
            assert.equal(receipt.logs[0].args._amount, 20, "that shoul be 250,000");
            return tokenSale.tokenSold();
        }).then(function (sold) {
            assert.equal(sold, 40, sold);
            return token.balanceOf(tokenSale.address);
        }).then(function (balance) {
            assert.equal(balance, tokensAvaible - 40, balance);
            return token.balanceOf(buyer);
        }).then(function (balance) {
            assert.equal(balance, 40, token.balanceOf(buyer));
            return tokenSale.buyTokens(80, { from: buyer, value: 800 * tokenPrice }); //will revert cause value not equal to amount
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, error.message);
        });
    })

    it("end  token sale", function () {
        var token;
        var tokenSale;
        return ErenToken.deployed().then(function (i) {
            token = i;
            return ErenTokenSale.deployed();
        }).then(function (instance) {
            tokenSale = instance;
            //try to end token sale by not admin
            return tokenSale.endSale({ from: accounts[1] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, error.message);
            //end sale an admin
            return tokenSale.endSale({ from: admnin });
        }).then(function (receipt) {
            return token.balanceOf(tokenSale.address);
        }).then(function (balance) {
            assert.equal(balance, 0, balance);
            return token.balanceOf(admnin);
        }).then(function (balance) {
            assert.equal(balance, 999960, balance);
        });
    })
})