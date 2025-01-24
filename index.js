import { createReactiveArray } from "./reactiveArray.js";

// DOM Elements
const choreInput = document.getElementById("chore-input");
const addBtn = document.getElementById("btn-add");
const deleteBtn = document.getElementById("btn-delete");
const choresContainer = document.getElementById("chores");

// Constants
const STORAGE_KEY = "chores-list";
const MAX_CHORE_LENGTH = 100;

// Initialize event listeners
function initializeEventListeners() {
    if (!choreInput || !addBtn || !deleteBtn || !choresContainer) {
        throw new Error("Required DOM elements not found");
    }

    choreInput.addEventListener("keydown", onChoreSubmit);
    addBtn.addEventListener("click", onChoreSubmit);
    deleteBtn.addEventListener("click", onDeleteBtnClick);
    choresContainer.addEventListener("click", onChoreClick);
}

// Load chores from localStorage
function loadChores() {
    try {
        const savedChores = localStorage.getItem(STORAGE_KEY);
        if (savedChores) {
            const parsedChores = JSON.parse(savedChores);
            parsedChores.forEach((chore) => chores.push(chore.text));
        }
    } catch (error) {
        console.error("Error loading chores from localStorage:", error);
    }
}

// Save chores to localStorage
function saveChores() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...chores]));
    } catch (error) {
        console.error("Error saving chores to localStorage:", error);
    }
}

// Validate chore input
function validateChore(chore) {
    if (typeof chore !== "string") {
        throw new Error("Chore must be a string");
    }

    const trimmedChore = chore.trim();
    if (trimmedChore.length === 0) {
        throw new Error("Chore cannot be empty");
    }

    if (trimmedChore.length > MAX_CHORE_LENGTH) {
        throw new Error(
            `Chore cannot be longer than ${MAX_CHORE_LENGTH} characters`,
        );
    }

    return trimmedChore;
}

// Event Handlers
function onChoreSubmit(event) {
    if (event.key === "Enter" || event.target === addBtn) {
        try {
            const chore = validateChore(choreInput.value);
            chores.push(chore);
            choreInput.value = "";
            choreInput.focus();
        } catch (error) {
            alert(error.message);
        }
    }
}

function onDeleteBtnClick() {
    if (chores.length > 0) {
        const confirmed = confirm(
            "Are you sure you want to delete all chores?",
        );
        if (confirmed) {
            choreInput.value = "";
            chores.clear();
        }
    }
}

function onChoreClick(event) {
    const choreElement = event.target.closest(".chore");
    if (choreElement) {
        const index = Array.from(choresContainer.children).indexOf(
            choreElement,
        );
        if (index !== -1) {
            chores.toggleComplete(index);
        }
    }
}

// Render functions
function renderChores() {
    const choresElements = [...chores].reduce((html, chore, index) => {
        const completedClass = chore.completed ? "completed" : "";
        return html + `
            <div class="chore rounded flex-center ${completedClass}" 
                 role="listitem"
                 tabindex="0"
                 aria-label="${chore.text} - ${
            chore.completed ? "Completed" : "Not completed"
        }"
            >
                ${escapeHtml(chore.text)}
            </div>`;
    }, "");

    choresContainer.innerHTML = choresElements;
    saveChores();
}

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Update handler
function onChoresUpdate(action, elements) {
    console.log(`Chores ${action}:`, elements);
    renderChores();
}

// Initialize app
const chores = createReactiveArray(onChoresUpdate);
try {
    initializeEventListeners();
    loadChores();
} catch (error) {
    console.error("Error initializing app:", error);
    alert("There was an error initializing the app. Please refresh the page.");
}
