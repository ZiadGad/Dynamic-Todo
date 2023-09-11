const checkboxes = document.querySelectorAll(".todo-text input[type='checkbox']");
const todoField = document.querySelector(".todo-field");

todoField.focus();

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
        const checkbox = event.target;
        const parentDiv = checkbox.closest(".todo-text");

        if (parentDiv) {

                if (checkbox.checked) {
                    parentDiv.classList.add("done");
                } else {
                    parentDiv.classList.remove("done");
                }
        }
    });
});