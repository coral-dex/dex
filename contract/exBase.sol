pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import "./exControl.sol";

import {Tool,SafeMath} from "./lib/exLibCommon.sol";

contract ExBase is ExControl {
	
	mapping(string => uint256) decimals;
	
	mapping(string => string[]) payCoinToExchangeCoin;
	
	mapping(bytes32 => bool) public pairExists;
	
	string[] payCoins;
	
	mapping(string => bool) coinExists;
	
	mapping(string => bool) payCoinExists;
	
	mapping(bytes32 => uint256) minExchangeCoinValue;
	
	string[] coins;
	
	mapping(bytes32 => bool) offLine;
	
	
	function setOffLine(string memory exchangeCoin, string memory payCoin, bool status) public onlyCMO {
		
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		
		offLine[key] = status;
	}
	
	function isOffLine(bytes32 key) external view returns (bool) {
		return offLine[key];
	}
	
	function hasOffLine(string memory exchangeCoin, string memory payCoin) public view returns (bool){
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		return offLine[key];
		
	}
	
	function getPayCoins() public view returns (string[] memory){
		return payCoins;
	}
	
	function getCoins() public view returns (string[] memory){
		return coins;
	}
	
	function getExchangeCoinsByPayCoin(string memory payCoin) public view returns (string[] memory){
		return payCoinToExchangeCoin[payCoin];
	}
	
	function getDecimals(string memory coin) public view returns (uint256) {
		require(coinExists[coin], "coin not exists");
		return decimals[coin];
	}
	
	function setMinExchangeCoinValue(string memory exchangeCoin,string memory payCoin ,uint256 min) public onlyCMO {
		bytes32 key =  Tool.genKey(exchangeCoin,payCoin);
		minExchangeCoinValue[key] =  min;
	}
	
	function getMinExchangeCoinValue(string memory exchangeCoin,string memory payCoin) public view  returns(uint256 min) {
		bytes32 key =  Tool.genKey(exchangeCoin,payCoin);
		require(pairExists[key],"coin not exists");
		min = minExchangeCoinValue[key];
		if (min == 0){
			min = 10**(decimals[exchangeCoin]);
		}
	}
	
}