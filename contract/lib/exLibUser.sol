pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import {ExLibOrder,ExLibMap} from "./exLibOrder.sol";
import {Tool, SafeMath} from "./exLibCommon.sol";
import "../interface/types.sol";


library ExLibUser {
	
	using ExLibMap for *;
	
	using SafeMath for *;
	
	using ExLibOrder for *;
	
	using Tool for *;
	
	struct ExUser {
		address owner;
		mapping(address => Balance) balanceOfUser;
		mapping(address => ExLibOrder.OrderInfo) orders;
		ExLibMap.itMapBytes32Object receiverBalance;
		mapping(address => mapping(bytes32 => Types.Bill[])) dwBills;
	}
	
	struct Balance {
		mapping(bytes32 => uint256) values;
		mapping(bytes32 => uint256) lockedValues;
	}
	
	
	function add(ExUser storage self, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[self.owner].values[coinBytes32] = self.balanceOfUser[self.owner].values[coinBytes32].add(value);
	}
	
	
	function Lock(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		require(self.balanceOfUser[addr].values[coinBytes32].sub(self.balanceOfUser[addr].lockedValues[coinBytes32],"user lock sub error") >= value, "value not enough");
		self.balanceOfUser[addr].lockedValues[coinBytes32] = self.balanceOfUser[addr].lockedValues[coinBytes32].add(value);
	}
	
	function UnLock(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[addr].lockedValues[coinBytes32] = self.balanceOfUser[addr].lockedValues[coinBytes32].sub(value,"user unlock sub error");
	}
	
	function Use(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[addr].lockedValues[coinBytes32] = self.balanceOfUser[addr].lockedValues[coinBytes32].sub(value,"user use sub locked error");
		self.balanceOfUser[addr].values[coinBytes32] = self.balanceOfUser[addr].values[coinBytes32].sub(value,"user use sub balanceOfUser error");
		
		// self.userBill.addBill(addr, coinBytes32, value ,3);
	}
	
	function Add(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[addr].values[coinBytes32] = self.balanceOfUser[addr].values[coinBytes32].add(value);
		// self.userBill.addBill(addr, coinBytes32, value ,2);
	}
	
	function Sub(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[addr].values[coinBytes32] = self.balanceOfUser[addr].values[coinBytes32].sub(value,"User sub sub balanceOfUser error");
		// self.userBill.addBill(addr, coinBytes32, value ,2);
	}
	
	
	function reCharge(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		self.balanceOfUser[addr].values[coinBytes32] = self.balanceOfUser[addr].values[coinBytes32].add(value);
		
		self.dwBills[addr][coinBytes32].push(Types.Bill({value : value, timestamp : uint64(now), typ : 0}));
		
	}
	
	function withDraw(ExUser storage self, address addr, bytes32 coinBytes32, uint256 value) public {
		require(self.balanceOfUser[addr].values[coinBytes32].sub(self.balanceOfUser[addr].lockedValues[coinBytes32],"user withDraw sub lockedValues error") >= value, "withDraw balance not enough");
		self.balanceOfUser[addr].values[coinBytes32] = self.balanceOfUser[addr].values[coinBytes32].sub(value,"user withDraw sub balanceOfUser error");
		self.dwBills[addr][coinBytes32].push(Types.Bill({value : value, timestamp : uint64(now), typ : 1}));
		
	}
	
	function AddReceiver(ExUser storage self, address receiverAddress, bytes memory opData, string memory currency, uint256 amount) public {
		if (receiverAddress.isContract()){
			self.receiverBalance.upSert(receiverAddress, opData, currency, amount);
		}else {
			self.balanceOfUser[receiverAddress].values[currency.genBytes32()] = self.balanceOfUser[receiverAddress].values[currency.genBytes32()].add(amount);
			
		}
		
	}
	
	function balanceOf(ExUser storage self, address addr, bytes32 token) public view returns (uint256 balance, uint256 lockedValue) {
		return (self.balanceOfUser[addr].values[token].sub(self.balanceOfUser[addr].lockedValues[token],"user balanceOf sub lockedValues error"), self.balanceOfUser[addr].lockedValues[token]);
	}
	
	function insertOrder(ExUser storage self, address addr, bytes32 pairKey, uint256 orderId, uint8 status) public {
		self.orders[addr].insertOrder(pairKey, orderId, status);
	}
	
	function packedOrder(ExUser storage self, address addr, bytes32 pairKey, uint256 orderId) public {
		self.orders[addr].packedOrder(pairKey, orderId);
	}
	
	function pendingOrderIds(ExUser storage self, address addr, bytes32 pairKey) public view returns (uint256[] memory){
		return self.orders[addr].pendingOrderIds(pairKey);
	}
	
	function pageOrderIds(ExUser storage self, address addr, bytes32 pairKey, uint256 offset, uint256 limit) public view returns (uint256[] memory, uint256){
		return self.orders[addr].pageOrderIds(pairKey, offset, limit);
	}
	
	function balanceOfCoins(ExUser storage self, address addr, string[] memory coins) public view returns (Types.BlanceOfCoin[] memory result){
		result = new Types.BlanceOfCoin[](coins.length);
		for (uint i = 0; i < coins.length; i++) {
			(uint256 balance,uint256 lockedValue) = balanceOf(self, addr, Tool.genBytes32(coins[i]));
			result[i] = Types.BlanceOfCoin(balance, lockedValue, coins[i]);
		}
	}
	
	function getBills(ExUser storage self, address addr, string memory coin, uint256 offset, uint256 limit) public view returns (Types.Bill[] memory bills, uint256 count) {
		
		bytes32 coinBytes32 = coin.genBytes32();
		Types.Bill[] memory allDW = self.dwBills[addr][coinBytes32];
		count = allDW.length;
		if (offset < count) {
			uint256 start = count - offset;
			uint256 size = limit;
			if (start < limit) {
				size = start;
			}
			bills = new Types.Bill[](size);
			uint256 index = 0;
			while (index < size) {
				start--;
				bills[index] = allDW[start];
				index++;
			}
		}
		
		// return self.userBill.getBills(addr,coin,offset,limit);
	}
	
	
}