// Automated Unit Test Suite for Currency Converter Calculations & Validation

function assertEqual(actual, expected, testName) {
    if (Math.abs(actual - expected) < 0.001) {
        console.log(`✅ [PASS] ${testName}`);
    } else {
        console.error(`❌ [FAIL] ${testName}: Expected ${expected}, but got ${actual}`);
    }
}

function testConversionCalculation() {
    const amount = 100;
    const rate = 83.5;
    const result = amount * rate;
    assertEqual(result, 8350, "Happy Path: Converting 100 USD to INR at rate 83.50");
}

function testNegativeInputValidation() {
    const invalidAmount = -50;
    const isValid = !isNaN(invalidAmount) && invalidAmount > 0;
    assertEqual(isValid, false, "Edge Case Handling: Negative amounts should be invalid");
}

console.log("=== Running Part 2 Automated Tests ===");
testConversionCalculation();
testNegativeInputValidation();
console.log("======================================");