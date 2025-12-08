let selectedAlgorithm = '';

// Toggle search dropdown
function toggleSearchDropDown() {
    document.getElementById("mySearchDropDown").classList.toggle("show");
    document.getElementById("mySortDropDown").classList.remove("show");
}

// Toggle sort dropdown
function toggleSortDropDown() {
    document.getElementById("mySortDropDown").classList.toggle("show");
    document.getElementById("mySearchDropDown").classList.remove("show");
}

// Close dropdowns if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.dropButton')) {
        // Close search dropdown
        const dropDowns = document.getElementsByClassName("searchDropDownContent");
        for (let i = 0; i < dropDowns.length; i++) {
            dropDowns[i].classList.remove("show");
        }

        // Close sort dropdown
        const sDropDowns = document.getElementsByClassName("sortDropDownContent");
        for (let i = 0; i < sDropDowns.length; i++) {
            sDropDowns[i].classList.remove("show");
        }
    }
}

// Called when user selects an algorithm
function handleAlgorithmSelect(algorithmName) {
    selectedAlgorithm = algorithmName;

    // Hide dropdowns
    document.getElementById("mySearchDropDown").classList.remove("show");
    document.getElementById("mySortDropDown").classList.remove("show");

    // Update form title
    document.getElementById("formTitle").textContent = `Configure ${algorithmName}`;

    // Show form
    const inputForm = document.getElementById("inputForm");
    inputForm.style.display = "block";
    inputForm.scrollIntoView({ behavior: "smooth" });

    // Set hidden input value
    document.getElementById('algorithmName').value = algorithmName;
}

// Cancel form and reset fields
function cancelForm() {
    const inputForm = document.getElementById("inputForm");
    inputForm.style.display = "none";
    document.getElementById("algorithmForm").reset();
    selectedAlgorithm = '';
}
