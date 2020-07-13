pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import "./exLibMap.sol";

library ExLibOrder {
	
	using ExLibMap for *;
	
	struct OrderInfo {
		
		mapping(bytes32 => uint256[]) all;
		
		mapping(bytes32 => ExLibMap.itMapUint256) unPackedOrderIds;
	}
	
	function insertOrder(OrderInfo storage self, bytes32 pairKey, uint256 orderId, uint8 status) internal {
		self.all[pairKey].push(orderId);
		if (status == 0) {
			self.unPackedOrderIds[pairKey].upSert(orderId);
		}
		
	}
	
	function pageOrderIds(OrderInfo storage self, bytes32 pairKey, uint256 offset, uint256 limit) internal view returns (uint256[] memory orderIds, uint256 count){
		uint256[] memory allIds = self.all[pairKey];
		count = allIds.length;
		if (offset < count) {
			uint256 start = count - offset;
			uint256 size = limit;
			if (start < limit) {
				size = start;
			}
			orderIds = new uint256[](size);
			uint256 index = 0;
			while (index < size) {
				start--;
				orderIds[index] = allIds[start];
				index++;
			}
		}
	}
	
	
	function pendingOrderIds(OrderInfo storage self, bytes32 pairKey) internal view returns (uint256[] memory orderIds){
		orderIds = self.unPackedOrderIds[pairKey].all();
	}
	
	function packedOrder(OrderInfo storage self, bytes32 pairKey, uint256 orderId) internal {
		self.unPackedOrderIds[pairKey].remove(orderId);
	}
}