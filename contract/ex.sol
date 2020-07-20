pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import "./seroInterface.sol";

import "./exInfo.sol";


interface IAgent {
	function Agent(bytes calldata opData) external payable returns (bool);
}


contract Ex is ExInfo, SeroInterface {
	
	using SafeMath for *;
	
	
	mapping(string=>uint256) minSendValue;
	
	bool openSendReceiver = true;
	
	string public verison= "v1.0.1";
	
	bool public paused = false;
	
	constructor() public {
		exUser.owner = msg.sender;
	}
	
	function setPuase(bool status) external onlyOwner {
		paused = status;
	}
	
	function setOpenSendReceiverStatus( bool status) external onlyOwner {
		openSendReceiver = status;
	}
	
	function getMinSendValue(string memory coin)public view returns(uint256 min) {
		min = minSendValue[coin];
		if (min == 0){
			uint256 decimal = getDecimals(coin);
			min =  10 * (10 ** decimal);
		}
	}
	
	function setMinSendValue(string memory coin ,uint256 min) public onlyOwner {
		minSendValue[coin] = min;
	}
	
	function balanceOf(string memory coin) public view returns (Types.BlanceOfCoin[] memory) {
		string[] memory coins = getCoins();
		if (!coin.equals("")) {
			coins = new string[](1);
			coins[0] = coin;
		}
		return exUser.balanceOfCoins( msg.sender, coins);
	}
	
	function withdraw(string memory tokenStr, uint256 value) public {
		bytes32 tokenBytes32 = Tool.genBytes32(tokenStr);
		(uint256 amount,) = exUser.balanceOf(msg.sender, tokenBytes32);
		if (value == 0) {
			value = amount;
		}
		require(amount >= value);
		exUser.withDraw(msg.sender, tokenBytes32, value);
		require(sero_send_token(msg.sender, tokenStr, value));
	}
	
	function reCharge() public payable {
		string memory cy = sero_msg_currency();
		require(coinExists[cy], "not exist coin");
		exUser.reCharge(msg.sender, cy.genBytes32(), msg.value);
	}
	
	function cancel(string memory exchangeCoin, string memory payCoin, uint256[] memory orderIds) public {
		bytes32 key = Tool.genKey(exchangeCoin, payCoin);
		for (uint256 i = 0; i < orderIds.length; i++) {
			pairs[key].cancel(exUser, msg.sender, orderIds[i],decimals[exchangeCoin]);
		}
	}
	
	function _genExchangeReq(
		address requester,
		string memory exchangeCoin,
		string memory payCoin,
		uint256 value,
		uint256 price,
		address receiverAddr,
		bytes memory opData) internal view returns (bytes32 key, Types.ExchangeReq memory req) {
		
		require(!paused,"has closed") ;
		
		key = Tool.genKey(exchangeCoin, payCoin);
		
		require(pairExists[key], "pair not exists");
		
		require(hasOffLine(exchangeCoin, payCoin) == false, "has offline");
		
		req = Types.ExchangeReq(
			decimals[exchangeCoin],
			decimals[payCoin],
			requester,
			receiverAddr,
			opData,
			value,
			price
		);
	}
	
	function buyFromWallet(string memory exchangeCoin, uint256 price, uint256 value) external payable {
		
		require(price != 0 && price < 1e30);
		
		string memory payCoin = sero_msg_currency();
		
		require(value >= getMinExchangeCoinValue(exchangeCoin,payCoin),"exchangeCoin value too small");
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(msg.sender,exchangeCoin, payCoin, value, price, address(0), new bytes(0));
		
		uint256 amount = Tool.calPayCoin(value, price,decimals[exchangeCoin]);
		
		require(msg.value >= amount, "not enogh");
		
		exUser.reCharge(msg.sender, Tool.genBytes32(payCoin), msg.value);
		
		pairs[key].buy(exUser, req,amount);
		
		if (openSendReceiver) {
			sendToReceiver(2);
		}
		
	}
	
	
	function _marketBuy(address requester,string memory exchangeCoin, address receiverAddr, bytes memory opData) internal returns (uint256[] memory orderIds){
		
		string memory payCoin = sero_msg_currency();
		
		require(msg.value > 0, "msg.value is zero");
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(requester,exchangeCoin, payCoin, 0, 0, receiverAddr, opData);
		
		exUser.reCharge(msg.sender, payCoin.genBytes32(), msg.value);
		
		orderIds = pairs[key].marketBuy(exUser, req, msg.value);
		
		if (openSendReceiver){
			sendToReceiver(2);
		}
	}
	
	function bigCustomerBuy(string memory exchangeCoin, address receiverAddr, bytes memory opData) external payable onlyBigCustomer returns (uint256[] memory){
		
		require(receiverApproved(receiverAddr), "not approvedReceiverAddr");
		
		return _marketBuy(msg.sender,exchangeCoin,receiverAddr,opData);
		
	}
	
	
	function buy(string memory exchangeCoin, string memory payCoin, uint256 price, uint256 value) external {
		
		require(price != 0 && price < 1e30);
		
		require(value >= getMinExchangeCoinValue(exchangeCoin,payCoin),"exchangeCoin value too small");
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(msg.sender,exchangeCoin, payCoin, value, price, address(0), new bytes(0));
		
		uint256 payValue =  Tool.calPayCoin(value, price,decimals[exchangeCoin]);
		
		(uint256 amount,) = exUser.balanceOf(msg.sender, payCoin.genBytes32());
		
		require(amount >= payValue, "balance not enough");
		
		pairs[key].buy(exUser, req,payValue);
		
		if (openSendReceiver){
			sendToReceiver(2);
		}
		
	}
	
	function sell(string memory exchangeCoin, string memory payCoin, uint256 price, uint256 value) external {
		
		require(price != 0 && price < 1e30);
		
		require(value >= getMinExchangeCoinValue(exchangeCoin,payCoin),"exchangeCoin value too small");
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(msg.sender,exchangeCoin, payCoin, value, price, address(0), new bytes(0));
		
		(uint256 amount,) = exUser.balanceOf(msg.sender, exchangeCoin.genBytes32());
		
		require(amount >= value, "balance not enough");
		
		pairs[key].sell(exUser, req);
		
		if (openSendReceiver){
			sendToReceiver(2);
		}
		
	}
	
	function sellFromWallet(string memory payCoin, uint256 price) external payable {
		
		require(price != 0 && price < 1e30);
		
		string memory exchangeCoin = sero_msg_currency();
		
		require(msg.value >= getMinExchangeCoinValue(exchangeCoin,payCoin),"exchangeCoin value too small");
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(msg.sender,exchangeCoin, payCoin, msg.value, price, address(0), new bytes(0));
		
		exUser.reCharge(msg.sender, exchangeCoin.genBytes32(), msg.value);
		
		pairs[key].sell(exUser, req);
		
		if (openSendReceiver){
			sendToReceiver(2);
		}
	}
	
	
	function _sellWithChangeRate(address opAddr,string memory exchangeCoin,string memory payCoin,uint256 sellValue,address receiverAddr,uint256 changeRate) internal returns(uint256 orderId) {
		
		require(sellValue >= getMinExchangeCoinValue(exchangeCoin,payCoin),"exchangeCoin value too small");
		
		bytes32 pairKey = Tool.genKey(exchangeCoin, payCoin);
		
		uint256 lastPrice = pairs[pairKey].getLastPrice();
		
		uint256 exchangePrice = lastPrice.mul(changeRate).div(1000);
		
		require(exchangePrice != 0 && exchangePrice < 1e30);
		
		(bytes32 key,Types.ExchangeReq memory req) = _genExchangeReq(msg.sender,exchangeCoin, payCoin, sellValue, exchangePrice, receiverAddr, new bytes(0));
		
		exUser.reCharge(opAddr, exchangeCoin.genBytes32(), sellValue);
		
		orderId = pairs[key].sell(exUser, req);
		
		if (openSendReceiver){
			sendToReceiver(2);
		}
	}
	
	function sellWithChangeRate(string memory payCoin,address receiverAddr ,uint256 changeRate) external payable returns(uint256 orderId) {
		
		string memory exchangeCoin = sero_msg_currency();
		
		return  _sellWithChangeRate(msg.sender,exchangeCoin,payCoin,msg.value,receiverAddr,changeRate);
	}
	
	function sendToReceiverByIndex(uint256 index ) public {
		
		ExLibMap.itMapBytes32Object storage im = exUser.receiverBalance;
		
		uint256 size = im.size();
		
		require(index<size ,"invalid index");
		
		ExLibMap.entryBytes32Object memory item = im.getItemByIndex(index);
		
		bytes32 key = im.getKeyByIndex(index);
		
		if (item.value >= getMinSendValue(item.currency)) {
			if (!isContract(item.addr)) {
				require(sero_send_token(item.addr, item.currency, item.value));
			} else {
				sero_setCallValues(item.currency, item.value, "", 0);
				IAgent(item.addr).Agent(item.opData);
			}
			im.remove(key);
		}
		
	}
	
	function sendToReceiver(uint256 count) public {
		
		ExLibMap.itMapBytes32Object storage im = exUser.receiverBalance;
		
		uint256 size = im.size();
		
		if (size == 0) {
			return;
		}
		if (size > count) {
			size = count;
		}
		uint256 index = 0;
		
		while (index < im.size()) {
			if (size == 0) {
				break;
			}
			ExLibMap.entryBytes32Object memory item = im.getItemByIndex(index);
			
			bytes32 key = im.getKeyByIndex(index);
			
			if (item.value >= getMinSendValue(item.currency)) {
				if (!isContract(item.addr)) {
					require(sero_send_token(item.addr, item.currency, item.value));
				} else {
					sero_setCallValues(item.currency, item.value, "", 0);
					IAgent(item.addr).Agent(item.opData);
				}
				im.remove(key);
				size--;
			} else {
				index++;
			}
			
		}
	}

receive() external payable {

}


}




