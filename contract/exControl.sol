pragma solidity ^0.6.6;

contract ExControl {
	
	
	address public owner;
	
	address public  cmo;
	
	mapping(address => bool) bigCustomer;
	
	mapping(address=>bool) approvedReceiver;
	
	constructor() public {
		owner = msg.sender;
		cmo = msg.sender;
		
	}
	
	modifier onlyOwner() {
		require(msg.sender == owner,"not owner");
		_;
	}
	
	modifier onlyCMO() {
		require(msg.sender == cmo,"not cmo");
		_;
	}
	
	function setCMO(address addr) public onlyOwner {
		cmo= addr;
	}
	
	function transferOwnership(address newOwner) public onlyOwner {
		if (newOwner != address(0)) {
			owner = newOwner;
		}
	}
	
	function addBigCustomer(address addr) public onlyCMO {
		bigCustomer[addr] = true;
	}
	
	function delBigCustomer(address addr) public onlyCMO{
		delete bigCustomer[addr];
	}
	
	modifier onlyBigCustomer() {
		require(bigCustomer[msg.sender],"not big customer");
		_;
	}
	
	
	function addApprovedReceiver(address addr) public onlyCMO {
		approvedReceiver[addr] = true;
	}
	
	function delApprovedReceiver(address addr) public onlyCMO {
		delete approvedReceiver[addr];
	}
	
	function receiverApproved(address receiverAddress) public view returns(bool){
		if (isContract(receiverAddress)){
			return approvedReceiver[receiverAddress];
		}else {
			return true;
		}
	}
	
	function isContract(address account) internal view returns (bool) {
		uint256 size;
		assembly { size := extcodesize(account) }
		return size > 0;
	}
}