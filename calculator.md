- Pressing CE clears the number currently being entered but earlier numbers/eqn are retained

- Pressing AC clears everything

- Once you press equals (=)
  - The result gets displayed on top
  - The equation starts off from the result

- If you press equals (=) but the last entry was not a number, then equals is a no-op

- Pressing '.' multiple times has no effect. It only gets entered once.

- You cannot divide by zero. The calculator will not let you enter 0 in if the
  last entry was the divide symbol (/)

- A 'Digit Limit Met' error comes up if you try to enter a number that is too wide for
  the calculator screen and the top result gets reset back to 0

# calculator
  - state
  - getEqn()
  - enterDigit()
  - enterOp()
  - equals()
  - allClear()
  - clearEntry()

# calculatorUI
  - displayEqn()
  - displayEntry()

