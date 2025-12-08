class MergeSort {
    constructor(values = []) {
        this.original = [...values];
        this.values = [...values];
        this.comparisons = 0;
        this.executionTime = 0;
    }

    sort() {
        const start = performance.now();
        this.values = this.mergeSort(this.values);
        this.executionTime = performance.now() - start;
        return this.values;
    }

    mergeSort(arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid));
        const right = this.mergeSort(arr.slice(mid));

        return this.merge(left, right);
    }

    merge(left, right) {
        let result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            this.comparisons++;
            if (left[i] < right[j]) result.push(left[i++]);
            else result.push(right[j++]);
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    getResults() {
        return {
            originalValues: this.original,
            sortedValues: this.values,
            comparisons: this.comparisons,
            swaps: 0,
            executionTime: this.executionTime
        };
    }
}

module.exports = MergeSort;
