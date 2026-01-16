// utils/generateArray.js
function generateRandomArray(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(Math.floor(Math.random() * 10000));
    }
    return arr;
}

module.exports = generateRandomArray;
