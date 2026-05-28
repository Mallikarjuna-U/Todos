let userData = localStorage.getItem("userData")
  ? JSON.parse(localStorage.getItem("userData"))
  : [];

let email = document.getElementById("email");
let password = document.getElementById("password");
let errorMsg = document.getElementById("errorMsg");
let submit = document.getElementById("submit");

submit.onclick = (event) => {
  event.preventDefault();
  errorMsg.textContent = "";
  const existingUser = userData.find(
    (eachUser) =>
      eachUser.email === email.value && eachUser.password === password.value,
  );
  if (!existingUser) {
    errorMsg.textContent = "User not found or incorrect password.";
    errorMsg.style.color = "red";
  } else {
    errorMsg.textContent = "";
    localStorage.setItem("loggedUser", JSON.stringify(existingUser));
    window.location.replace("Todos.html");
  }
};
