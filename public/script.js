const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');

  let editingId = null;

  // Load tasks on page load
  loadTasks();

  // Add or update task
  addBtn.addEventListener('click', function() {
    const task = taskInput.value.trim();
    const dueDate = dateInput.value;
    const dueTime = timeInput.value;

    if (!task) {
      alert('Please enter a task');
      return;
    }

    if (editingId) {
      updateTask(editingId, task, dueDate, dueTime);
    } else {
      addTask(task, dueDate, dueTime);
    }
  });

  // Load tasks from server
  function loadTasks() {
    fetch('http://localhost:3000/tasks')
      .then(response => response.json())
      .then(tasks => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
          addTaskToDOM(task);
        });
      })
      .catch(error => console.error('Error loading tasks:', error));
  }

  // Add task to server
function addTask(task, dueDate, dueTime) {
    fetch(`http://localhost:3000/tasks`, { // Use the local server URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        task: task, 
        due_date: dueDate, 
        due_time: dueTime 
      }),
      mode: 'cors' // Explicitly set CORS mode
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(newTask => {
      addTaskToDOM(newTask);
      clearForm();
    })
    .catch(error => {
      console.error('Error adding task:', error);
      alert(`Failed to add task: ${error.message}`);
    });
}

  // Update task on server
  function updateTask(id, task, dueDate, dueTime) {
    fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, due_date: dueDate, due_time: dueTime }),
    })
      .then(response => response.json())
      .then(updatedTask => {
        loadTasks(); // Refresh the list
        clearForm();
        editingId = null;
        addBtn.textContent = 'Add Task';
      })
      .catch(error => console.error('Error updating task:', error));
  }

  // Delete task from server
  function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          loadTasks(); // Refresh the list
        })
        .catch(error => console.error('Error deleting task:', error));
    }
  }

  // Add task to DOM
  function addTaskToDOM(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
      <div class="task-info">
        <div>${task.task}</div>
        <div class="due-date">
          <span>Due:</span> ${task.due_date} at ${task.due_time || '23:59'}
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    // Add event listeners to buttons
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {
      taskInput.value = task.task;
      dateInput.value = task.due_date;
      timeInput.value = task.due_time || '23:59';
      editingId = task.id;
      addBtn.textContent = 'Update Task';
    });

    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });

    taskList.appendChild(taskElement);
  }

  // Clear form
  function clearForm() {
    taskInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
  }
});