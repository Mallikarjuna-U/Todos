if (typeof window !== "undefined") {
  if (!localStorage.getItem("loggedUser")) {
    window.location.replace("../index.html");
  }
  let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  document.getElementById("loggedUserName").textContent = loggedUser.name;

  let todoItemsContainer = document.getElementById("todoItemsContainer");
  let userInputElement = document.getElementById("todoUserInput");
  let addButton = document.getElementById("addTodoButton");
  let countElement = document.getElementById("todoCount");

  let loggedTodoList = getTodoListFromLocalStorage();
  let todosCount =
    loggedTodoList.length > 0
      ? Math.max(...loggedTodoList.map((eachTodo) => eachTodo.uniqueNo))
      : 0;
  let editTodoIndex = null;

  addButton.onclick = addTodo;
  document.getElementById("todoUserInput").onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTodo();
    }
  };
  renderTodos();
  document.getElementById("clearTodoButton").onclick = clearTodos;
  document.getElementById("priority").onchange = filterTodos;
  document.getElementById("searchInput").oninput = searchTodo;
  document.getElementById("logoutButton").onclick = () => {
    localStorage.removeItem("loggedUser");
    window.location.replace("../index.html");
  };
  updateTodoStatus();

  // -----------------------
  // Local Storage Functions
  // -----------------------
  function getTodoListFromLocalStorage() {
    return JSON.parse(localStorage.getItem("todoList" + loggedUser.id)) || [];
  }

  function renderTodos(todoList = loggedTodoList) {
    todoItemsContainer.innerHTML = "";
    if (todoList.length === 0) {
      todoItemsContainer.innerHTML = "Sorry no todo found";
      return;
    }
    todoList.forEach((todo) => createTodo(todo));
  }

  function saveTodos() {
    localStorage.setItem(
      "todoList" + loggedUser.id,
      JSON.stringify(loggedTodoList),
    );
  }

  // speech recognition
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const recognition = new (
      window.SpeechRecognition || window.webkitSpeechRecognition
    )();
    let isListening = false;
    const micIcon = document.getElementById("micIcon");
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    document.getElementById("micButton").addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });

    recognition.onstart = () => {
      isListening = true;
      micIcon.classList.replace("fa-microphone", "fa-microphone-slash");
    };

    recognition.onend = () => {
      isListening = false;
      micIcon.classList.replace("fa-microphone-slash", "fa-microphone");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      userInputElement.value = transcript.trim();
    };
  }

  // function to create todo
  function createTodo(todo) {
    let todoId = "todo" + todo.uniqueNo;
    let checkboxId = "checkbox" + todo.uniqueNo;
    let labelId = "label" + todo.uniqueNo;

    let todoElement = document.createElement("li");
    todoElement.classList.add(
      "todo-item-container",
      "d-flex",
      "flex-row",
      "justify-content-center",
      "align-items-center",
    );
    todoElement.id = todoId;
    todoItemsContainer.appendChild(todoElement);

    let checkElement = document.createElement("input");
    checkElement.type = "checkbox";
    checkElement.id = checkboxId;
    checkElement.classList.add("checkbox-input");
    checkElement.checked = todo.isChecked;
    checkElement.onclick = () =>
      onTodoStatusChange(checkboxId, labelId, todoId);
    todoElement.appendChild(checkElement);

    let labelContainer = document.createElement("div");
    labelContainer.classList.add(
      "label-container",
      "d-flex",
      "flex-row",
      "align-items-center",
    );
    todoElement.appendChild(labelContainer);

    let labelElement = document.createElement("label");
    labelElement.setAttribute("for", checkboxId);
    labelElement.id = labelId;
    labelElement.classList.add("checkbox-label");
    labelElement.textContent = todo.text;
    if (todo.isChecked) labelElement.classList.add("checked");
    labelContainer.appendChild(labelElement);

    let createdAt = document.createElement("p");
    createdAt.textContent = todo.createdAt;
    createdAt.classList.add("created-at");
    labelContainer.appendChild(createdAt);

    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");
    deleteIcon.onclick = () => deleteTodo(todoId);
    labelContainer.appendChild(deleteIcon);

    let editElement = document.createElement("i");
    editElement.classList.add("far", "fa-edit", "edit-icon");
    editElement.onclick = () => editTodo(todo.uniqueNo);
    todoElement.appendChild(editElement);
  }

  // function to search Todo
  function searchTodo() {
    todoItemsContainer.innerHTML = "";
    let searchInput = document.getElementById("searchInput");
    let filteredTodoList = loggedTodoList.filter((eachTodo) => {
      return eachTodo.text
        .toLowerCase()
        .includes(searchInput.value.toLowerCase());
    });
    if (filteredTodoList.length === 0) {
      todoItemsContainer.innerHTML = "Sorry no todo found";
    } else todoItemsContainer.innerHTML = "";
    filteredTodoList.forEach((eachTodo) => createTodo(eachTodo));
  }

  // function to add todo
  function addTodo() {
    let text = userInputElement.value.trim();
    let count = parseInt(countElement.value) || 1;
    if (!text) {
      alert("Enter valid text");
      return;
    }
    let exists = loggedTodoList.some(
      (todo, index) =>
        todo.text.toLowerCase() === text.toLowerCase() &&
        index !== editTodoIndex,
    );
    if (exists) {
      alert("Todo already exists");
      return;
    }
    // Edit mode
    if (editTodoIndex !== null) {
      loggedTodoList[editTodoIndex].text = text;
      saveTodos();
      updateTodoStatus();
      editTodoIndex = null;
      addButton.textContent = "Add";
      userInputElement.value = "";
      countElement.value = 1;
      renderTodos();
      return;
    }

    // Add mode
    for (let i = 1; i <= count; i++) {
      todosCount++;
      loggedTodoList.push({
        userId: loggedUser.id,
        text: count === 1 ? text : `${text} ${i}`,
        uniqueNo: todosCount,
        isChecked: false,
        createdAt: new Date().toLocaleString(),
      });
    }
    saveTodos();
    updateTodoStatus();
    userInputElement.value = "";
    countElement.value = 1;
    renderTodos();
  }

  //function to clear all todos
  function clearTodos() {
    todoItemsContainer.innerHTML = "";
    loggedTodoList = [];
    saveTodos();
    updateTodoStatus();
  }

  // function to filter completed and inprogress todos
  function filterTodos() {
    todoItemsContainer.innerHTML = "";
    let value = document.getElementById("priority").value;
    let filteredTodoList = loggedTodoList;
    if (value === "completed") {
      filteredTodoList = loggedTodoList.filter(
        (eachTodo) => eachTodo.isChecked,
      );
    } else if (value === "inProgress") {
      filteredTodoList = loggedTodoList.filter(
        (eachTodo) => !eachTodo.isChecked,
      );
    } else {
      filteredTodoList = loggedTodoList;
    }
    filteredTodoList.forEach((eachTodo) => createTodo(eachTodo));
    if (filteredTodoList.length === 0) {
      todoItemsContainer.innerHTML = "Sorry no todo found";
    }
  }

  // function to delete todo
  function deleteTodo(todoId) {
    let todoElement = document.getElementById(todoId);
    if (todoElement) {
      todoItemsContainer.removeChild(document.getElementById(todoId));
      let i = loggedTodoList.findIndex(
        (eachTodo) => "todo" + eachTodo.uniqueNo === todoId,
      );
      loggedTodoList.splice(i, 1);
      saveTodos();
      updateTodoStatus();
    }
  }

  // function to edit todo
  function editTodo(uniqueNo) {
    editTodoIndex = loggedTodoList.findIndex(
      (eachTodo) => eachTodo.uniqueNo === uniqueNo,
    );
    let userInputElement = document.getElementById("todoUserInput");
    userInputElement.value = loggedTodoList[editTodoIndex].text;
    document.getElementById("addTodoButton").textContent = "Save";
  }

  // function to update todo status
  function onTodoStatusChange(checkboxId, labelId, todoId) {
    document.getElementById(labelId).classList.toggle("checked");
    let i = loggedTodoList.findIndex(
      (eachTodo) => "todo" + eachTodo.uniqueNo === todoId,
    );
    loggedTodoList[i].isChecked = !loggedTodoList[i].isChecked;
    saveTodos();
    updateTodoStatus();
  }
  // update todos status
  function updateTodoStatus() {
    let totalTodos = loggedTodoList.length;
    let completedTodos = loggedTodoList.filter(
      (eachTodo) => eachTodo.isChecked,
    ).length;
    let pendingTodos = totalTodos - completedTodos;
    document.getElementById("totalTodos").textContent = totalTodos;
    document.getElementById("activeTodos").textContent = pendingTodos;
    document.getElementById("completedTodos").textContent = completedTodos;
  }
}
