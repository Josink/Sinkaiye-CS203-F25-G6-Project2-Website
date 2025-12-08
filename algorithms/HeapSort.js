class HeapSort {
    constructor(values = []) {
        this.original = [...values];
        this.values = [...values];
        this.comparisons = 0;
        this.swaps = 0;
        this.executionTime = 0;
    }

    sort() {
        const start = performance.now();
        let arr = this.values;
        let n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            this.swaps++;
            [arr[0], arr[i]] = [arr[i], arr[0]];
            this.heapify(i, 0);
        }

        this.executionTime = performance.now() - start;
        return arr;
    }

    heapify(n, i) {
        let arr = this.values;
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < n) {
            this.comparisons++;
            if (arr[left] > arr[largest]) largest = left;
        }

        if (right < n) {
            this.comparisons++;
            if (arr[right] > arr[largest]) largest = right;
        }

        if (largest !== i) {
            this.swaps++;
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            this.heapify(n, largest);
        }
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

module.exports = HeapSort;
