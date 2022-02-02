App = {
    contracts: {},
    web3Provider: null,
    account: "0x0",
    loading: false,
    tokenPrice: 1000000000000000,
    tokenSold: 0,
    tokensAvaible: 750000,
    init: function () {
        console.log("app initialize...");
        return App.initWeb3();
    },
    initWeb3: function () {
        const Web3 = require("web3");
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');

        return App.render();
    },

    render: async function () {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();
        //load account data.
        const Useraccount = await ethereum.request({ method: 'eth_accounts' });
        if (Useraccount[0] != null) {
            App.account = Useraccount[0];
            $("#accountAddress").html("Your Account: " + App.account);
        }
        else {
            $("#accountAddress").html("Can Not Access To Your Account. Be Sure You Connected Your MetaMask Wallet.");
        }

        App.loading = false;
        loader.hide();
        content.show();
        return App.initContracts();

    },

    initContracts: function () {
        $.getJSON("ErenTokenSale.json", function (erenTokenSale) {
            App.contracts.ErenTokenSale = TruffleContract(erenTokenSale);
            App.contracts.ErenTokenSale.setProvider(App.web3Provider);
            App.contracts.ErenTokenSale.deployed().then(function (erenTokenSale) {
                tokenSaleInstance = erenTokenSale;
                console.log("Eren Token Sale Address: ", erenTokenSale.address);
                return tokenSaleInstance.tokenPrice();
            }).then(function (price) {
                App.tokenPrice = price.toNumber();
                $(".token-price").html(App.tokenPrice / 10 ** 18);
                return tokenSaleInstance.tokenSold();
            }).then(function (price) {
                App.tokenSold = price.toNumber();//price.toNumber();
                $(".tokens-sold").html(App.tokenSold);
                $(".tokens-avaible").html(App.tokensAvaible);

                var progressPercent = (App.tokenSold / App.tokensAvaible) * 100;
                $("#progress").css("width", progressPercent + "%");
            });
        }).done(function () {
            $.getJSON("ErenToken.json", function (erenToken) {
                App.contracts.ErenToken = TruffleContract(erenToken);
                App.contracts.ErenToken.setProvider(App.web3Provider);
                App.contracts.ErenToken.deployed().then(function (erenToken) {
                    tokenInstance = erenToken;
                    console.log("Eren Token Address: ", erenToken.address);
                    return tokenInstance.balanceOf(App.account);
                }).then(function (balance) {
                    $(".eren-balance").html(balance.toNumber());
                    console.log(tokenInstance.balanceOf(tokenSaleInstance.address));

                })
            })
        })
    },//..

    buyTokens: function () {
        $("#content").hide();
        $("#loader").show();

        var numberOfTokens = $("#numberOfToken").val();

        App.contracts.ErenTokenSale.deployed().then(function (instance) {
            return instance.buyTokens(numberOfTokens, { from: App.account, value: numberOfTokens * App.tokenPrice, gas: 500000 });
        }).then(function (result) {
            App.render();
            console.log("tokens bought");
            $("form").trigger("reset"); // reset number of tokens in form.
        })
    }

}

$(function () {
    $(window).load(function () {
        App.init();
    })
});