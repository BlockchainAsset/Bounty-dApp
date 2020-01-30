# Design Pattern Decision

## Modifiers (Circuit Breaker)

I have used custom contracts which makes sure that certain functions like adding a new resolver, etc is only done by the Owner.

Similarly, using modifiers to pause temporarily or permanently the contract operations.

## Internal

Some functions are internal inorder to avoid outside access to these function.

## Requires (Fail Early Fail Loud)

Multiple require statements are written to make sure that only the concerned person is able to call the function. Also, only the people with the required conditions/situation can call those function.

## Withdrawal

Withdrawal is designed in such a way to avoid ReEntrance attack and thus have done optimistic accounting, along with state change before sending the actual transaction.

## To Do :

### Separate Contract for Storage

### Upgradeable Contract Structure