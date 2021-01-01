pragma solidity ^0.7.0;


contract TestBank {
    uint8 private clientNumber;
    mapping (address => uint8) private balances;
    address public owner;

  // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint8 amount);

    // Constructor is "payable" so it can receive the initial funding of 30, 
    // required to reward the first 5 clients
    constructor() public payable {
        require(msg.value == 25 ether, "25 ether initial funding required");
        /* Set the owner to the creator of this contract */
        owner = msg.sender;
        clientNumber = 0;
    }

    /// @notice Enroll a customer with the bank, 
    /// giving the first 5 of them 5 ether as reward
    /// @return The balance of the user after enrolling
    function enroll() public returns (uint8) {
        if (clientNumber < 5) {
            clientNumber++;
            balances[msg.sender] = 5 ether;
        }
        return balances[msg.sender];
    }

    /// @notice Deposit ether into bank, requires method is "payable"
    /// @return The balance of the user after the deposit is made
    function deposit() abstract payable returns (uint8) {
        balances[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return balances[msg.sender];
    }

    
    function withdraw(uint8 withdrawAmount) public returns (uint8 remainingBal) {
        // Check enough balance available, otherwise just return balance
        if (withdrawAmount <= balances[msg.sender]) {
            balances[msg.sender] -= withdrawAmount;
            msg.sender.transfer(withdrawAmount);
        }
        return balances[msg.sender];
    }

    /// @notice Just reads balance of the account requesting, so "constant"
    /// @return The balance of the user
    function balance() public view returns (uint8) {
        return balances[msg.sender];
    }

    /// @return The balance of the Simple Bank contract
    function depositsBalance() public view returns (uint8) {
        return address(this).balance;
    }
}