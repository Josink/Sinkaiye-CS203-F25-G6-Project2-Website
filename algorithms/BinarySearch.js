// algorithms/BinarySearch.js
class BinarySearch {
    constructor(array) {
        this.array = [...array];          // binary search expects sorted array
        this.comparisonCount = 0;
        this.executionTime = 0;
    }

    search(target) {
        let left = 0;
        let right = this.array.length - 1;

        const start = performance.now();

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            this.comparisonCount++;

            if (this.array[mid] === target) {
                this.executionTime = performance.now() - start;
                return mid;
            }

            if (this.array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        this.executionTime = performance.now() - start;
        return -1;
    }

    getResults(foundIndex) {
        return {
            comparisons: this.comparisonCount,
            executionTime: this.executionTime,
            searchIndex: foundIndex
        };
    }
}

module.exports = BinarySearch;
