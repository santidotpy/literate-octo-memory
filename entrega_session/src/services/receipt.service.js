import receipt from "receipt";

receipt.config.currency = "$";
receipt.config.width = 60;
receipt.config.ruler = "-";
const storeName = "everest";
// date DD/MM/YYYY HH:mm
const currentDate = new Date().toLocaleString("en-GB");
// random 12 digits number
const orderNumber = Math.floor(Math.random() * 1000000000000);

const paymentMethod = [
  "VISA **** 1234",
  "MASTERCARD **** 5678",
  "AMEX **** 9012",
];

export const generateReceipt = (products, total, email) => {
  const output = receipt.create([
    {
      type: "text",
      value: [
        `${storeName.toUpperCase()} STORE`,
        "10 Terry Ave N, Seattle 98109, WA",
        `${storeName}@store.com`,
        `www.${storeName}.com`,
      ],
      align: "center",
    },
    { type: "empty" },
    {
      type: "properties",
      lines: [
        { name: "Customer", value: email },
        { name: "Order Number", value: orderNumber },
        { name: "Date", value: currentDate },
      ],
    },
    {
      type: "table",
      lines: products.map((prod) => {
        return {
          item: prod.productName,
          qty: prod.quantity,
          cost: prod.price * 100,
        };
      }),
    },
    { type: "text", value: "TOTAL: $" + total, align: "right" },
    { type: "empty" },
    {
      type: "properties",
      lines: [
        {
          name: "PAYMENT METHOD",
          value:
            paymentMethod[Math.floor(Math.random() * paymentMethod.length)],
        },
      ],
    },
    { type: "empty" },
    { type: "text", value: "Thank you for your purchase!", align: "center" },
    { type: "empty" },
    {
      type: "text",
      value: "Made with ❤️ with JS.",
      align: "center",
      padding: 5,
    },
  ]);
  return output;
};

// const ticket = generateReceipt(
//   [
//     {
//       name: "Coca Cola",
//       quantity: 2,
//       price: 1.5,
//     },
//     {
//       name: "Fanta",
//       quantity: 1,
//       price: 1.5,
//     },
//     {
//       name: "Sprite",
//       quantity: 1,
//       price: 1.5,
//     },
//   ],
//   6
// );

// console.log(ticket);
