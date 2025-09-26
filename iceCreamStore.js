
let iceCreamFlavors = [
    { name: "Chocolate", type: "Chocolate", price: 2 },
    { name: "Strawberry", type: "Fruit", price: 1 },
    { name: "Vanilla", type: "Vanilla", price: 2 },
    { name: "Pistachio", type: "Nuts", price: 1.5 },
    { name: "Neapolitan", type: "Chocolate", price: 2},
    { name: "MintChip", type: "Chocolate", price: 1.5 },
    { name: "Raspberry", type: "Fruit", price: 1},
    ];
// { scoops: [], total: }
let transactions = []
// { scoops: [], total: }
transactions.push({ scoops: ["Chocolate", "Vanilla", "MintChip"], total: 5.5 })
transactions.push({ scoops: ["Raspberry", "Strawberry"], total: 2 })
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 })
// 수익 계산
const total = transactions.reduce((acc, curr) => acc + curr.total, 0);
console.log(`You've made ${total} $ today`); // You've made 11.5 $ toda

// 각 맛의 판매량
let flavorDistribution = transactions.reduce((acc, curr) => {
    curr.scoops.forEach(scoop => {
    if (!acc[scoop]) {
    acc[scoop] = 0;
    }
    acc[scoop]++;
    })
    return acc;
    }, {}) // { Chocolate: 1, Vanilla: 3, Mint Chip: 1, Raspberry: 1, Strawberry: 1 }
    console.log(flavorDistribution);


// 가장 많이 팔린 맛 찾기
let values = Object.values(flavorDistribution);
let keys = Object.keys(flavorDistribution);

let maxCount = values[0];
let maxFlavor = keys[0]; 

for (let i = 1; i < values.length; i++) {
  if (values[i] > maxCount) {
    maxCount = values[i];
    maxFlavor = keys[i];
  }
}
console.log(`가장 많이 팔린 맛은 ${maxFlavor} (${maxCount}개) 입니다.`);

