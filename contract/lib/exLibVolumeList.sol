pragma solidity ^0.6.6;

import "../interface/types.sol";
import {SafeMath} from "./exLibCommon.sol";

library ExLibVolumeList {
	
	using SafeMath for *;
	
	struct PairVolume {
		uint256 lastPrice;
		mapping(uint256 => Types.Hour) volumeList;
	}
	
	
	
	
	function setStartPrice(PairVolume storage self,uint256 startPrice) internal {
		self.lastPrice = startPrice;
	}
	
	
	function addVolume(PairVolume storage self,Types.Deal memory deal) internal {
		uint256 hourIndex = deal.timestamp % 1 days / 600;
		
		uint256 currentDay = deal.timestamp-(deal.timestamp % 1 days);
		
		Types.Hour memory hourInfo = self.volumeList[hourIndex];
		
		if(hourInfo.currentDay == currentDay){
			self.volumeList[hourIndex].totalValue = self.volumeList[hourIndex].totalValue.add(deal.exchangeCoinValue);
			self.volumeList[hourIndex].totalAmount = self.volumeList[hourIndex].totalAmount.add(deal.payCoinValue);
			self.volumeList[hourIndex].lastPrice = deal.lastPrice;
			if (deal.lastPrice > self.volumeList[hourIndex].hight){
				self.volumeList[hourIndex].hight = deal.lastPrice;
			}
			if (deal.lastPrice < self.volumeList[hourIndex].low){
				self.volumeList[hourIndex].low = deal.lastPrice;
			}
			
			self.lastPrice= deal.lastPrice;
		}else {
			self.volumeList[hourIndex].totalValue =deal.exchangeCoinValue;
			self.volumeList[hourIndex].totalAmount = deal.payCoinValue;
			self.volumeList[hourIndex].currentDay = currentDay;
			self.volumeList[hourIndex].startPrice = deal.lastPrice;
			self.volumeList[hourIndex].lastPrice = deal.lastPrice;
			self.volumeList[hourIndex].low = deal.lastPrice;
			self.volumeList[hourIndex].hight = deal.lastPrice;
			self.lastPrice = deal.lastPrice;
			
		}
	}
	
	
	function getLastPrice(PairVolume storage self) internal view returns(uint256 ){
		return self.lastPrice;
	}
	
	function getStartPriceOf24H (PairVolume storage self) internal view returns(uint256 startPrice){
		uint256 hourIndex = now % 1 days / 600;
		
		uint256 currentDay = now-(now % 1 days);
		
		uint256 beforeDay = currentDay - 1 days;
		
		uint256 count = 0;
		
		uint256 startPriceIndex = hourIndex+1;
		
		while(count < 144){
			
			if (startPriceIndex ==144){
				startPriceIndex =0;
			}
			Types.Hour memory hourInfo = self.volumeList[startPriceIndex];
			startPriceIndex ++;
			if(startPriceIndex <= hourIndex){
				if(hourInfo.currentDay == currentDay){
					if (startPrice == 0) {
						startPrice = hourInfo.startPrice;
						break;
					}
				}
			}else {
				if(hourInfo.currentDay == beforeDay){
					if (startPrice == 0){
						startPrice = hourInfo.startPrice;
						break;
					}
				}
			}
			count++;
		}
		
		if (startPrice == 0){
			startPrice = self.lastPrice;
		}
		
	}
	
	function volumeOf24H(PairVolume storage self) internal view returns(uint256 startPrice,uint256 volumeTotal, uint256 totalMoney){
		
		uint256 hourIndex = now % 1 days / 600;
		
		uint256 currentDay = now-(now % 1 days);
		
		uint256 beforeDay = currentDay - 1 days;
		
		uint256 count = 0;
		
		uint256 startPriceIndex = hourIndex+1;
		
		while(count < 144){
			
			if (startPriceIndex ==144){
				startPriceIndex =0;
			}
			Types.Hour memory hourInfo = self.volumeList[startPriceIndex];
			if(startPriceIndex <= hourIndex){
				if(hourInfo.currentDay == currentDay){
					volumeTotal =volumeTotal.add(hourInfo.totalValue);
					totalMoney = totalMoney.add(hourInfo.totalAmount);
					if (startPrice == 0) {
						startPrice = hourInfo.startPrice;
						
					}
				}
			}else {
				if(hourInfo.currentDay == beforeDay){
					volumeTotal =volumeTotal.add(hourInfo.totalValue);
					totalMoney = totalMoney.add(hourInfo.totalAmount);
					if (startPrice == 0){
						startPrice = hourInfo.startPrice;
					}
				}
			}
			
			startPriceIndex ++;
			
			count++;
		}
		if (startPrice == 0){
			startPrice = self.lastPrice;
		}
	}
	
	function detailsOf24H(PairVolume storage self) internal view returns(Types.Hour[] memory details) {
		details = new Types.Hour[](144);
		for(uint256 i=0;i<144;i++){
			details[i]= self.volumeList[i];
		}
	}
}