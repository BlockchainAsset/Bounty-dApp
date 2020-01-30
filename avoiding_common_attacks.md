# Avoiding Common Attacks

## ReEntrancy

ReEntrancy is solved in bountydAppv1 contract using optimistic accounting and using a different function to withdraw, which considers the problems if the contract, sending the amount is malicious.

## Timestamp Dependence

Timestamp Dependence in the contract is implemented considering all direct and indirect uses of the timestamp.

## Integer Overflow and Underflow

SafeMath Library is used in the contract to avoid this attack vector.

## DoS with (Unexpected) revert

Pull Payment System is used in the contract to avoid this attack vector.

