# Achat et burn

Les étudiants dépensent leurs tokens en goodies dans la boutique de l'école. Les tokens dépensés sont brûlés, ce qui réduit la supply totale.

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

- `cost` est en tokens entiers ; la fonction ajoute les 18 décimales.
- N'importe qui ayant un solde suffisant peut l'appeler.
- Le nom et le prix de l'article ne sont pas vérifiés par rapport à un catalogue : le contrat fait confiance à l'appelant.

## Event

```solidity
event GoodiePurchased(address indexed buyer, string item, uint256 cost);
```

## Exemple

```javascript
// Acheter un carnet à 30 tokens
await altarian42.connect(student).buyGoodies("Notebook", 30);
```

Le solde de l'étudiant et la supply totale baissent tous les deux de 30 tokens.

## Tests

Voir [`code/tests/Altarian42.js`](/code/tests/Altarian42.js) : un achat réussi, et les échecs pour solde insuffisant, nom d'article vide et coût nul.
