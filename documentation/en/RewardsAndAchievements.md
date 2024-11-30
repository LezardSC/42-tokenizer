# Rewards and Achievements Documentation

## Overview

The **Rewards and Achievements** functionality in the `Altarian42` contract allows owners to reward students with tokens for their accomplishments. This not only incentivizes student engagement but also records their achievements within the system.

## Implementation Details

#### Data Structures

##### State Variables

```solidity
    mapping(address => string[]) private studentAchievements;
```

- **studentAchievements**: Maps a student's address to an array of strings, each representing an achievement or reason for a reward.

#### Functions
1. **_rewardStudent**

**Visibility**: `internal`

**Purpose**: Mints tokens to a student and records the achievement.

```solidity
    function _rewardStudent(
        address student,
        uint256 amount,
        string memory reason
    ) internal
```

- **Parameters**:
    - `student`: The address of the student to reward.
    - `amount`: The amount of tokens to mint (without considering decimals).
    - `reason`: A description or reason for the reward.

- **Function Logic**:
    
    1. **Validation**:
        - Ensures the `student` address is valid (not zero).
        - Checks that `amount` is greater than zero.
    
    2. **Amount Adjustment**:
        - Multiplies `amount` by `10 ** 18` to account for token decimals.
    
    3. **Cap Enforcement**:
        - Ensures that minting does not exceed the total token cap.
    
    4. **Minting Tokens**:
        - Mints the calculated amount of tokens to the `student`.
    5. **Recording Achievement**:
        - Adds the `reason` to the student's list of achievements.
    6. **Event Emission**:
        - Emits the `RewardGiven` event.

- Code Snippet:

```solidity
    function _rewardStudent(
        address student,
        uint256 amount,
        string memory reason
    ) internal {
        require(student != address(0), "Invalid student address");
        require(amount > 0, "Reward amount must be greater than zero");

        uint256 amountWithDecimals = amount * (10 ** 18);
        uint256 newTotalSupply = totalSupply() + amountWithDecimals;

        require(newTotalSupply <= cap(), "Reward exceeds token cap");

        _mint(student, amountWithDecimals);
        studentAchievements[student].push(reason);
        emit RewardGiven(student, amount, reason);
    }
```

2. **getStudentAchievements**

**Visibility: `public`**

**Purpose**: Retrieves the list of achievements for a given student.

```solidity
    function getStudentAchievements(address student) public view returns (string[] memory)
```

- **Parameters**:
        - `student`: The address of the student.

- **Returns**:
    - An array of strings containing the student's achievements.

- **Function Logic**:
    - Validates the student address.
    - Returns the student's achievements from the studentAchievements mapping.

    **Code Snippet**:

```solidity
    function getStudentAchievements(address student) public view returns (string[] memory) {
        require(student != address(0), "Invalid student address");
        return studentAchievements[student];
    }
```

#### Events

**RewardGiven**

Emitted when a student is rewarded.

```solidity

    event RewardGiven(
        address indexed student,
        uint256 amount,
        string reason
    );
```

- **Parameters**:
    - `student`: The address of the rewarded student.
    - `amount`: The amount of tokens minted (without decimals).
    - `reason`: The reason for the reward.

#### Workflow Summary

1. **Submission**:
    - An owner submits a reward transaction via submitTransaction.

2. **Confirmation**:
    - Required number of owners confirm the transaction using `confirmTransaction`.
    
3. **Execution**:
    - An owner executes the transaction with `executeTransaction`, which calls `_rewardStudent`.

4. **Minting and Recording**:
    - Tokens are minted to the student.
    - The achievement is recorded.
        `RewardGiven` event is emitted.

5. **Retrieval**:
    - Anyone can retrieve a student's achievements using `getStudentAchievements`.

## Usage Example

#### Rewarding a Student

```solidity
    // Owner submits a reward transaction
    altarian42.submitTransaction(studentAddress, 50, "Completed Blockchain Project");

    // Other owners confirm the transaction
    altarian42.confirmTransaction(0);
    altarian42.connect(addr1).confirmTransaction(0);

    // Execute the transaction
    altarian42.executeTransaction(0);
```

**Retrieving Achievements**

```solidity
    // Retrieve the student's achievements
    string[] memory achievements = altarian42.getStudentAchievements(studentAddress);
```

## Important Considerations

- **Access Control**:
    - Only callable internally through the multisig execution to ensure proper authorization.

- **Cap Enforcement**:
    - Ensures that minting rewards doesn't exceed the token cap.

- **Event Emission**:
    - Facilitates tracking of rewards and achievements off-chain.

## Testing the Rewards Functionality

**Test Cases**

1. **Successful Reward and Record**

    - **Test**: Student receives tokens, and the achievement is recorded.
    - **Expectation**: Student's balance increases; achievement is retrievable.

```javascript
    it("Should reward a student and record the achievement", async function () {
        await altarian42.submitTransaction(student, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);
        await altarian42.executeTransaction(0);

        const studentBalance = await altarian42.balanceOf(student);
        expect(studentBalance).to.equal(ethers.parseUnits(rewardAmount.toString(), 18));

        const achievements = await altarian42.getStudentAchievements(student);
        expect(achievements).to.include(reason);
    });
```

2. **Invalid Student Address**

- **Test**: Rewarding an invalid address should fail.
- **Expectation**: Transaction reverts with "Invalid student address".

```javascript
    it("Should revert if student address is invalid", async function () {
        await altarian42.submitTransaction(ethers.constants.AddressZero, rewardAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Invalid student address");
    });
```

3. **Zero Reward Amount**

    - **Test**: Rewarding zero tokens should fail.
    - **Expectation**: Transaction reverts with "Reward amount must be greater than zero".

```javascript
    it("Should revert if reward amount is zero", async function () {
        await altarian42.submitTransaction(student, 0, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Reward amount must be greater than zero");
    });
```

4. **Exceeding Token Cap**

    - **Test**: Reward that exceeds the cap should fail.
    - **Expectation**: Transaction reverts with "Reward exceeds token cap".

```javascript
    it("Should not allow rewarding beyond the cap", async function () {
        const excessiveAmount = tokenCap + 1n; // Assuming tokenCap is accessible

        await altarian42.submitTransaction(student, excessiveAmount, reason);
        await altarian42.confirmTransaction(0);
        await altarian42.connect(addr1).confirmTransaction(0);

        await expect(
            altarian42.executeTransaction(0)
        ).to.be.revertedWith("Reward exceeds token cap");
    });
```

## Security Considerations

- **Access Control**: Rewards can only be issued through the multisig mechanism.
- **Input Validation**: Ensures invalid data doesn't corrupt the contract state.
- **Event Logging**: Helps in auditing and tracking rewards.

## Potential Extensions

- **Detailed Achievements**: Include timestamps or additional metadata.
- **Public Achievements**: Allow public viewing of student achievements.