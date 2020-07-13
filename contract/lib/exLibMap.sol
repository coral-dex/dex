pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import {SafeMath} from "./exLibCommon.sol";

library ExLibMap {
	
	using SafeMath for uint256;
	
	struct entryBytes32Object {
		uint256 keyIndex;
		uint256 value;
		bytes opData;
		address addr;
		string currency;
	}
	
	struct itMapBytes32Object {
		mapping(bytes32 => entryBytes32Object) data;
		bytes32[] keys;
	}
	
	function remove(itMapBytes32Object storage self, bytes32 key) internal returns (bool success) {
		entryBytes32Object storage e = self.data[key];
		if (e.keyIndex == 0)
			return false;
		if (e.keyIndex <= self.keys.length) {
			// Move an existing element into the vacated key slot.
			self.data[self.keys[self.keys.length - 1]].keyIndex = e.keyIndex;
			self.keys[e.keyIndex - 1] = self.keys[self.keys.length - 1];
			self.keys.pop();
			delete self.data[key];
			return true;
		}
	}
	
	function upSert(itMapBytes32Object storage self, address addr, bytes memory opData,string memory currency ,uint256 value) internal returns (bool success) {
		
		bytes32 key = keccak256(abi.encodePacked(addr, opData,currency));
		
		entryBytes32Object storage e = self.data[key];
		
		if (e.keyIndex > 0) {
			
			e.value = e.value.add(value);
			
		} else {
			e.value = value;
			
			e.addr = addr;
			
			e.opData = opData;
			
			e.currency = currency;
			
			e.keyIndex =self.keys.length+1;
			
			self.keys.push(key);
		}
		return true;
	}
	
	function size(itMapBytes32Object storage self) internal view returns (uint256) {
		return self.keys.length;
	}
	
	function getKeyByIndex(itMapBytes32Object storage self, uint256 idx) internal view returns (bytes32) {
		require(idx < self.keys.length,"invalid idx");
		return self.keys[idx];
	}
	
	function getItemByIndex(itMapBytes32Object storage self, uint256 idx) internal view returns (entryBytes32Object memory) {
		
		require(idx < self.keys.length,"invalid idx");
		
		return self.data[self.keys[idx]];
	}
	
	
	struct itMapUint256 {
		mapping(uint256 => uint256) keyToIndex;
		uint256[] keys;
	}
	
	function remove(itMapUint256 storage self, uint256 key) internal returns (bool success) {
		uint256  keyIndex = self.keyToIndex[key];
		if (keyIndex == 0)
			return false;
		if (keyIndex <= self.keys.length) {
			// Move an existing element into the vacated key slot.
			self.keyToIndex[self.keys[self.keys.length - 1]] = keyIndex;
			self.keys[keyIndex - 1] = self.keys[self.keys.length - 1];
			self.keys.pop();
			delete self.keyToIndex[key];
			return true;
		}
	}
	
	function upSert(itMapUint256 storage self, uint256 key) internal returns (bool success) {
		
		uint256 keyIndex = self.keyToIndex[key];
		
		if (keyIndex == 0) {
			
			self.keyToIndex[key]=self.keys.length+1;
			
			self.keys.push(key);
		}
		return true;
	}
	
	function size(itMapUint256 storage self) internal view returns (uint256) {
		return self.keys.length;
	}
	
	function getKeyByIndex(itMapUint256 storage self, uint256 idx) internal view returns (uint256) {
		return self.keys[idx];
	}
	
	
	function all(itMapUint256 storage self) internal view returns(uint256[] memory result){
		result = new uint256[](size(self));
		uint256 index = 0;
		for(uint256 i = size(self);i>0;i--){
			result[index]= getKeyByIndex(self,i-1);
			index++;
		}
	}
	
	
	
}
