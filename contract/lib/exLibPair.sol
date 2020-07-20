pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;


import {ExLibTx, Types} from "./exLibTx.sol";
import {ExLibUser, SafeMath, Tool, ExLibMap} from "./exLibUser.sol";
import {ExLibVolumeList} from "./exLibVolumeList.sol";


library ExLibPair {
	using ExLibTx for ExLibTx.OrderList;
	using SafeMath for uint256;
	
	using ExLibUser for *;
	using Tool for *;
	using ExLibVolumeList for *;
	
	event Deal(string exchangeCoin,string payCoin,uint256 orderId,uint256 value, uint256 price,uint64 timestamp,uint8 opType);
	
	struct Pair {
		uint256 defaultRate;
		uint256 decimal;
		bytes32 key;
		string exchangeCoin;
		string payCoin;
		bytes32 exchangeCoinBytes32;
		bytes32 payCoinBytes32;
		ExLibVolumeList.PairVolume volumeOf24H;
		uint256 counter;
		ExLibTx.OrderList buyList;
		ExLibTx.OrderList sellList;
		mapping(address => mapping(bytes32 => uint256)) feeRate;
		uint256 incRate;
		uint256 decRate;
	}
	
	
	function getIncRate(Pair storage self) internal view returns(uint256 incRate){
		incRate = self.incRate;
		if (incRate == 0){
			incRate = 110;
		}
	}
	
	function setIncRate(Pair storage self,uint256 incRate) public  {
		self.incRate = incRate;
	}
	
	function getDecRate(Pair storage self) internal view returns(uint256 decRate){
		decRate = self.decRate;
		if (decRate == 0){
			decRate = 95;
		}
	}
	
	function setDecRate(Pair storage self,uint256 decRate) public  {
		self.decRate = decRate;
	}
	
	function genOrderId(Pair storage self) internal returns (uint256 orderId){
		
		self.counter += 1;
		
		return self.counter;
	}
	
	function getFeeRate(Pair storage self,address user, bytes32 coinBytes32) public view returns (uint256 rate){
		rate = self.feeRate[user][coinBytes32];
		
		if (rate == 0) {
			if (self.defaultRate == 0 ){
				rate = 20;
			}else {
				rate = self.defaultRate;
			}
			
		}
		return rate;
	}
	
	function calcFee(uint256 totalAmount, uint256 feeRate) internal pure returns (uint256 fee) {
		fee = totalAmount.mul(feeRate).div(10000);
	}
	
	function setFeeRate(Pair storage self ,address user,string memory coin ,uint256 rate) public {
		self.feeRate[user][coin.genBytes32()] = rate;
	}
	
	function setDefaultFeeRate(Pair storage self  ,uint256 rate) public {
		self.defaultRate = rate;
	}
	
	function ordersByIds(Pair storage self, uint256[] memory ids) public view returns (Types.Order[] memory orders){
		orders = new Types.Order[](ids.length);
		for (uint i = 0; i < ids.length; i++) {
			uint256 id = ids[i];
			Types.Order storage order = self.buyList.orders[id];
			if (order.owner == address(0)) {
				order = self.sellList.orders[id];
			}
			orders[i] = order;
		}
		return orders;
	}
	
	
	function shortOrdersByIds(Pair storage self, uint256[] memory ids) public view returns (Types.ShortOrder[] memory orders){
		orders = new Types.ShortOrder[](ids.length);
		for (uint i = 0; i < ids.length; i++) {
			uint256 id = ids[i];
			Types.Order storage order = self.buyList.orders[id];
			if (order.owner == address(0)) {
				order = self.sellList.orders[id];
			}
			orders[i] = Types.ShortOrder(
				order.id,
				order.price,
				order.value,
				order.dealValue,
				order.createTime,
				order.status,
				order.orderType,
				order.payCoinValue
			);
		}
		return orders;
	}
	
	function heapToOrders(ExLibTx.OrderList storage self) public view returns (Types.BaseOrder[] memory orders) {
		orders = new Types.BaseOrder[](self.len);
		for (uint i = 0; i < self.len; i++) {
			uint256 id = self.heap[i];
			orders[i] = Types.BaseOrder(
				self.orders[id].id,
				self.orders[id].price,
				self.orders[id].value,
				self.orders[id].dealValue,
				self.orders[id].createTime,
				self.orders[id].status);
		}
		return orders;
	}
	
	function info(Pair storage self) public view returns (Types.PairInfo memory result) {
		Types.BaseOrder[] memory buyList = heapToOrders(self.buyList);
		Types.BaseOrder[] memory sellList = heapToOrders(self.sellList);
		result = Types.PairInfo(buyList, sellList,0);
		return result;
	}
	
	function currentVolumeOf24H(Pair storage self) public view returns (uint256 firstPrice, uint256 lastPrice, uint256 volumeTotal, uint256 totolMoney){
		(firstPrice,volumeTotal,totolMoney) =  self.volumeOf24H.volumeOf24H();
		lastPrice = self.volumeOf24H.getLastPrice();
	}
	
	function getLastPrice(Pair storage self) public view returns(uint256){
		return self.volumeOf24H.getLastPrice();
	}
	
	function addVolume(Pair storage self, Types.Deal memory deal) internal {
		self.volumeOf24H.addVolume(deal);
	}
	
	function detailsOf24H(Pair storage self) public view returns(Types.Hour[] memory){
		return self.volumeOf24H.detailsOf24H();
	}
	
	function initPair(Pair storage self, string memory exchangeCoin, string memory payCoin, bytes32 exchangeCoinBytes32, bytes32 payCoinBytes32, uint256 startPrice) public {
		self.exchangeCoin = exchangeCoin;
		self.payCoin = payCoin;
		self.key = Tool.genKey(exchangeCoin, payCoin);
		self.exchangeCoinBytes32 = exchangeCoinBytes32;
		self.payCoinBytes32 = payCoinBytes32;
		self.buyList = ExLibTx.OrderList({heap : new uint256[](0), len : 0});
		self.sellList = ExLibTx.OrderList({heap : new uint256[](0), len : 0});
		self.volumeOf24H.setStartPrice(startPrice);
	}
	
	function cancel(Pair storage self, ExLibUser.ExUser storage user, address opAddr, uint256 orderId,uint256 exchangeCoinDecimals) public {
		Types.Order storage order = self.sellList.orders[orderId];
		if (order.owner == address(0)) {
			order = self.buyList.orders[orderId];
		}
		require(order.owner == opAddr);
		require(order.status == 0);
		order.status = 2;
		uint256 value = 0;
		bytes32 coinBytes32;
		if (order.orderType) {
			value = order.value.sub(order.dealValue,"pair cancel sub dealValue error");
			coinBytes32 = self.exchangeCoinBytes32;
		} else {
			coinBytes32 = self.payCoinBytes32;
			uint256 remainingExchangeCoinValue = order.value.sub(order.dealValue,"pair cancel sub dealValue error");
			
			value = Tool.calPayCoin(remainingExchangeCoinValue,order.price,exchangeCoinDecimals);
			
		}
		user.packedOrder(opAddr, self.key, orderId);
		if (value > 0) {
			user.UnLock(opAddr, coinBytes32, value);
		}
	}
	
	function genCloseOrder(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		uint256 exchangeCoinDecimals,
		address opAddr,
		address receiverAddr,
		bytes memory opData,
		uint256 exchangeCoinValue,
		uint256 payCoinValue,
		bool sellOrder) internal returns(uint256 orderId){
		
		uint256 price =  Tool.calPrice(payCoinValue,exchangeCoinValue,exchangeCoinDecimals);
		orderId = genOrderId(pair);
		
		Types.Order memory order = Types.Order({
			id : orderId,
			owner : opAddr,
			receiverAddr : receiverAddr,
			opData :opData,
			price : price,
			value : exchangeCoinValue,
			dealValue : exchangeCoinValue,
			createTime : uint64(now),
			status : 1,
			orderType : sellOrder,
			payCoinValue : payCoinValue
			});
		
		if (sellOrder){
			pair.sellList.put(order);
		}else {
			pair.buyList.put(order);
		}
		user.insertOrder(order.owner, pair.key, order.id, order.status);
	}
	
	function genOpenOrder(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req,
		uint256 dealValue,
		uint256 payCoinValue,
		bool sellOrder) internal returns(uint256 orderId){
		
		require(req.price>0,"genOpenOrder must hava price");
		
		require(req.value >0,"genOpenOrder must have value");
		
		require(req.value >= dealValue,"genOpenOrder invalid dealValue");
		
		orderId = genOrderId(pair);
		
		uint8 status =0;
		
		Types.Order memory order = Types.Order({
			id : orderId,
			owner : req.opAddr,
			receiverAddr : req.receiverAddr,
			opData :req.opData,
			price : req.price,
			value : req.value,
			dealValue : dealValue,
			createTime : uint64(now),
			status : status,
			orderType : sellOrder,
			payCoinValue : payCoinValue
			});
		
		if (sellOrder){
			pair.sellList.put(order);
		}else {
			pair.buyList.put(order);
		}
		
		user.insertOrder(order.owner, pair.key, order.id, order.status);
	}
	
	
	
	function sell(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req)
	public returns (uint256 orderId) {
		
		user.Lock(req.opAddr, pair.exchangeCoinBytes32, req.value);
		
		(uint256 exchangeCoinCost,uint256 payCoinIncome,uint256 lastPrice) = matchBuy(pair, user, req);
		
		if (exchangeCoinCost > 0) {
			user.Use(req.opAddr, pair.exchangeCoinBytes32, exchangeCoinCost);
			addVolume(pair,Types.Deal(exchangeCoinCost, lastPrice, payCoinIncome,now, 0));
		}
		
		if (payCoinIncome >0){
			comfirmedExchange(
				pair,
				user,
				req.opAddr,
				pair.payCoin,
				payCoinIncome,
				req.receiverAddr,
				new bytes(0));
		}
		
		uint256 remainingCanSell = req.value.sub(exchangeCoinCost,"sell sub eror");
		uint256 payCoinDone = Tool.calPayCoin(remainingCanSell,req.price,req.exchangeCoinDecimals);
		
		if (remainingCanSell == 0 || payCoinDone ==0) {
			if (remainingCanSell >0 ){
				user.Use(req.opAddr,pair.exchangeCoinBytes32,remainingCanSell);
				user.add(pair.exchangeCoinBytes32,remainingCanSell);
			}
			orderId = genCloseOrder(pair,user,req.exchangeCoinDecimals,req.opAddr,req.receiverAddr,req.opData,req.value,payCoinIncome,true);
		}else {
			orderId = genOpenOrder(pair,user,req,exchangeCoinCost,payCoinIncome,true);
		}
		
	}
	
	
	
	function matchBuy(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req
	) internal returns (
		uint256 exchangeCoinCost,
		uint256 payCoinIncomValue,
		uint256 lastPrice){
		
		uint256 totalSellValue = req.value;
		
		uint256 exchangeFee = 0;
		
		lastPrice = req.price;
		
		while (totalSellValue > 0 && pair.buyList.len > 0) {
			
			(,Types.Order storage buyOrder) = pair.buyList.top();
			
			if (buyOrder.status != 0) {
				pair.buyList.down(buyOrder.orderType);
				continue;
			}
			if ( req.price <= buyOrder.price) {
				(uint256 cb,uint256 cp, uint256 cf) = matchSingleBuy(pair, user, buyOrder,req.exchangeCoinDecimals, totalSellValue);
				totalSellValue = totalSellValue.sub(cb,"pair matchBuy sub cb error");
				payCoinIncomValue = payCoinIncomValue.add(cp);
				exchangeCoinCost = exchangeCoinCost.add(cb);
				exchangeFee = exchangeFee.add(cf);
				lastPrice = buyOrder.price;
			} else {
				break;
			}
			
			
		}
		if (exchangeFee > 0) {
			user.add(pair.exchangeCoinBytes32, exchangeFee);
			
		}
	}
	
	function matchSingleBuy(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.Order storage buyOrder,
		uint256 exchangeCoinDecimals,
		uint256 totalSellValue)
	internal returns (uint256 buyValue, uint256 mustPayCoin, uint256 exchangeFee) {
		
		buyValue = buyOrder.value.sub(buyOrder.dealValue,"pair matchSingleBuy sub dealValue error");
		
		uint256 exchangeCoinFeeRate =getFeeRate(pair,buyOrder.owner,pair.exchangeCoinBytes32);
		
		if (buyValue <= totalSellValue) {
			
			buyOrder.dealValue = buyOrder.value;
			
			buyOrder.status = 1;
			
			pair.buyList.down(buyOrder.orderType);
			
			user.packedOrder(buyOrder.owner, pair.key, buyOrder.id);
			
		} else {
			
			buyValue = totalSellValue;
			
			buyOrder.dealValue = buyOrder.dealValue.add(totalSellValue);
		}
		
		mustPayCoin = Tool.calPayCoin(buyValue, buyOrder.price,exchangeCoinDecimals);
		
		user.Use(buyOrder.owner, pair.payCoinBytes32, mustPayCoin);
		
		buyOrder.payCoinValue = buyOrder.payCoinValue.add(mustPayCoin);
		
		exchangeFee = calcFee(buyValue, exchangeCoinFeeRate);
		
		if (exchangeFee == 0) {
			
			exchangeFee = buyValue;
			
		}else {
			if (buyOrder.receiverAddr == address(0)) {
				user.Add(buyOrder.owner, pair.exchangeCoinBytes32, buyValue.sub(exchangeFee,"pair matchSingleBuy sub exchangeFee error"));
				
			} else {
				user.AddReceiver(buyOrder.receiverAddr, buyOrder.opData, pair.exchangeCoin, buyValue.sub(exchangeFee,"pair matchSingleBuy sub exchangeFee error"));
			}
			
		}
		
		
		emit Deal(pair.exchangeCoin,pair.payCoin,buyOrder.id,buyValue,buyOrder.price,uint64(now),1);
	}
	
	
	function buy(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req,
		uint256 lockedPayCoinValue
	) public returns (uint256 orderId){
		
		require(lockedPayCoinValue>0,"invalid lockedPayCoinValue");
		
		user.Lock(req.opAddr, pair.payCoinBytes32, lockedPayCoinValue);
		
		(uint256 exchangeCoinIncome,uint256 payCoinCost,uint256 lastPrice) = matchSell(pair, user, req);
		
		if (exchangeCoinIncome > 0) {
			
			addVolume(pair,Types.Deal(exchangeCoinIncome, lastPrice,payCoinCost ,now, 1));
			
			user.Use(req.opAddr, pair.payCoinBytes32, payCoinCost);
			
			comfirmedExchange(
				pair,
				user,
				req.opAddr,
				pair.exchangeCoin,
				exchangeCoinIncome,
				req.receiverAddr,
				req.opData);
		}
		
		
		uint256 remaingWantBuy = req.value.sub(exchangeCoinIncome,"pair buy sub exchangeCoinIncome error");
		
		
		if (remaingWantBuy ==0 ) {
			orderId = genCloseOrder(pair,user,req.exchangeCoinDecimals,req.opAddr,req.receiverAddr,req.opData,req.value,payCoinCost,false);
			if (lockedPayCoinValue > payCoinCost) {
				user.UnLock(req.opAddr, pair.payCoinBytes32, lockedPayCoinValue.sub(payCoinCost,"pair buy sub payCoinValue error"));
			}
		}else {
			
			uint256 remainengNeedCost = Tool.calPayCoin(remaingWantBuy,req.price,req.exchangeCoinDecimals);
			
			
			orderId = genOpenOrder(pair,user,req,exchangeCoinIncome,payCoinCost,false);
			
			uint256 remainingLocked = lockedPayCoinValue.sub(payCoinCost,"pair buy sub payCoinCost error");
			
			if (remainingLocked > remainengNeedCost) {
				
				user.UnLock(req.opAddr, pair.payCoinBytes32, remainingLocked.sub(remainengNeedCost,"pair buy sub payCoinValue error"));
				
			}
			
		}
	}
	
	
	function matchSell(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req) internal returns (uint256 hasBuyValue, uint256 hasPayCoin,uint256 lastPrice){
		
		uint256 payCoinFee = 0;
		
		uint256 totalBuyVale = req.value;
		
		lastPrice = req.price;
		
		while (totalBuyVale > 0 && pair.sellList.len > 0) {
			
			(, Types.Order storage sellOrder) = pair.sellList.top();
			
			if (sellOrder.status != 0) {
				pair.sellList.down(sellOrder.orderType);
				continue;
			}
			if (req.price >= sellOrder.price) {
				(uint256 cs,uint256 ci,uint256 cf) = matchSingleSell(
					pair,
					user,
					sellOrder,
					req.exchangeCoinDecimals,
					totalBuyVale);
				totalBuyVale = totalBuyVale.sub(cs,"pair matchSell sub cs error");
				hasBuyValue = hasBuyValue.add(cs);
				hasPayCoin = hasPayCoin.add(ci);
				payCoinFee = payCoinFee.add(cf);
				lastPrice = sellOrder.price;
			} else {
				break;
			}
		}
		
		if (payCoinFee > 0) {
			user.add(pair.payCoinBytes32, payCoinFee);
			
		}
	}
	
	function matchSingleSell(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.Order storage sellOrder,
		uint256 exchangeCoinDecimals,
		uint256 totalWantBuyVale) internal returns (uint256 sellValue, uint256 payCoinInCome, uint256 payCoinFee){
		
		uint256 payCoinFeeRate = getFeeRate(pair,sellOrder.owner,pair.payCoinBytes32);
		
		sellValue = sellOrder.value.sub(sellOrder.dealValue,"pair matchSingleSell sun dealValue error");
		if (sellValue <= totalWantBuyVale) {
			sellOrder.dealValue = sellOrder.value;
			sellOrder.status = 1;
			pair.sellList.down(sellOrder.orderType);
			user.packedOrder(sellOrder.owner, pair.key, sellOrder.id);
			
		} else {
			sellValue = totalWantBuyVale;
			sellOrder.dealValue = sellOrder.dealValue.add(sellValue);
		}
		
		user.Use(sellOrder.owner, pair.exchangeCoinBytes32, sellValue);
		
		payCoinInCome = Tool.calPayCoin(sellValue, sellOrder.price,exchangeCoinDecimals);
		
		sellOrder.payCoinValue = sellOrder.payCoinValue.add(payCoinInCome);
		
		payCoinFee = calcFee(payCoinInCome, payCoinFeeRate);
		
		if (payCoinFee == 0){
			
			payCoinFee = payCoinInCome;
			
		} else {
			if (sellOrder.receiverAddr == address(0)){
				
				user.Add(sellOrder.owner, pair.payCoinBytes32, payCoinInCome.sub(payCoinFee,"pair marketMatchSell sun payCoinFee error"));
				
			} else {
				
				user.AddReceiver(sellOrder.receiverAddr, sellOrder.opData, pair.payCoin, payCoinInCome.sub(payCoinFee,"pair marketMatchSell sun payCoinFee error"));
			}
		}
		
		
		
		emit Deal(pair.exchangeCoin,pair.payCoin,sellOrder.id,sellValue,sellOrder.price,uint64(now),0);
		
		
	}
	
	function marketBuy(
		Pair storage pair,
		ExLibUser.ExUser storage user,
		Types.ExchangeReq memory req,
		uint256 totalPyaCoin
	) public returns (uint256[] memory orderIds){
		
		user.Lock(req.opAddr, pair.payCoinBytes32, totalPyaCoin);
		
		(uint256 hasBuyExchangeCoin,uint256 hasPayCoinCost,uint256 lastPrice) = marketMatchSell(
			pair,
			user,
			req.exchangeCoinDecimals,
			totalPyaCoin);
		
		if (lastPrice ==0){
			lastPrice = getLastPrice(pair);
			lastPrice = lastPrice.mul(getIncRate(pair)).div(100);
		}else {
			addVolume(pair,Types.Deal(hasBuyExchangeCoin, lastPrice,hasBuyExchangeCoin,now, 1));
			if(hasPayCoinCost < totalPyaCoin){
				lastPrice = lastPrice.mul(getIncRate(pair)).div(100);
			}
		}
		
		if (hasBuyExchangeCoin > 0){
			user.Use(req.opAddr, pair.payCoinBytes32,hasPayCoinCost);
			comfirmedExchange(pair,user,req.opAddr,pair.exchangeCoin,hasBuyExchangeCoin,req.receiverAddr,req.opData);
			
		}
		uint256 remaingCanCost= totalPyaCoin.sub(hasPayCoinCost,"pair marketBuy sub hasPayCoinCost error");
		
		uint256 canBuy = Tool.calExchangeCoin(remaingCanCost,lastPrice,req.exchangeCoinDecimals);
		
		if (canBuy ==0){
			orderIds = new uint256[](1);
			hasPayCoinCost = totalPyaCoin;
			if (remaingCanCost > 0){
				user.add(pair.payCoinBytes32,remaingCanCost);
			}
			orderIds[0] = genCloseOrder(
				pair,
				user,
				req.exchangeCoinDecimals,
				req.opAddr,
				req.receiverAddr,
				req.opData,
				hasBuyExchangeCoin,
				hasPayCoinCost,
				false
			);
			
		}else {
			
			Types.ExchangeReq memory newReq =  Types.ExchangeReq(
				req.exchangeCoinDecimals,
				req.payCoinDecimals,
				req.opAddr,
				req.receiverAddr,
				req.opData,
				canBuy,
				lastPrice
			);
			uint256 openOrderId = genOpenOrder(pair,user,newReq,0,0,false);
			
			if (hasPayCoinCost ==0){
				orderIds = new uint256[](1);
				orderIds[0] = openOrderId;
			}else {
				orderIds = new uint256[](2);
				orderIds[0] = genCloseOrder(
					pair,
					user,
					req.exchangeCoinDecimals,
					req.opAddr,
					req.receiverAddr,
					req.opData,
					hasBuyExchangeCoin,
					hasPayCoinCost,
					false
				);
				orderIds[1] = openOrderId;
			}
			
		}
		
	}
	
	function marketMatchSell(
		ExLibPair.Pair storage pair,
		ExLibUser.ExUser storage user,
		uint256 exchangeCoinDecimals,
		uint256 canCostPayValue)
	internal returns (
		uint256 hasBuyExchangeValue,
		uint256 hasPayCoinCost,
		uint256 lastPrice) {
		
		uint256 payCoinFee = 0;
		
		hasPayCoinCost = 0;
		
		while (canCostPayValue > hasPayCoinCost && pair.sellList.len > 0) {
			
			(, Types.Order storage sellOrder) = pair.sellList.top();
			
			if (sellOrder.status != 0) {
				pair.sellList.down(sellOrder.orderType);
				continue;
			}
			uint256 currentCanPayCoinCost = canCostPayValue.sub(hasPayCoinCost,"pair marketMatchSell sub hasPayCoinCost error ");
			uint256 totalCanBuyVale = Tool.calExchangeCoin(currentCanPayCoinCost,sellOrder.price,exchangeCoinDecimals);
			
			if (totalCanBuyVale >0){
				(uint256 exchangeCoinDone,uint256 payCoinDone,uint256 feePayCoinDone) =
				matchSingleSell(
					pair,
					user,
					sellOrder,
					exchangeCoinDecimals,
					totalCanBuyVale);
				hasBuyExchangeValue = hasBuyExchangeValue.add(exchangeCoinDone);
				hasPayCoinCost = hasPayCoinCost.add(payCoinDone);
				payCoinFee = payCoinFee.add(feePayCoinDone);
				if (exchangeCoinDone == totalCanBuyVale){
					
					if (canCostPayValue > hasPayCoinCost){
						payCoinFee= payCoinFee.add(canCostPayValue.sub(hasPayCoinCost,"marketMatchSell sub hasPayCoinCost error"));
					}
					
					hasPayCoinCost = canCostPayValue;
					
					
				}
			}else {
				
				hasPayCoinCost = canCostPayValue;
				
				payCoinFee= payCoinFee.add(currentCanPayCoinCost);
				
			}
			
			lastPrice = sellOrder.price;
		}
		
		if (payCoinFee > 0) {
			user.add(pair.payCoinBytes32, payCoinFee);
			
		}
		
	}
	
	
	
	function comfirmedExchange(
		ExLibPair.Pair storage pair,
		ExLibUser.ExUser storage user,
		address opAddr,
		string memory coin,
		uint256 coinValue,
		address receiverAddr,
		bytes memory opData) internal {
		if (coinValue > 0) {
			
			bytes32 coinBytes32 = Tool.genBytes32(coin);
			
			uint256 coinFeeRate = getFeeRate(pair,opAddr,coinBytes32);
			
			uint256 fee = calcFee(coinValue, coinFeeRate);
			
			if (fee ==0){
				
				fee = coinValue;
				
			}else {
				if (receiverAddr == address(0)) {
					
					user.Add(opAddr, coinBytes32, coinValue.sub(fee,"pair confirmedExchange sub fee error"));
					
				} else {
					
					user.AddReceiver(receiverAddr, opData, coin, coinValue.sub(fee,"pair confirmedExchange sub fee error"));
					
				}
			}
			
			user.add(coinBytes32, fee);
		}
		
		
	}
	
}


     