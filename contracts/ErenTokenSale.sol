// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
import "./ErenToken.sol";

contract ErenTokenSale {
    address admin;

    ErenToken public tokenContract;

    uint256 public tokenPrice;
    uint256 public tokenSold;

    event SellToken(address indexed _buyer, uint256 _amount);

    constructor(ErenToken _tokenContract, uint256 _tokenPrice) {
        //ErenToken _tokenContract = new ErenToken(1000000);
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x); //safe math module / multiply *
    }

    function buyTokens(uint256 _numberOfTokens)
        public
        payable
        returns (bool succes)
    {
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "Eren Token Sale 33"
        );
        require(
            msg.value == multiply(_numberOfTokens, tokenPrice),
            "msg.value must be equal to total token price"
        );
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokenSold += _numberOfTokens;
        emit SellToken(msg.sender, _numberOfTokens);
        return true;
    }

    function endSale() public {
        require(msg.sender == admin);
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        selfdestruct(payable(admin));
    }
}
