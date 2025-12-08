// algorithms/BubbleSort.js
class BubbleSort {
    constructor(values = []) {
        this.original = [...values]; // Store original copy
        this.values = [...values];   // Working copy for sorting
        this.comparisons = 0;
        this.swaps = 0;
        this.executionTime = 0;
    }

    sort() {
        const start = performance.now();
        const arr = this.values;

        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                this.comparisons++;

                if (arr[j] > arr[j + 1]) {
                    this.swap(arr, j, j + 1);
                }
            }
        }

        this.executionTime = performance.now() - start;
        return arr; // required for fallback
    }

    swap(arr, i, j) {
        this.swaps++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    getResults() {
        return {
            originalValues: this.original,
            sortedValues: [...this.values], // <-- ensure array copy returned
            comparisons: this.comparisons,
            swaps: this.swaps,
            executionTime: this.executionTime
        };
    }
}

module.exports = BubbleSort;
