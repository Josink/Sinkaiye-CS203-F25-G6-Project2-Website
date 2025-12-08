let selectedAlgorithm = '';

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
    selectedAlgorithm = algorithmName;

    document.getElementById("mySearchDropDown").classList.remove("show");
    document.getElementById("mySortDropDown").classList.remove("show");

    document.getElementById("formTitle").textContent = `Configure ${algorithmName}`;
    document.getElementById("inputForm").style.display = "block";
    document.getElementById("inputForm").scrollIntoView({behavior: "smooth"});
}

function cancelForm(){
    document.getElementById("inputForm").style.display = "none";
    document.getElementById("algorithmForm").reset();
    selectedAlgorithm = "";
}

document.getElementById("algorithmForm").addEventListener('submit', function (e){
    e.preventDefault();

    const attemptName = document.getElementById("attemptName").value;
    const valueCount = document.getElementById("valueCount").value;

    if(attemptName && valueCount) {
        fetch('/run-algorithm',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                algorithmName: selectedAlgorithm,
                attemptName: attemptName,
                numValues: valueCount,
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.redirect){
                    window.location.href = data.redirect;
                }
            })
    }
})
