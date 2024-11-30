# Purchasing and Burning Tokens Documentation

## Overview

The **Purchasing and Burning Tokens** functionality enables students to spend their tokens on items (goodies) in the school shop. When a purchase is made, the corresponding amount of tokens is burned, reducing the total supply and promoting token scarcity.

## Implementation Details

#### Functions

**buyGoodies**

**Visibility: `public`**

**Purpose**: Allows students to purchase items by burning tokens.

```solidity
    function buyGoodies(string memory item, uint256 cost) public
```

- **Parameters**:
    - `item`: Name of the item to purchase.
    - `cost`: Cost of the item in tokens (without decimals).

- **Function Logic**:
    
    1. **Validation**:
        - Checks that `item` is not an empty string.
        - Ensures `cost` is greater than zero.
        - Verifies the sender has enough balance.
    2. **Burning Tokens**:
        - Burns the specified amount of tokens from the sender.
    3. **Event Emission**:
        - Emits the `GoodiePurchased` event.

- **Code Snippet**:

```solidity
    function buyGoodies(string memory item, uint256 cost) public {
        require(bytes(item).length > 0, "Item name cannot be empty");
        require(cost > 0, "Cost must be greater than zero");
        require(balanceOf(msg.sender) >= cost * (10 ** 18), "Not enough balance to buy the item");

        _burn(msg.sender, cost * (10 ** 18));
        emit GoodiePurchased(msg.sender, item, cost);
    }
```

#### Events

##### GoodiePurchased

Emitted when a purchase is made.

```solidity
    event GoodiePurchased(
        address indexed buyer,
        string item,
        uint256 cost
    );
```

- **Parameters**:
    - `buyer`: Address of the student making the purchase.
    - `item`: Name of the item purchased.
    - `cost`: Cost of the item (without decimals).

## Workflow Summary

1. **Purchase Initiation**:
    - Student calls `buyGoodies` with the item name and cost.
2. **Validation**:
    - Contract validates inputs and checks balance.
3. **Token Burning**:
    - Tokens are burned from the student's balance.
4. **Event Emission**:
    - ``GoodiePurchased` event is emitted.

## Usage Example

**Purchasing an Item**

```solidity
    // Student wants to buy a "Notebook" costing 30 tokens
    altarian42.connect(studentSigner).buyGoodies("Notebook", 30);
```
- **Outcome**:
    - 30 tokens are burned from the student's balance.
    - Total supply decreases by 30 tokens.

## Important Considerations

- **Decimals Handling**:
    - `cost` is specified without decimals; the contract adjusts for decimals internally.
    - **Access Control**:
        Any account with sufficient balance can call `buyGoodies`.
    - **Event Emission**:
        Facilitates tracking of purchases off-chain.

## Testing the Purchasing Functionality

#### Test Cases

1. **Successful Purchase**
    - **Test**: Student purchases an item successfully.
    - **Expectation**: Tokens are burned; event is emitted.

```solidity
    it("Should allow a student to buy goodies and burn tokens", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("T-shirt", cost)
        ).to.emit(altarian42, "GoodiePurchased")
        .withArgs(student, "T-shirt", cost);

        const studentBalance = await altarian42.balanceOf(student);
        expect(studentBalance).to.equal(
            ethers.parseUnits((rewardAmount - cost).toString(), 18)
        );
    });
```

2. **Insufficient Balance**

- **Test**: Purchase fails if student lacks sufficient tokens.
- **Expectation**: Transaction reverts with "Not enough balance to buy the item".

```solidity
    it("Should fail if a student tries to buy goodies without enough balance", async function () {
        const highCost = rewardAmount + 1n;

        await expect(
            altarian42.connect(addr3).buyGoodies("Laptop", highCost)
        ).to.be.revertedWith("Not enough balance to buy the item");
    });
```

3. **Empty Item Name**

- **Test**: Purchase fails if item name is empty.
- **Expectation**: Transaction reverts with "Item name cannot be empty".

```solidity
    it("Should fail if the item name is empty", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("", cost)
        ).to.be.revertedWith("Item name cannot be empty");
    });
```

4. **Zero Cost**

- **Test**: Purchase fails if cost is zero.
- **Expectation**: Transaction reverts with "Cost must be greater than zero".

```solidity
    it("Should fail if the cost is zero", async function () {
        await expect(
            altarian42.connect(addr3).buyGoodies("Pen", 0)
        ).to.be.revertedWith("Cost must be greater than zero");
    });
```

## Security Considerations

- **Reentrancy Safe**: Uses built-in functions that are safe from reentrancy attacks.
- **Input Validation**: Prevents invalid purchases and unintended token burns.
- **Open Access**: No restrictions on who can call `buyGoodies`, but balance checks are enforced.

## Potential Extensions

- **Item Catalog**: Implement a predefined list of items with fixed prices.
- **Purchase Records**: Record purchase history for each student.

## Interaction with Token Economics

- **Supply Reduction**: Burning tokens decreases total supply, potentially increasing token value.
- **Incentivization**: Encourages students to earn tokens to spend on items.