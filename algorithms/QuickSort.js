class QuickSort {
    constructor(values = []) {
        this.original = [...values];
        this.values = [...values];
        this.comparisons = 0;
        this.swaps = 0;
        this.executionTime = 0;
    }

    sort() {
        const start = performance.now();
        this.quickSort(0, this.values.length - 1);
        this.executionTime = performance.now() - start;
        return this.values;
    }

    quickSort(low, high) {
        if (low < high) {
            let pi = this.partition(low, high);
            this.quickSort(low, pi - 1);
            this.quickSort(pi + 1, high);
        }
    }

    partition(low, high) {
        let arr = this.values;
        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            this.comparisons++;
            if (arr[j] < pivot) {
                i++;
                this.swaps++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        this.swaps++;
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
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

module.exports = QuickSort;
