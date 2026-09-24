// Getting HTML elements
const greeting = document.getElementById("greeting");
const clock = document.getElementById("clock");

const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");

const timer = document.getElementById("timer");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");


// CLOCK AND GREETING 

function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let greetingText;

    if (hours >= 5 && hours < 12) {
        greetingText = "Good Morning";
    } 
    else if (hours >= 12 && hours < 17) {
        greetingText = "Good Afternoon";
    } 
    else {
        greetingText = "Good Evening";
    }

    greeting.textContent = greetingText;

    let period = hours >= 12 ? "PM" : "AM";

    let displayHours = hours % 12;

    if (displayHours === 0) {
        displayHours = 12;
    }

    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    clock.textContent =
        displayHours + ":" + minutes + ":" + seconds + " " + period;
}

updateClock();

setInterval(updateClock, 1000);


//  TODO LIST 

addButton.addEventListener("click", addTask);

function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        taskMessage.textContent = "Please enter a task.";
        return;
    }

    if (taskList.children.length >= 3) {
        taskMessage.textContent = "You can only have 3 active tasks.";
        return;
    }

    const li = document.createElement("li");

    const taskName = document.createElement("span");
    taskName.textContent = taskText;

    const buttons = document.createElement("div");
    buttons.className = "task-buttons";

    const completeButton = document.createElement("button");
    completeButton.textContent = "Done";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    completeButton.addEventListener("click", function () {
        taskName.classList.toggle("completed");
    });

    deleteButton.addEventListener("click", function () {
        li.remove();
        taskMessage.textContent = "";
    });

    buttons.appendChild(completeButton);
    buttons.appendChild(deleteButton);

    li.appendChild(taskName);
    li.appendChild(buttons);

    taskList.appendChild(li);

    taskInput.value = "";
    taskMessage.textContent = "";
}


//- POMODORO TIMER 

let timeLeft = 30 * 60;
let timerInterval = null;

function showTime() {

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    timer.textContent = minutes + ":" + seconds;
}

startButton.addEventListener("click", function () {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {

        if (timeLeft > 0) {

            timeLeft--;
            showTime();

        } else {

            clearInterval(timerInterval);
            timerInterval = null;

            timeLeft = 30 * 60;
            showTime();
        }

    }, 1000);
});


pauseButton.addEventListener("click", function () {

    clearInterval(timerInterval);
    timerInterval = null;
});


resetButton.addEventListener("click", function () {

    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = 30 * 60;
    showTime();
});


showTime();