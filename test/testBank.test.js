var TestBank = artifacts.require("./TestBank.sol");

const ether = 10**18; // 1 ether = 1000000000000000000 wei
const reward = 5 * ether;
const initialDepositsBalance = 25 * ether;

contract("TestBank - basic initialization", function(accounts) {
  const alice = accounts[1];
  const bob = accounts[2];
  const charlie = accounts[3];
  const dave = accounts[4];
  const eve = accounts[5];
  const fiona = accounts[6];

  it("should reward 5 first clients with 5 balance", async () => {
    const bank = await TestBank.deployed();

    await bank.enroll({from: alice});
    const aliceBalance = await bank.balance({from: alice});
    assert.equal(aliceBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: bob});
    const bobBalance = await bank.balance({from: bob});
    assert.equal(bobBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: charlie});
    const charlieBalance = await bank.balance({from: charlie});
    assert.equal(charlieBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: dave});
    const daveBalance = await bank.balance({from: dave});
    assert.equal(daveBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: eve});
    const eveBalance = await bank.balance({from: charlie});
    assert.equal(eveBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: fiona});
    const fionaBalance = await bank.balance({from: fiona});
    assert.equal(fionaBalance, 0, "initial balance is incorrect");

    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "initial balance is incorrect");
  });

  it("should deposit correct amount", async () => {
    const bank = await TestBank.deployed();
    const deposit = 2 * ether;

    const receipt = await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, reward + deposit,
        "deposit amount incorrect, check deposit method");
    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance + deposit,
        "bank deposits balance should be increased");

    const expectedEventResult = {accountAddress: alice, amount: deposit};
    assert.equal(receipt.logs[0].args.accountAddress, expectedEventResult.accountAddress,
        "LogDepositMade event accountAddress property not emitted");
    assert.equal(receipt.logs[0].args.amount, expectedEventResult.amount,
        "LogDepositMade event amount property not emitted");
  });
});

contract("TestBank - proper withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should withdraw correct amount", async () => {
    const bank = await TestBank.deployed();
    const deposit = 4 * ether;

    await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});
    await bank.withdraw(web3.utils.toBN(deposit), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit - deposit, "withdraw amount incorrect");
  });
});

contract("TestBank - incorrect withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should keep balance unchanged if withdraw greater than balance", async() => {
    const bank = await TestBank.deployed();
    const deposit = 3 * ether;

    await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});
    await bank.withdraw(web3.utils.toBN(deposit + 1*ether), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit, "balance should be kept intact");
  });
});

contract("TestBank - fallback works", function(accounts) {
  const alice = accounts[1];

  it("should revert ether sent to this contract through fallback", async() => {
    const bank = await TestBank.deployed();
    const deposit = 3 * ether;

    try {
      await bank.send(web3.utils.toBN(deposit), {from: alice});
    } catch(e) {
      assert(e, "Error: VM Exception while processing transaction: revert");
    }

    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "balance should be kept intact");
  });
});