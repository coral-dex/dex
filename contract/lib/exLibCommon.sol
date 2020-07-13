pragma solidity ^0.6.6;

library Tool {
	
	using SafeMath for *;
	
	function min(uint256 a, uint256 b) internal pure returns (uint256) {
		if (a < b) {
			return a;
		}
		return b;
	}
	
	function getDay(uint256 time, uint256 n) internal pure returns (uint256, uint256) {
		uint256 index = time % (n*86400)/86400;
		return (index%n,time-time%86400);
	}
	
	function calPayCoin(uint256 exchangeCoinValue,uint256 price,uint256 exchangeCoinDecimals) internal pure returns(uint256 ){
		return exchangeCoinValue.mul(price).div((10**exchangeCoinDecimals));
	}
	
	function calPrice(uint256 payCoinValue,uint256 buyCoinValue,uint256 exchangeCoinDecimals) internal pure returns(uint256 ){
		return payCoinValue.mul((10**exchangeCoinDecimals)).div(buyCoinValue);
	}
	
	function calExchangeCoin(uint256 payCoinValue,uint256 price,uint256 exchangeCoinDecimals) internal pure returns(uint256){
		return payCoinValue.mul((10**exchangeCoinDecimals)).div(price);
	}
	
	
	function equals(string memory a, string memory b) internal pure returns (bool) {
		if (bytes(a).length != bytes(b).length) {
			return false;
		}
		for (uint i = 0; i < bytes(a).length; i ++) {
			if(bytes(a)[i] != bytes(b)[i]) {
				return false;
			}
		}
		return true;
	}
	
	function genBytes32(string memory key) internal pure returns(bytes32 result){
		
		return keccak256(abi.encode(key));
	}
	
	function genKey(string memory exchangeCoin,string memory payCoin) internal pure returns(bytes32){
		return keccak256(abi.encodePacked(exchangeCoin,payCoin));
	}
	
	
	function isContract(address account) internal view returns (bool) {
		uint256 size;
		assembly { size := extcodesize(account) }
		return size > 0;
	}
	
}



library SafeMath {
	
	function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		if (a == 0) {
			return 0;
		}
		
		uint256 c = a * b;
		require(c / a == b,"invalid mul");
		
		return c;
	}
	
	function div(uint256 a, uint256 b) internal pure returns (uint256) {
		require(b > 0,"invalid div");
		uint256 c = a / b;
		
		return c;
	}
	
	function sub(uint256 a, uint256 b,string memory errInfo) internal pure returns (uint256) {
		require(b <= a,errInfo);
		uint256 c = a - b;
		
		return c;
	}
	
	function add(uint256 a, uint256 b) internal pure returns (uint256) {
		uint256 c = a + b;
		require(c >= a,"invalid add");
		
		return c;
	}
}



