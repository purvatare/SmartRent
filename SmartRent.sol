pragma solidity ^0.8.0;

contract RentChain {

    address public landlord;
    address public tenant;

    uint public rentAmount;
    uint public securityDeposit;

    uint public dueDate;
    uint public lastPaidDate;

    bool public isActive;

    constructor(address _tenant, uint _rentAmount, uint _deposit) {
        landlord = msg.sender;
        tenant = _tenant;
        rentAmount = _rentAmount;
        securityDeposit = _deposit;
        dueDate = block.timestamp + 30 days;
        isActive = true;
    }

    // ✅ Pay Rent
    function payRent() public payable {
        require(msg.sender == tenant, "Only tenant can pay");
        require(isActive, "Agreement not active");

        uint amountToPay = rentAmount;

        // Late fee logic
        if (block.timestamp > dueDate) {
            uint lateFee = (rentAmount * 10) / 100;
            amountToPay += lateFee;
        }

        require(msg.value >= amountToPay, "Insufficient payment");

        (bool success, ) = payable(landlord).call{value: msg.value}("");
        require(success, "Transfer failed");

        lastPaidDate = block.timestamp;
        dueDate = block.timestamp + 30 days;
    }

    // ✅ Return Security Deposit (NO heavy logic)
    function returnSecurityDeposit() public {
    require(msg.sender == landlord, "Only landlord");
    require(isActive, "Already terminated");

    isActive = false;

    (bool success, ) = payable(tenant).call{value: securityDeposit}("");
    require(success, "Deposit return failed");
    }

    // ✅ Terminate Agreement
    function terminateAgreement() public {
        require(msg.sender == landlord, "Only landlord");

        isActive = false;
    }

    // ✅ View Functions (for your frontend)
    function getDueAmount() public view returns (uint) {
        uint amount = rentAmount;

        if (block.timestamp > dueDate) {
            uint lateFee = (rentAmount * 10) / 100;
            amount += lateFee;
        }

        return amount;
    }

    function isRentLate() public view returns (bool) {
        return block.timestamp > dueDate;
    }
}