pragma solidity ^0.6.6;

library Types {
	
	struct PairVolumeInfo {
		string exchangeCoin;
		string payCoin;
		uint256 decimals;
		uint256 startPrice;
		uint256 lastPrice;
		uint256 volume;
		bool offline;
		uint256 totalMoney;
	}
	
	struct Hour {
		uint256 currentDay;
		uint256 totalAmount;
		uint256 totalValue;
		uint256 startPrice;
		uint256 lastPrice;
	}
	
	struct Deal {
		uint256 exchangeCoinValue;
		uint256 lastPrice;
		uint256 payCoinValue;
		uint256 timestamp;
		uint8 opType; //0 : sell ,1 : buy
	}
	
	struct ExchangeReq {
		uint256 exchangeCoinDecimals;
		uint256 payCoinDecimals;
		address opAddr;
		address receiverAddr;
		bytes opData;
		uint256 value;
		uint256 price;
	}
	
	struct Order {
		uint256 id;
		address owner;
		address receiverAddr;
		bytes opData;
		uint256 price;
		uint256 value;
		uint256 dealValue;
		uint64 createTime;
		uint8 status;
		bool orderType; //true : sell ,false : buy.
		uint256 payCoinValue;
	}
	
	
	struct ShortOrder{
		uint256 id;
		uint256 price;
		uint256 value;
		uint256 dealValue;
		uint256 createTime;
		uint256  status;
		bool orderType;
		uint256 payCoinValue;
	}
	
	struct BaseOrder {
		uint256 id;
		uint256 price;
		uint256 value;
		uint256 dealValue;
		uint256 createTime;
		uint256  status;
	}
	
	struct PairInfo {
		BaseOrder[] buyOrders;
		BaseOrder[] sellOrders;
		uint256 minExchangeCoinValue;
	}
	
	
	struct Bill {
		uint256 value;
		uint64 timestamp;
		uint8 typ; //0: recharge, 1: withdraw, 2: buy, 3: sell
	}
	
	struct Bills {
		uint256 time;
		uint256 len;
		Types.Bill[] list;
	}
	
	struct BlanceOfCoin {
		uint256 amount;
		uint256 lockedAmount;
		string coin;
	}
	
	struct PackedId {
		address ows;
		uint256 orderId;
	}
	
	
}