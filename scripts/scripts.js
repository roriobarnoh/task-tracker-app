const usersContainer = document.getElementById('users');
const addTaskForm = document.getElementById('addTaskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskStatusInput = document.getElementById('taskStatus');
const url = 'https://myapp-backend-82xu.onrender.com/api';

// Function to fetch and display users and tasks
async function fetchData() {
  try {
    const usersResponse = await fetch(`${url}/users`);
    const users = await usersResponse.json();

    users.forEach(async (user) => {
      const userElement = document.createElement('div');
      userElement.innerHTML = `
        <h3>${user.name}</h3>
        <p>Email: ${user.email}</p>
        <h4>Tasks:</h4>
        <div id="tasks-${user.id}"></div>
      `;
      usersContainer.append(userElement)

      // Fetch and display tasks for each user
      const tasksResponse = await fetch(`${url}/tasks?userId=${user.id}`);
      const tasks = await tasksResponse.json();
      const tasksContainer = document.getElementById(`tasks-${user.id}`);

      tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task', task.status);
        taskElement.innerHTML = `
          <h5>${task.title}</h5>
          <p>${task.description}</p>
          <p>Status: ${task.status}</p>
          <p>Priority: ${task.priority}</p>
          <p>Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
        `;
        
        // Add event listeners
        taskElement.addEventListener('click', () => toggleTaskStatus(task, taskElement));
        taskElement.addEventListener('mouseover', () => taskElement.style.backgroundColor = '#e0e0e0');
        taskElement.addEventListener('mouseout', () => taskElement.style.backgroundColor = '');

        tasksContainer.appendChild(taskElement);
      });

      usersContainer.appendChild(userElement);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to toggle task status on click
async function toggleTaskStatus(task, taskElement) {
  const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
  task.status = newStatus;

  // Update the task on the server (mocked for now with JSON Server)
  await fetch(`${url}/tasks/${task.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });

  // Update the task element's appearance
  taskElement.classList.remove('completed', 'in-progress', 'pending');
  taskElement.classList.add(newStatus);
}

// Handle form submission to add a new task
addTaskForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the page from reloading

  const newTask = {
    title: taskTitleInput.value,
    description: taskDescriptionInput.value,
    status: taskStatusInput.value,
    priority: 'medium', // Default priority
    dueDate: new Date().toISOString(), // Set the due date to now for demo
    userId: 1, // Assuming we're adding the task for user with ID 1
  };

  try {
    const response = await fetch(`${url}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    const addedTask = await response.json();

    // Dynamically add the task to the DOM
    const tasksContainer = document.getElementById(`tasks-${newTask.userId}`);
    const taskElement = document.createElement('div');
    taskElement.classList.add('task', newTask.status);
    taskElement.innerHTML = `
      <h5>${addedTask.title}</h5>
      <p>${addedTask.description}</p>
      <p>Status: ${addedTask.status}</p>
      <p>Priority: ${addedTask.priority}</p>
      <p>Due Date: ${new Date(addedTask.dueDate).toLocaleDateString()}</p>
    `;

    // Add event listeners
    taskElement.addEventListener('click', () => toggleTaskStatus(addedTask, taskElement));
    taskElement.addEventListener('mouseover', () => taskElement.style.backgroundColor = '#e0e0e0');
    taskElement.addEventListener('mouseout', () => taskElement.style.backgroundColor = '');

    tasksContainer.appendChild(taskElement);

    // Clear form inputs after submission
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    taskStatusInput.value = 'pending';
  } catch (error) {
    console.error('Error adding task:', error);
  }
});

// Initialize the app by loading the data
window.onload = fetchData;
