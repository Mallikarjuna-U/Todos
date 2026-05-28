let errorMsg = document.getElementById("errorMsg");
let successMsg = document.getElementById("successMsg");
let userData = [];

function validateName(name) {
  return name.trim().length >= 3 && !/\d/.test(name);
}

function validatePassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  );
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

let nameElement = document.getElementById("name");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");
let submit = document.getElementById("submit");

let existingUser = JSON.parse(localStorage.getItem("userData"));
if (existingUser) {
  userData = existingUser;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.color = "red";
}

submit.onclick = (event) => {
  event.preventDefault();
  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (userData.some((eachUser) => eachUser.email === email.value)) {
    showError("Email already exists.");
    return;
  }

  if (
    nameElement.value === "" ||
    email.value === "" ||
    password.value === "" ||
    confirmPassword.value === ""
  ) {
    showError("All fields are required.");
    return;
  }

  if (!validateName(nameElement.value)) {
    showError("Name should be at least 3 characters long.");
    return;
  }

  if (!validateEmail(email.value)) {
    showError("Invalid email format.");
    return;
  }
  if (!validatePassword(password.value)) {
    showError("Password is invalid.");
    return;
  }

  if (password.value !== confirmPassword.value) {
    showError("Passwords do not match.");
    return;
  }

  successMsg.textContent = "Sign up successful! You can now log in.";
  successMsg.style.color = "brown";

  userData.push({
    id: crypto.randomUUID(),
    name: nameElement.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
  });
  localStorage.setItem("userData", JSON.stringify(userData));
  nameElement.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
};
