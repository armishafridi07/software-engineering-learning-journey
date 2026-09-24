
// Project 2: The E-Receipt Pipeline

// 1. The Messy Shopping Cart
const cart = [
    { title: "Laptop", price: 800, quantity: 1 },
    { title: "Mouse", price: 25, quantity: 2 },
    { title: "Keyboard", price: 0, quantity: 1 },       
    { title: "Headphones", price: -50, quantity: 1 },   
    { title: "USB Cable", price: 10, quantity: 0 },    
    { title: "Monitor", price: 200, quantity: 1 }
];


// 2. The Trash Filter


const validItems = cart.filter(item => {
    return item.price > 0 && item.quantity > 0;
});

console.log("Valid Items:");
console.log(validItems);


// 3. The Financial Breakdown


const lineItems = validItems.map(item => {
    const subtotal = item.price * item.quantity;
    const tax = subtotal * 0.05;

    return {
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        subtotal: subtotal,
        tax: tax
    };
});


// 4. The Coupon Checker


function checkCoupon(code) {
    return new Promise((resolve, reject) => {

        setTimeout(() => {
            if (code === "SAVE10") {
                resolve(10);
            } else {
                reject("Invalid coupon code");
            }
        }, 500);

    });
}


// 5. Master Totalizer


let totalSubtotal = 0;
let totalTax = 0;

lineItems.forEach(item => {
    totalSubtotal += item.subtotal;
    totalTax += item.tax;
});


// 6. Check Coupon and Generate Invoice

async function generateInvoice() {

    let discountPercent = 0;

    try {
      
        const couponCode = "SAVE10";

        discountPercent = await checkCoupon(couponCode);

        console.log("\nCoupon applied: " + discountPercent + "%");

    } catch (error) {
        console.log("\nCoupon Error: " + error);
        console.log("Continuing checkout with 0% discount.");
    }


    // Calculate discount
    const discount = totalSubtotal * (discountPercent / 100);

    // Calculate final grand total
    const grandTotal = totalSubtotal - discount + totalTax;


    // 7. Visual Invoice
    console.log("\n==============================");
    console.log("        E-RECEIPT");
    console.log("==============================");

    lineItems.forEach(item => {
        console.log(
            item.title +
            " x " +
            item.quantity +
            " = $" +
            item.subtotal.toFixed(2)
        );

        console.log(
            "Tax: $" + item.tax.toFixed(2)
        );
    });

    console.log("------------------------------");
    console.log("Subtotal: $" + totalSubtotal.toFixed(2));
    console.log("Discount: $" + discount.toFixed(2));
    console.log("Sales Tax: $" + totalTax.toFixed(2));
    console.log("------------------------------");
    console.log("Grand Total: $" + grandTotal.toFixed(2));
    console.log("==============================");
}


// Start the checkout
generateInvoice();

