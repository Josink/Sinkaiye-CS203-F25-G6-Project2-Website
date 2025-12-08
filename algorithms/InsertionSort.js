class InsertionSort {
    constructor(values = []) {
        this.original = [...values];
        this.values = [...values];
        this.comparisons = 0;
        this.swaps = 0;
        this.executionTime = 0;
    }

    sort() {
        const start = performance.now();
        const arr = this.values;

        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;

            while (j >= 0) {
                this.comparisons++;
                if (arr[j] > key) {
                    arr[j + 1] = arr[j];
                    this.swaps++;
                    j--;
                } else break;
            }
            arr[j + 1] = key;
        }

        this.executionTime = performance.now() - start;
        return arr;
    }

    getResults() {
        return {
            originalValues: this.original,
            sortedValues: this.values,
            comparisons: this.comparisons,
            swaps: this.swaps,
            executionTime: this.executionTime
        };
    }
}

module.exports = InsertionSort;
