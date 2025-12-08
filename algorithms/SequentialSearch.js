// algorithms/SequentialSearch.js
class SequentialSearch {
    constructor(array) {
        this.array = [...array];
        this.comparisons = 0;
        this.executionTime = 0;
    }

    search(target) {
        const start = performance.now();

        for (let i = 0; i < this.array.length; i++) {
            this.comparisons++;

            if (this.array[i] === target) {
                this.executionTime = performance.now() - start;
                return i; // found
            }
        }

        this.executionTime = performance.now() - start;
        return -1; // not found
    }

    getResults(foundIndex) {
        return {
            comparisons: this.comparisons,
            executionTime: this.executionTime,
            searchIndex: foundIndex
        };
    }
}

module.exports = SequentialSearch;
