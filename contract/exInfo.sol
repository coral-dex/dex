pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import {Types, ExLibPair, ExLibUser, ExLibMap} from "./lib/exLibPair.sol";

import "./exBase.sol";

contract ExInfo is ExBase {
	
	ExLibUser.ExUser exUser;
	
	mapping(bytes32 => ExLibPair.Pair)  pairs;
	
	using ExLibUser for *;
	
	using ExLibPair for *;
	
	using Tool for *;
	
	using ExLibMap for *;
	
	
	
	function addPair(
		string memory exchangeCoin,
		uint256 exchangeCoinDecimals,
		string memory payCoin,
		uint256 payCoinDecimals,
		uint256 startPrice) public onlyCMO returns (bytes32 key) {
		
		key = Tool.genKey(exchangeCoin, payCoin);
		
		require(!pairExists[key], "has exists");
		
		pairExists[key] = true;
		
		payCoinToExchangeCoin[payCoin].push(exchangeCoin);
		
		if (!coinExists[payCoin]){
			coinExists[payCoin] = true;
			decimals[payCoin] = payCoinDecimals;
			coins.push(payCoin);
		}
		
		if (!coinExists[exchangeCoin]){
			coinExists[exchangeCoin] = true;
			decimals[exchangeCoin] = exchangeCoinDecimals;
			coins.push(exchangeCoin);
		}
		
		if (!payCoinExists[payCoin]){
			payCoinExists[payCoin] = true;
			payCoins.push(payCoin);
		}
		
		pairs[key].initPair(exchangeCoin, payCoin, Tool.genBytes32(exchangeCoin), Tool.genBytes32(payCoin), startPrice);
		
	}
	
	function setCoinFeeRate(string memory exchangeCoin,string  memory payCoin,address user, string memory coin, uint256 rate) public onlyCMO {
		
		require(rate < 2000, "too big");
		bytes32 key = exchangeCoin.genKey(payCoin);
		pairs[key].setFeeRate(user,coin,rate);
		
	}
	
	function setDefaultFeeRate(string memory exchangeCoin,string memory payCoin,uint256 rate) public onlyCMO {
		require(rate < 2000, "too big");
		bytes32 key = exchangeCoin.genKey(payCoin);
		pairs[key].setDefaultFeeRate(rate);
	}
	
	function pairInfo(string memory exchangeCoin, string memory payCoin) public view returns (Types.PairInfo memory info) {
		bytes32 key = exchangeCoin.genKey(payCoin);
		info = pairs[key].info();
		info.minExchangeCoinValue = getMinExchangeCoinValue(exchangeCoin,payCoin);
	}
	
	
	function getBills(string memory coin, uint256 offset, uint256 limit) public view returns (Types.Bill[] memory bills, uint256 count) {
		return exUser.getBills( msg.sender, coin, offset, limit);
	}
	
	
	function orders(string calldata exchangeCoin, string calldata payCoin, uint256[] memory orderIds) external view returns (Types.Order[] memory){
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		
		return pairs[key].ordersByIds(orderIds);
	}
	
	
	function pairVolumeOf24H(string calldata exchangeCoin, string calldata payCoin) external view returns (uint256 firstPrice, uint256 lastPrice, uint256 volumeTotal, uint256 totolMoney){
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		
		return pairs[key].currentVolumeOf24H();
	}
	
	function pageOrders(string calldata exchangeCoin, string calldata payCoin, uint256 offset, uint256 limit) external view returns (Types.ShortOrder[] memory myPageOrders, uint256 count){
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		(uint256[] memory orderIds,uint256 total) = exUser.pageOrderIds( msg.sender, key, offset, limit);
		count = total;
		myPageOrders = pairs[key].shortOrdersByIds(orderIds);
	}
	
	function pendingOrders(string calldata exchangeCoin, string calldata payCoin) external view returns (Types.ShortOrder[] memory upackedOrders){
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		upackedOrders = pairs[key].shortOrdersByIds(exUser.pendingOrderIds( msg.sender, key));
	}
	
	
	function tokenList(string calldata payCoin) external view returns (Types.PairVolumeInfo[] memory) {
		string[] memory exchangeCoins = payCoinToExchangeCoin[payCoin];
		Types.PairVolumeInfo[] memory pairInfos = new Types.PairVolumeInfo[](exchangeCoins.length);
		for (uint256 i = 0; i < exchangeCoins.length; i++) {
			bytes32 key = Tool.genKey(exchangeCoins[i], payCoin);
			(uint256 startPrice,uint256 lastPrice, uint256 volumeTotal,uint256 totalMoney) = pairs[key].currentVolumeOf24H();
			uint256 decimal = getDecimals(exchangeCoins[i]);
			Types.PairVolumeInfo memory info = Types.PairVolumeInfo(
				exchangeCoins[i],
				payCoin,
				decimal,
				startPrice,
				lastPrice,
				volumeTotal,
				offLine[key],
				totalMoney);
			pairInfos[i] = info;
		}
		return pairInfos;
	}
	
	function allReceiverInfo() external view returns (ExLibMap.entryBytes32Object[] memory result) {
		uint256 size = exUser.receiverBalance.size();
		result = new ExLibMap.entryBytes32Object[](size);
		for(uint256 i=0;i<size;i++){
			result[i]= exUser.receiverBalance.getItemByIndex(i);
		}
	}
	
	function removeReceiver(uint256 idx) external  onlyOwner {
		bytes32 key = exUser.receiverBalance.getKeyByIndex(idx);
		ExLibMap.entryBytes32Object memory item = exUser.receiverBalance.getItemByIndex(idx);
		exUser.add(item.currency.genBytes32(),item.value);
		exUser.receiverBalance.remove(key);
	}
	
	function setIncRate(string memory exchangeCoin,string memory payCoin ,uint256 incRate) external onlyOwner{
		require(incRate >100,"invalid incRate");
		bytes32 key = exchangeCoin.genKey(payCoin);
		pairs[key].setIncRate(incRate);
	}
	
	
	function detailsOf24H(string memory exchangeCoin,string memory payCoin) external view returns(Types.Hour[] memory){
		bytes32 key = exchangeCoin.genKey(payCoin);
		return pairs[key].detailsOf24H();
	}
	
}