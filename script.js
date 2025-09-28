// Navigation functionality
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active state in navigation
        document.querySelector('.nav-links a.active').classList.remove('active');
        this.classList.add('active');
        
        // Show the selected tool section
        const toolId = this.getAttribute('data-tool');
        document.querySelector('.tool-section.active').classList.remove('active');
        document.getElementById(`${toolId}-section`).classList.add('active');
    });
});

// Todo List functionality
const taskInput = document.querySelector(".task-input input"),
    filters = document.querySelectorAll(".filters span"),
    clearAll = document.querySelector(".clear-btn"),
    taskBox = document.querySelector(".task-box");

let editId,
    isEditTask = false,
    todos = JSON.parse(localStorage.getItem("todo-list")) || [];

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

function showTodo(filter) {
    let liTag = "";
    if(todos) {
        todos.forEach((todo, id) => {
            let completed = todo.status == "completed" ? "checked" : "";
            if(filter == todo.status || filter == "all") {
                liTag += `<li class="task">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
            }
        });
    }
    taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
    taskBox.offsetHeight >= 300 ? taskBox.classList.add("overflow") : taskBox.classList.remove("overflow");
}
showTodo("all");

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if(e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.lastElementChild;
    if(selectedTask.checked) {
        taskName.classList.add("checked");
        todos[selectedTask.id].status = "completed";
    } else {
        taskName.classList.remove("checked");
        todos[selectedTask.id].status = "pending";
    }
    localStorage.setItem("todo-list", JSON.stringify(todos))
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    todos.splice(deleteId, 1);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(filter);
}

clearAll.addEventListener("click", () => {
    isEditTask = false;
    todos.splice(0, todos.length);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
});

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if(e.key == "Enter" && userTask) {
        if(!isEditTask) {
            todos = !todos ? [] : todos;
            let taskInfo = {name: userTask, status: "pending"};
            todos.push(taskInfo);
        } else {
            isEditTask = false;
            todos[editId].name = userTask;
        }
        taskInput.value = "";
        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo(document.querySelector("span.active").id);
    }
});

// Password Generator functionality
const lengthSlider = document.querySelector(".pass-length input"),
    options = document.querySelectorAll(".option input"),
    copyIcon = document.querySelector(".input-box span"),
    passwordInput = document.querySelector(".input-box input"),
    passIndicator = document.querySelector(".pass-indicator"),
    generateBtn = document.querySelector(".generate-btn");

const characters = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "^!$%&|[](){}:;.,*+-#@<>~",
};

const generatePassword = () => {
    let staticPassword = "",
        randomPassword = "",
        excludeDuplicate = false,
        passLength = lengthSlider.value;

    options.forEach((option) => {
        if (option.checked) {
            if (option.id !== "exc-duplicate" && option.id !== "spaces") {
                staticPassword += characters[option.id];
            } else if (option.id === "spaces") {
                staticPassword += `  ${staticPassword}  `;
            } else {
                excludeDuplicate = true;
            }
        }
    });

    for (let i = 0; i < passLength; i++) {
        let randomChar =
            staticPassword[Math.floor(Math.random() * staticPassword.length)];
        if (excludeDuplicate) {
            !randomPassword.includes(randomChar) || randomChar == " "
                ? (randomPassword += randomChar)
                : i--;
        } else {
            randomPassword += randomChar;
        }
    }
    passwordInput.value = randomPassword;
};


const updatePassIndicator = () => {
    passIndicator.id =
        lengthSlider.value <= 8
            ? "weak"
            : lengthSlider.value <= 16
            ? "medium"
            : "strong";
};

const updateSlider = () => {
    document.querySelector(".pass-length span").innerText = lengthSlider.value;
    generatePassword();
    updatePassIndicator();
};
updateSlider();

const copyPassword = () => {
    navigator.clipboard.writeText(passwordInput.value);
    copyIcon.innerText = "check";
    copyIcon.style.color = "#4285F4";
    setTimeout(() => {
        copyIcon.innerText = "copy_all";
        copyIcon.style.color = "#707070";
    }, 1500);
};

copyIcon.addEventListener("click", copyPassword);
lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);

// QR Code Generator functionality
const qrWrapper = document.querySelector(".qr-container"),
    qrInput = qrWrapper.querySelector(".qr-form input"),
    generateQrBtn = qrWrapper.querySelector(".qr-form button"),
    qrImg = qrWrapper.querySelector(".qr-code img"),
    downloadQrBtn = qrWrapper.querySelector("#download-qr-btn");
let preValue;

generateQrBtn.addEventListener("click", () => {
    let qrValue = qrInput.value.trim();
    if(!qrValue || preValue === qrValue) return;
    preValue = qrValue;
    generateQrBtn.innerText = "Generating QR Code...";
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`;
    qrImg.addEventListener("load", () => {
        qrWrapper.classList.add("active");
        generateQrBtn.innerText = "Generate QR Code";
        downloadQrBtn.style.display = "block";
    });
});

qrInput.addEventListener("keyup", () => {
    if(!qrInput.value.trim()) {
        qrWrapper.classList.remove("active");
        preValue = "";
        downloadQrBtn.style.display = "none";
    }
});

// Download QR Code functionality
downloadQrBtn.addEventListener("click", () => {
    if (!qrImg.src) {
        showToast("Please generate a QR code first", "error");
        return;
    }

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = qrImg.src;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast("QR code downloaded successfully!");
});

// Age Calculator functionality
function getage() {
    let d1 = document.getElementById("date").value;
    let m1 = document.getElementById("month").value;
    let y1 = document.getElementById("year").value;

    if(!d1 || !m1 || !y1) {
        document.getElementById("age").innerHTML = "Please enter all fields";
        return;
    }

    let date = new Date();
    let d2 = date.getDate();
    let m2 = 1 + date.getMonth();
    let y2 = date.getFullYear();
    let month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (d1 > d2) {
        d2 = d2 + month[m2 - 1];
        m2 = m2 - 1;
    }
    if (m1 > m2) {
        m2 = m2 + 12;
        y2 = y2 - 1;
    }
    var d = d2 - d1;
    var m = m2 - m1;
    var y = y2 - y1;

    document.getElementById("age").innerHTML =
        `Your Age is ${y} Years ${m} Months ${d} Days`;
}

// Academic Calculator functionality
// Tab navigation
function openTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to the clicked tab
    event.currentTarget.classList.add('active');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    // Set icon based on type
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.className = 'toast error';
    } else {
        icon.className = 'fas fa-check-circle';
        toast.className = 'toast';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// School Marks Calculations
function calculateTenthPercentage() {
    const total = parseFloat(document.getElementById("tenthTotal").value);
    const obtained = parseFloat(document.getElementById("tenthObtained").value);
    
    if (isNaN(total) || isNaN(obtained)) {
        showToast("Please enter valid numbers for both fields.", "error");
        return;
    }
    
    if (total <= 0) {
        showToast("Total marks must be greater than zero.", "error");
        return;
    }
    
    if (obtained > total) {
        showToast("Obtained marks cannot be greater than total marks.", "error");
        return;
    }
    
    const percentage = (obtained / total) * 100;
    
    document.getElementById("tenthResult").innerHTML = `
        <p><b><i class="fas fa-total"></i> Total Marks:</b> ${total}</p>
        <p><b><i class="fas fa-star"></i> Obtained Marks:</b> ${obtained}</p>
        <p><b><i class="fas fa-percentage"></i> Percentage:</b> <span style="color: var(--primary-color); font-size: 1.2em;">${percentage.toFixed(2)}%</span></p>
        <p><b><i class="fas fa-graduation-cap"></i> Grade:</b> ${getGrade(percentage)}</p>
    `;
    document.getElementById("tenthResult").style.display = "block";
    showToast("10th percentage calculated successfully!");
}

function calculateTwelfthPercentage() {
    const total = parseFloat(document.getElementById("twelfthTotal").value);
    const obtained = parseFloat(document.getElementById("twelfthObtained").value);
    
    if (isNaN(total) || isNaN(obtained)) {
        showToast("Please enter valid numbers for both fields.", "error");
        return;
    }
    
    if (total <= 0) {
        showToast("Total marks must be greater than zero.", "error");
        return;
    }
    
    if (obtained > total) {
        showToast("Obtained marks cannot be greater than total marks.", "error");
        return;
    }
    
    const percentage = (obtained / total) * 100;
    
    document.getElementById("twelfthResult").innerHTML = `
        <p><b><i class="fas fa-total"></i> Total Marks:</b> ${total}</p>
        <p><b><i class="fas fa-star"></i> Obtained Marks:</b> ${obtained}</p>
        <p><b><i class="fas fa-percentage"></i> Percentage:</b> <span style="color: var(--primary-color); font-size: 1.2em;">${percentage.toFixed(2)}%</span></p>
        <p><b><i class="fas fa-graduation-cap"></i> Grade:</b> ${getGrade(percentage)}</p>
    `;
    document.getElementById("twelfthResult").style.display = "block";
    showToast("12th percentage calculated successfully!");
}

// CGPA Calculator Functions
function calculateCGPA() {
    const sgpaSum = parseFloat(document.getElementById("cgpaSgpaSum").value);
    const semesters = parseInt(document.getElementById("cgpaSemesters").value);
    
    if (isNaN(sgpaSum)) {
        showToast("Please enter valid SGPA sum.", "error");
        return;
    }
    
    if (isNaN(semesters)) {
        showToast("Please enter valid number of semesters.", "error");
        return;
    }
    
    if (semesters <= 0) {
        showToast("Number of semesters must be greater than zero.", "error");
        return;
    }
    
    const cgpa = sgpaSum / semesters;
    
    // Show progress bar
    document.getElementById("cgpaProgress").style.display = "block";
    const progressBar = document.getElementById("cgpaProgressBar");
    
    // Animate progress bar
    let width = 0;
    const targetWidth = (cgpa / 10 * 100);
    const interval = setInterval(() => {
        if (width >= targetWidth) {
            clearInterval(interval);
        } else {
            width++;
            progressBar.style.width = width + "%";
            progressBar.textContent = width + "%";
        }
    }, 20);
    
    document.getElementById("cgpaResult").innerHTML = `
        <p><b><i class="fas fa-plus-circle"></i> Sum of SGPA:</b> ${sgpaSum.toFixed(2)}</p>
        <p><b><i class="fas fa-list-ol"></i> Number of Semesters:</b> ${semesters}</p>
        <p><b><i class="fas fa-calculator"></i> CGPA (out of 10.0):</b> <span style="font-size: 1.2em; color: var(--primary-color);">${cgpa.toFixed(2)}</span></p>
        <p><b><i class="fas fa-percentage"></i> Equivalent Percentage:</b> <span style="color: var(--primary-color);">${(cgpa * 9.5).toFixed(2)}%</span></p>
        <p><b><i class="fas fa-graduation-cap"></i> Grade:</b> ${getGrade(cgpa * 9.5)}</p>
    `;
    document.getElementById("cgpaResult").style.display = "block";
    showToast("CGPA calculated successfully!");
}

// SPPU CGPA to Percentage Conversion
function convertSppuCgpaToPercentage() {
    const cgpa = parseFloat(document.getElementById("cgpaInput").value);
    
    if (isNaN(cgpa)) {
        showToast("Please enter a valid CGPA.", "error");
        return;
    }
    
    if (cgpa < 0 || cgpa > 10) {
        showToast("CGPA must be between 0 and 10.", "error");
        return;
    }
    
    let percentage, grade, formula;
    
    if (cgpa >= 9.5) {
        // O grade
        percentage = (20 * cgpa) - 100;
        grade = "O (Outstanding)";
        formula = "20 × CGPA - 100";
    } else if (cgpa >= 8.25) {
        // A+ grade
        percentage = (12 * cgpa) - 25;
        grade = "A+ (Excellent)";
        formula = "12 × CGPA - 25";
    } else if (cgpa >= 6.75) {
        // A grade
        percentage = (10 * cgpa) - 7.5;
        grade = "A (Very Good)";
        formula = "10 × CGPA - 7.5";
    } else if (cgpa >= 5.75) {
        // B+ grade
        percentage = (5 * cgpa) + 26.25;
        grade = "B+ (Good)";
        formula = "5 × CGPA + 26.25";
    } else if (cgpa >= 5.25) {
        // B grade
        percentage = (10 * cgpa) - 2.5;
        grade = "B (Above Average)";
        formula = "10 × CGPA - 2.50";
    } else if (cgpa >= 4.75) {
        // C grade
        percentage = (10 * cgpa) - 2.5;
        grade = "C (Average)";
        formula = "10 × CGPA - 2.50";
    } else if (cgpa >= 4.0) {
        // D grade
        percentage = (6.6 * cgpa) + 13.6;
        grade = "D (Pass)";
        formula = "6.6 × CGPA + 13.6";
    } else {
        // Fail
        percentage = 0;
        grade = "F (Fail)";
        formula = "Not applicable (Fail)";
    }
    
    // Ensure percentage doesn't exceed 100
    percentage = Math.min(percentage, 100);
    
    document.getElementById("cgpaConversionResult").innerHTML = `
        <p><b><i class="fas fa-calculator"></i> CGPA:</b> ${cgpa.toFixed(2)}</p>
        <p><b><i class="fas fa-percentage"></i> Equivalent Percentage:</b> <span style="color: var(--primary-color); font-size: 1.2em;">${percentage.toFixed(2)}%</span></p>
        <p><b><i class="fas fa-graduation-cap"></i> Grade:</b> ${grade}</p>
        <p><b><i class="fas fa-square-root-alt"></i> Formula Used:</b> ${formula}</p>
    `;
    document.getElementById("cgpaConversionResult").style.display = "block";
    showToast("CGPA converted to percentage successfully!");
}

function downloadSppuCgpaConversionResult() {
    const cgpa = document.getElementById("cgpaInput").value;
    const resultDiv = document.getElementById("cgpaConversionResult");
    
    if (resultDiv.style.display !== "block") {
        showToast("Please convert CGPA first.", "error");
        return;
    }
    
    const resultText = resultDiv.textContent;
    const lines = resultText.split('\n').filter(line => line.trim() !== '');
    
    const content = `SPPU CGPA to Percentage Conversion\n\n` +
                   `${lines[0]}\n` +
                   `${lines[1]}\n` +
                   `${lines[2]}\n` +
                   `${lines[3]}\n\n` +
                   `Calculated on: ${new Date().toLocaleString()}`;
    
    downloadText(content, "sppu_cgpa_conversion_result.txt");
    showToast("CGPA conversion result downloaded!");
}

// Get grade based on percentage
function getGrade(percentage) {
    if (percentage >= 90) return "O (Outstanding)";
    if (percentage >= 80) return "A+ (Excellent)";
    if (percentage >= 70) return "A (Very Good)";
    if (percentage >= 60) return "B+ (Good)";
    if (percentage >= 50) return "B (Above Average)";
    if (percentage >= 40) return "C (Average)";
    return "F (Fail)";
}

// Download functions
function downloadTenthResult() {
    const total = document.getElementById("tenthTotal").value;
    const obtained = document.getElementById("tenthObtained").value;
    const resultDiv = document.getElementById("tenthResult");
    
    if (resultDiv.style.display !== "block") {
        showToast("Please calculate the result first.", "error");
        return;
    }
    
    const percentage = (obtained / total) * 100;
    const grade = getGrade(percentage);
    
    const content = `10th Standard Marks Calculation\n\n` +
                   `Total Marks: ${total}\n` +
                   `Obtained Marks: ${obtained}\n` +
                   `Percentage: ${percentage.toFixed(2)}%\n` +
                   `Grade: ${grade}\n\n` +
                   `Calculated on: ${new Date().toLocaleString()}`;
    
    downloadText(content, "10th_marks_result.txt");
    showToast("10th result downloaded!");
}

function downloadTwelfthResult() {
    const total = document.getElementById("twelfthTotal").value;
    const obtained = document.getElementById("twelfthObtained").value;
    const resultDiv = document.getElementById("twelfthResult");
    
    if (resultDiv.style.display !== "block") {
        showToast("Please calculate the result first.", "error");
        return;
    }
    
    const percentage = (obtained / total) * 100;
    const grade = getGrade(percentage);
    
    const content = `12th Standard Marks Calculation\n\n` +
                   `Total Marks: ${total}\n` +
                   `Obtained Marks: ${obtained}\n` +
                   `Percentage: ${percentage.toFixed(2)}%\n` +
                   `Grade: ${grade}\n\n` +
                   `Calculated on: ${new Date().toLocaleString()}`;
    
    downloadText(content, "12th_marks_result.txt");
    showToast("12th result downloaded!");
}

function downloadCGPAResult() {
    const sgpaSum = document.getElementById("cgpaSgpaSum").value;
    const semesters = document.getElementById("cgpaSemesters").value;
    const resultDiv = document.getElementById("cgpaResult");
    
    if (resultDiv.style.display !== "block") {
        showToast("Please calculate the result first.", "error");
        return;
    }
    
    const cgpa = (sgpaSum / semesters).toFixed(2);
    const percentage = (cgpa * 9.5).toFixed(2);
    const grade = getGrade(percentage);
    
    const content = `CGPA Calculation (10.0 scale)\n\n` +
                   `Sum of SGPA: ${sgpaSum}\n` +
                   `Number of Semesters: ${semesters}\n` +
                   `CGPA: ${cgpa}\n` +
                   `Equivalent Percentage: ${percentage}%\n` +
                   `Grade: ${grade}\n\n` +
                   `Calculated on: ${new Date().toLocaleString()}`;
    
    downloadText(content, "cgpa_result.txt");
    showToast("CGPA result downloaded!");
}

function downloadReference() {
    const content = `Grading System Reference\n\n` +
                   `GPA Scale (Out of 4.0)\n` +
                   `90-100% - A - 4.0\n` +
                   `80-89% - B - 3.0\n` +
                   `70-79% - C - 2.0\n` +
                   `60-69% - D - 1.0\n` +
                   `Below 60% - F - 0.0\n\n` +
                   `SGPA/CGPA Scale (Out of 10.0)\n` +
                   `90-100% - O (Outstanding) - 10 - First Class with Distinction\n` +
                   `80-89% - A+ (Excellent) - 9 - First Class\n` +
                   `70-79% - A (Very Good) - 8 - First Class\n` +
                   `60-69% - B+ (Good) - 7 - Second Class\n` +
                   `50-59% - B (Above Average) - 6 - Second Class\n` +
                   `40-49% - C (Average) - 5 - Pass Class\n` +
                   `Below 40% - F (Fail) - 0 - Fail\n\n` +
                   `Formulas\n` +
                   `Percentage = (Obtained Marks / Total Marks) × 100\n` +
                   `GPA = Sum of (Grade Points × Credit Hours) / Total Credit Hours\n` +
                   `SGPA = Sum of (Grade Points × Credits) / Total Credits\n` +
                   `CGPA = Sum of (SGPA × Semester Credits) / Total Credits Across All Semesters\n\n` +
                   `International Grade Conversion Reference\n` +
                   `90-100% (India) - 10 CGPA - 4.0 GPA - First Class Honours (UK) - A (US)\n` +
                   `80-89% - 9 - 3.7-4.0 - Upper Second Class (2:1) - A-/B+\n` +
                   `70-79% - 8 - 3.0-3.3 - Lower Second Class (2:2) - B\n` +
                   `60-69% - 7 - 2.3-2.7 - Third Class - C+\n` +
                   `50-59% - 6 - 2.0 - Ordinary Degree - C\n` +
                   `Below 50% - 0-5 - 0-1.7 - Fail - F\n\n` +
                   `Note: Grade conversions are approximate and vary by institution.\n` +
                   `Generated on: ${new Date().toLocaleString()}`;
    
    downloadText(content, "grading_reference.txt");
    showToast("Reference guide downloaded!");
}

function downloadText(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Refresh Confirmation Functionality
let refreshConfirmed = false;

// Show refresh confirmation modal
function showRefreshConfirmation(e) {
    // Check if we've already confirmed refresh
    if (refreshConfirmed) return true;
    
    // Check if there's any unsaved data in todo list
    const todos = JSON.parse(localStorage.getItem("todo-list")) || [];
    if (todos.length > 0) {
        e.preventDefault();
        document.getElementById('refreshModal').style.display = 'flex';
        return false;
    }
    
    return true;
}

// Confirm refresh action
function confirmRefresh() {
    refreshConfirmed = true;
    document.getElementById('refreshModal').style.display = 'none';
    window.location.reload();
}

// Cancel refresh action
function cancelRefresh() {
    document.getElementById('refreshModal').style.display = 'none';
}

// Add beforeunload event listener
window.addEventListener('beforeunload', function(e) {
    const todos = JSON.parse(localStorage.getItem("todo-list")) || [];
    if (todos.length > 0 && !refreshConfirmed) {
        e.preventDefault();
        e.returnValue = 'You have unsaved tasks. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    // Add shake animation for invalid inputs
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s;
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners for input validation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 500);
                this.value = '';
            }
        });
    });
    
    // Show welcome message
    setTimeout(() => {
        showToast("Welcome to ClassWork");
    }, 1000);
});

 // Mobile dropdown navigation
    const navSelect = document.querySelector('.nav-select');
    navSelect.addEventListener('change', function() {
        if(this.value !== "#") {
            window.location.href = this.value;
        }
    });

    // Optional: Hamburger toggle for original menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });