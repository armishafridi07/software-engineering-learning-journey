// Water elements
const waterAmount = document.getElementById("waterAmount");
const waterProgress = document.getElementById("waterProgress");
const waterPercent = document.getElementById("waterPercent");
const goalMessage = document.getElementById("goalMessage");

const cupButton = document.getElementById("cupButton");
const bottleButton = document.getElementById("bottleButton");
const waterReset = document.getElementById("waterReset");


// Habit elements
const habitInput = document.getElementById("habitInput");
const addHabit = document.getElementById("addHabit");
const habitList = document.getElementById("habitList");
const habitMessage = document.getElementById("habitMessage");


// Calorie elements
const activity = document.getElementById("activity");
const duration = document.getElementById("duration");
const calculateButton = document.getElementById("calculateButton");
const calorieTotal = document.getElementById("calorieTotal");


// Theme
const themeButton = document.getElementById("themeButton");


// ---------------- WATER ----------------

let water = Number(localStorage.getItem("water")) || 0;

function updateWater() {

    const goal = 2500;

    let percent = (water / goal) * 100;

    if (percent > 100) {
        percent = 100;
    }

    waterAmount.textContent = water + " ml";

    waterProgress.style.width = percent + "%";

    waterPercent.textContent = Math.round(percent) + "%";


    if (water >= goal) {

        waterProgress.classList.add("goal-complete");

        goalMessage.textContent = "Goal Achieved!";

    } else {

        waterProgress.classList.remove("goal-complete");

        goalMessage.textContent = "";
    }

    localStorage.setItem("water", water);
}


cupButton.addEventListener("click", function () {

    water = water + 250;

    updateWater();
});


bottleButton.addEventListener("click", function () {

    water = water + 500;

    updateWater();
});


waterReset.addEventListener("click", function () {

    water = 0;

    updateWater();
});


updateWater();


// ---------------- HABITS ----------------

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function displayHabits() {

    habitList.innerHTML = "";

    habits.forEach(function (habit, index) {

        const habitDiv = document.createElement("div");

        habitDiv.className = "habit";

        habitDiv.innerHTML = `
            <div class="habit-info">
                <h3>${habit.name}</h3>
                <p>🔥 Streak: ${habit.streak}</p>
            </div>

            <div class="habit-buttons">
                <button onclick="logHabit(${index})">
                    Log Today
                </button>

                <button onclick="deleteHabit(${index})">
                    Delete
                </button>
            </div>
        `;

        habitList.appendChild(habitDiv);
    });

    if (habits.length >= 4) {

        addHabit.disabled = true;

        habitMessage.textContent =
            "Maximum 4 active habits allowed.";

    } else {

        addHabit.disabled = false;

        habitMessage.textContent = "";
    }

    localStorage.setItem("habits", JSON.stringify(habits));
}


addHabit.addEventListener("click", function () {

    const name = habitInput.value.trim();

    if (name === "") {

        habitMessage.textContent = "Please enter a habit.";

        return;
    }

    if (habits.length >= 4) {

        habitMessage.textContent =
            "You can only add 4 habits.";

        return;
    }

    const newHabit = {
        name: name,
        streak: 0
    };

    habits.push(newHabit);

    habitInput.value = "";

    displayHabits();
});


function logHabit(index) {

    habits[index].streak++;

    displayHabits();
}


function deleteHabit(index) {

    habits.splice(index, 1);

    displayHabits();
}


displayHabits();


// ---------------- CALORIES ----------------

let totalCalories =
    Number(localStorage.getItem("calories")) || 0;

calorieTotal.textContent = totalCalories;


calculateButton.addEventListener("click", function () {

    const rate = Number(activity.value);

    const minutes = Number(duration.value);

    if (minutes <= 0) {

        alert("Please enter a valid duration.");

        return;
    }

    const calories = rate * minutes;

    totalCalories = totalCalories + calories;

    calorieTotal.textContent = totalCalories;

    localStorage.setItem("calories", totalCalories);

    duration.value = "";
});


// ---------------- DARK MODE ----------------

themeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeButton.textContent = "Light Mode";

    } else {

        themeButton.textContent = "Dark Mode";
    }
});