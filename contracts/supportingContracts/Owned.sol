pragma solidity >=0.4.22 <0.6.0;

contract Owned {
    address private owner;

    event LogOwnerChanged(address indexed newOwner, address indexed oldOwner);

    modifier onlyOwner {
        require(owner == msg.sender, "Only owner can use this function");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public onlyOwner{
        require(newOwner != address(0), "newOwner should be a valid address");
        emit LogOwnerChanged(newOwner, msg.sender);
        owner = newOwner;
    }

    function getOwner() public view returns(address ownerAddress){
        return owner;
    }
}
