// =========================
// STATE
// =========================

let tasks =
    JSON.parse(
        localStorage.getItem("tasks")
    ) || [];

let currentFilter = "all";

let barChart = null;
let pieChart = null;

// =========================
// ELEMENTS
// =========================

const taskInput =
    document.getElementById("taskInput");

const deadlineInput =
    document.getElementById("deadlineInput");

const priorityInput =
    document.getElementById("priorityInput");

const addBtn =
    document.getElementById("addBtn");

const taskList =
    document.getElementById("taskList");

const searchInput =
    document.getElementById("searchInput");

const darkBtn =
    document.getElementById("darkBtn");

// =========================
// STORAGE
// =========================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

// =========================
// ADD TASK
// =========================

function addTask() {

    const text =
        taskInput.value.trim();

    if (!text) {

        alert(
            "Vui lòng nhập công việc!"
        );

        return;
    }

    tasks.push({

        id: Date.now(),

        text: text,

        completed: false,

        createdAt:
            new Date().toISOString(),

        completedAt: null,

        deadline:
            deadlineInput.value,

        priority:
            priorityInput.value
    });

    taskInput.value = "";
    deadlineInput.value = "";

    saveTasks();

    renderTasks();
    updateDashboard();
    renderCharts();
}

addBtn.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keypress",
    function (e) {

        if (
            e.key === "Enter"
        ) {

            addTask();
        }
    }
);

// =========================
// TOGGLE COMPLETE
// =========================

function toggleTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (!task) return;

    task.completed =
        !task.completed;

    task.completedAt =
        task.completed
            ? new Date().toISOString()
            : null;

    saveTasks();

    renderTasks();
    updateDashboard();
    renderCharts();
}

// =========================
// DELETE
// =========================

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Xóa công việc này?"
        );

    if (!confirmDelete)
        return;

    tasks =
        tasks.filter(
            t => t.id !== id
        );

    saveTasks();

    renderTasks();
    updateDashboard();
    renderCharts();
}

// =========================
// EDIT
// =========================

function editTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (!task) return;

    const newText =
        prompt(
            "Sửa công việc:",
            task.text
        );

    if (
        !newText ||
        newText.trim() === ""
    ) {

        return;
    }

    task.text =
        newText.trim();

    saveTasks();

    renderTasks();
}

// =========================
// FILTER
// =========================

function setFilter(filter) {

    currentFilter =
        filter;

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

            if (
                btn.dataset.filter ===
                filter
            ) {

                btn.classList.add(
                    "active"
                );
            }
        });

    renderTasks();
}

window.setFilter =
    setFilter;

// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    renderTasks
);

// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks =
        [...tasks];

    const keyword =
        searchInput.value
            .toLowerCase();

    filteredTasks =
        filteredTasks.filter(
            task =>
                task.text
                    .toLowerCase()
                    .includes(keyword)
        );

    if (
        currentFilter ===
        "completed"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.completed
            );
    }

    if (
        currentFilter ===
        "pending"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    !task.completed
            );
    }

    filteredTasks.forEach(
        function (task) {

            const li =
                document.createElement(
                    "li"
                );

            if (
                task.completed
            ) {

                li.classList.add(
                    "completed"
                );
            }

            const priorityText =
                task.priority ===
                "high"
                    ? "🔴 Cao"
                    : task.priority ===
                      "medium"
                    ? "🟡 Trung bình"
                    : "🟢 Thấp";

            li.innerHTML = `

            <div class="task-info">

                <div class="task-title">

                    ${task.text}

                </div>

                <div class="task-meta">

                    ⏰ ${
                        task.deadline ||
                        "Không có deadline"
                    }

                    <br>

                    ${priorityText}

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id})"
                >
                    ✓
                </button>

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})"
                >
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    🗑️
                </button>

            </div>

            `;

            taskList.appendChild(
                li
            );
        }
    );
}

// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    const completed =
        tasks.filter(
            t => t.completed
        ).length;

    document.getElementById(
        "totalTasks"
    ).textContent =
        tasks.length;

    document.getElementById(
        "doneTasks"
    ).textContent =
        completed;

    document.getElementById(
        "pendingTasks"
    ).textContent =
        tasks.length -
        completed;
}

// =========================
// CHARTS
// =========================

function renderCharts() {

    const completed =
        tasks.filter(
            t => t.completed
        ).length;

    const pending =
        tasks.length -
        completed;

    const barCtx =
        document.getElementById(
            "barChart"
        );

    const pieCtx =
        document.getElementById(
            "pieChart"
        );

    if (barChart)
        barChart.destroy();

    if (pieChart)
        pieChart.destroy();

    barChart =
        new Chart(
            barCtx,
            {
                type: "bar",

                data: {

                    labels: [
                        "Hoàn thành",
                        "Chưa xong"
                    ],

                    datasets: [
                        {

                            label:
                                "Công việc",

                            data: [
                                completed,
                                pending
                            ],

                            backgroundColor:
                                [
                                    "#22c55e",
                                    "#ef4444"
                                ]
                        }
                    ]
                },

                options: {

                    responsive:
                        true
                }
            }
        );

    pieChart =
        new Chart(
            pieCtx,
            {
                type: "pie",

                data: {

                    labels: [
                        "Hoàn thành",
                        "Chưa xong"
                    ],

                    datasets: [
                        {

                            data: [
                                completed,
                                pending
                            ],

                            backgroundColor:
                                [
                                    "#22c55e",
                                    "#ef4444"
                                ]
                        }
                    ]
                },

                options: {

                    responsive:
                        true
                }
            }
        );
}

// =========================
// DARK MODE
// =========================

darkBtn.addEventListener(
    "click",
    function () {

        document.body
            .classList.toggle(
                "light"
            );
    }
);

// =========================
// GLOBAL
// =========================

window.toggleTask =
    toggleTask;

window.deleteTask =
    deleteTask;

window.editTask =
    editTask;

// =========================
// START
// =========================

renderTasks();

updateDashboard();

renderCharts();
