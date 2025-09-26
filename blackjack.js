let cardOne = 7;
let cardTwo = 5;
let sum = cardOne + cardTwo;
let cardOneBank = 7;
let cardTwoBank = 5;
let cardThreeBank = 7;
let cardThree = 7;
sum += cardThree;

console.log ('첫번째 카드 : 7 \n');
console.log ('두번째 카드 : 5 \n');




if (sum > 21) {
console.log('You lost');
}
console.log(`You have ${sum} points`);

let bankSum = cardOneBank + cardTwoBank;
if (bankSum > 17){
    if (sum > bankSum && sum < 21)
        console.log('You win');
    
} else{
    bankSum = cardOneBank + cardTwoBank + cardThreeBank ;
    sum = cardOne + cardTwo + cardThree;
    console.log ('세번째 카드 : 7 \n');

    if (bankSum > 21 || (sum <= 21 && sum > bankSum)) {
        console.log('You win');
        } else if(bankSum == sum){
            console.log('Draw');
        }
        else {
            console.log('Bank wins');
        }
}
