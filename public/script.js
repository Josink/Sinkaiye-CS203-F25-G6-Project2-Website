function toggleSearchDropDown(){
    document.getElementById("mySearchDropDown").classList.toggle("show");
    document.getElementById("mySortDropDown").classList.remove("show");

}

function toggleSortDropDown(){
    document.getElementById("mySortDropDown").classList.toggle("show")
    document.getElementById("mySearchDropDown").classList.remove("show");

}

window.onclick = function(event) {
    if (!event.target.matches('.dropButton')) {
        var dropDowns = document.getElementsByClassName("searchDropDownContent");
        var i;
        for (i = 0; i < dropDowns.length; i++) {
            var openDropdown = dropDowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }

        var sDropDowns = document.getElementsByClassName("sortDropDownContent");
        var i;
        for (i = 0; i < sDropDowns.length; i++) {
            var openDropdown = sDropDowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }
}

function handleAlgorithmSelect(algorithmName){
    document.getElementById("mySearchDropDown").classList.remove("show");
    document.getElementById("mySortDropDown").classList.remove("show");

    showAlgorithmPrompt(algorithmName);
}

function showAlgorithmPrompt(algorithmName){
    const input = algorithmName.includes('Search') ? 'an integer for how many values you want in your array to search from': 'an integer for how many values you want in your array to sort';

    const userInput = prompt(
        `You selected: ${algorithmName}\n\nPlease enter ${input}:`
    );

    if (userInput !== null) {
        if (userInput.trim() !== '') {
            processAlgorithm(algorithmName, userInput);
        } else {
            alert('Please enter a valid input.');
            showAlgorithmPrompt(algorithmName);
        }
    }
}

function processAlgorithm(algorithmName, userInput) {
    alert(`Running ${algorithmName} with input: ${userInput}\n\nThis would now execute the ${algorithmName} algorithm.`);
}