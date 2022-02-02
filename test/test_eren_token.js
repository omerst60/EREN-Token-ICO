var ErenToken = artifacts.require("./ErenToken.sol");

contract("ErenToken", function (accounts) {
    var tokenInstance;
    it("initialize the contract with correct values", function () {
        return ErenToken.deployed().then(function (i) {
            token = i;
            return token.name();
        }).then(function (checkName) {
            assert.equal(checkName, 'EREN', "the name is correct");
            return token.symbol();
        }).then(function (checkSymbol) {
            assert.equal(checkSymbol, "ERN", 'Symbol is correct');
            return token.standart();
        }).then(function (checkStandart) {
            assert.equal(checkStandart, "EREN v1.0", "standart is correct");
        })
    })

    it("allocates the initial supply", function () {
        return ErenToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "sets the total supply to 100,000");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, "yes man that's 1,000,000")
        })
    })

    it("transfers tokens ownership", function () {
        return ErenToken.deployed().then(function (instance) {
            token = instance
            return token.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigers on event');
            assert.equal(receipt.logs[0].event, "Transfer", "that should be tranfer event");
            assert.equal(receipt.logs[0].args._from, accounts[0], "that should be account 0");
            assert.equal(receipt.logs[0].args._to, accounts[1], "that should be account 1");
            assert.equal(receipt.logs[0].args._amount, 250000, "that shoul be 250,000");
            return token.balanceOf(accounts[1]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 250000, "yes passed");
            return token.balanceOf(accounts[0])
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 750000, "this passed to");
            return token.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function (succes) {
            assert.equal(succes, true, "this should be true");
        });
    })

    it("approves tokens for delegated transform", function () {
        return ErenToken.deployed().then(function (instance) {
            token = instance;
            return token.approved.call(accounts[0], 1000);
        }).then(function (succes) {
            assert.equal(succes, true, "this should be true");
            return token.approved(accounts[1], 1000);
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigers on event');
            assert.equal(receipt.logs[0].event, "Approval", "that should be tranfer event");
            assert.equal(receipt.logs[0].args._spender, accounts[1], "that should be account 1");
            assert.equal(receipt.logs[0].args._owner, accounts[0], "that should be account 0");
            assert.equal(receipt.logs[0].args._amount, 1000, "that shoul be 1,000");
            return token.allowance(accounts[0], accounts[1]);
        }).then(function (mapping) {
            assert.equal(mapping.toNumber(), 1000, "token amount which was sended.");
        });
    })

    it("handles delegate the tranfers", function () {
        return ErenToken.deployed().then(function (token) {
            instance = token;
            return instance.transfer(accounts[2], 150, { from: accounts[0] });
        }).then(function (receipt) {
            return instance.approved(accounts[4], 10, { from: accounts[2] });
        }).then(function (receipt) {
            return instance.transferFrom(accounts[2], accounts[3], 999, { from: accounts[4] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "catching error failure");
            return instance.transferFrom(accounts[2], accounts[3], 11, { from: accounts[4] })
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "cannot transfer value larger than approve amount");
            return instance.transferFrom.call(accounts[2], accounts[7], 5, { from: accounts[4] });
        }).then(function (succes) {
            assert.equal(succes, true, "succes equal to false");
        }).then(function (receipt) {
            return instance.approved(accounts[6], 1000, { from: accounts[1] });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigers on event');
            assert.equal(receipt.logs[0].event, "Approval", "that should be tranfer event");
            assert.equal(receipt.logs[0].args._spender, accounts[6], "that should be account 1");
            assert.equal(receipt.logs[0].args._amount, 1000, "that shoul be 1,000");
            return instance.transferFrom(accounts[1], accounts[7], 100, { from: accounts[6] });
        }).then(function (receipt) {
            return instance.balanceOf(accounts[1]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 249900, balance.toNumber());
            return instance.balanceOf(accounts[7]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 100, balance.toNumber());
            return instance.allowance(accounts[1], accounts[6]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 900, allowance.toNumber());
        });

    })
})