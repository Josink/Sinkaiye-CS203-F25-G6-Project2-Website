class SelectionSort {
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

        for (let i = 0; i < arr.length; i++) {
            let minIndex = i;
            for (let j = i + 1; j < arr.length; j++) {
                this.comparisons++;
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex !== i) {
                this.swaps++;
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            }
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

module.exports = SelectionSort;
