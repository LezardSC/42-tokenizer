# Purchasing and burning

Students spend their tokens on goodies from the school shop. Spent tokens are burned, which lowers the total supply.

## `buyGoodies`

```solidity
function buyGoodies(string memory item, uint256 cost) public {
    require(bytes(item).length > 0, "Item name cannot be empty");
    require(cost > 0, "Cost must be greater than zero");
    require(balanceOf(msg.sender) >= cost * (10 ** 18), "Not enough balance to buy the item");

    _burn(msg.sender, cost * (10 ** 18));
    emit GoodiePurchased(msg.sender, item, cost);
}
```

- `cost` is in whole tokens; the function adds the 18 decimals.
- Anyone with enough balance can call it.
- The item name and price are not checked against a catalog: the contract trusts the caller.

## Event

```solidity
event GoodiePurchased(address indexed buyer, string item, uint256 cost);
```

## Example

```javascript
// Buy a notebook for 30 tokens
await altarian42.connect(student).buyGoodies("Notebook", 30);
```

The student's balance and the total supply both drop by 30 tokens.

## Tests

See [`code/tests/Altarian42.js`](/code/tests/Altarian42.js): a successful purchase, and failures for insufficient balance, empty item name and zero cost.
