// Part 1: Simple Hardcoded Currency Conversion Script

const exchangeRateINRtoUSD = 1 / 95.24; // Fixed rate: 1 USD = 95.24 INR

// Hardcoded expenses in Indian Rupees (INR)
const expensesINR = [
    { description: "College Fees", amountINR: 50000 },
    { description: "Books & Stationeries", amountINR: 3500 },
    { description: "Transport & Canteen", amountINR: 1200 }
];

console.log("=== Part 1: Expense Conversion (INR to USD) ===");
console.log(`Fixed Exchange Rate: 1 USD = 95.24 INR\n`);

let totalINR = 0;
let totalUSD = 0;

expensesINR.forEach((item, index) => {
    const convertedUSD = item.amountINR * exchangeRateINRtoUSD;
    totalINR += item.amountINR;
    totalUSD += convertedUSD;

    console.log(`${index + 1}. ${item.description}:`);
    console.log(`   INR: ₹${item.amountINR.toFixed(2)}  -->  USD: $${convertedUSD.toFixed(2)}`);
});

console.log("\n-------------------------------------------");
console.log(`TOTAL EXPENSES:`);
console.log(`Total INR: ₹${totalINR.toFixed(2)}`);
console.log(`Total USD: $${totalUSD.toFixed(2)}`);
console.log("===========================================");