// App configuration
const config = {
    minWithdrawal: 100,
    levelThresholds: [0, 500, 1500, 3000, 5000],
    levelRewards: [0, 100, 300, 700, 1200]
};

// Initialize points balance and level
let pointsBalance = 0;
let userLevel = 1;
let completedTasks = {};

// DOM Elements
const elements = {
    userProfilePic: document.getElementById('user-profile-pic'),
    userFirstName: document.getElementById('user-first-name'),
    userUsername: document.getElementById('user-username'),
    pointsBalance: document.getElementById('points-balance'),
    levelProgress: document.getElementById('level-progress'),
    currentLevel: document.getElementById('current-level'),
    levelProgressText: document.getElementById('level-progress-text'),
    withdrawBalance: document.getElementById('withdraw-balance'),
    withdrawAmount: document.getElementById('withdraw-amount'),
    withdrawMethod: document.getElementById('withdraw-method'),
    rewardPoints: document.getElementById('reward-points'),
    rewardAnimation: document.getElementById('reward-animation'),
    adTasksContainer: document.getElementById('ad-tasks-container'),
    dailyTasksContainer: document.getElementById('daily-tasks-container')
};

// Task data
const adTasks = [
    {
        id: 'premium-ad',
        title: 'Premium Ad',
        description: 'Earn 50 points for watching this ad',
        points: 50,
        icon: '💎',
        buttonClass: 'ad-btn-1',
        iconClass: 'ad-1-icon'
    },
    {
        id: 'hot-offer',
        title: 'Hot Offer',
        description: 'Earn 25 points for watching this ad',
        points: 25,
        icon: '🔥',
        buttonClass: 'ad-btn-2',
        iconClass: 'ad-2-icon'
    },
    {
        id: 'special-offer',
        title: 'Special Offer',
        description: 'Earn 20 points for watching this ad',
        points: 20,
        icon: '⭐',
        buttonClass: 'ad-btn-3',
        iconClass: 'ad-3-icon'
    }
];

const dailyTasks = [
    {
        id: 'daily-login',
        title: 'Daily Login',
        description: 'Login every day to get bonus points',
        points: 5,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>`
    },
    {
        id: 'invite-friends',
        title: 'Invite Friends',
        description: 'Invite 3 friends to join',
        points: 30,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>`
    },
    {
        id: 'complete-profile',
        title: 'Complete Profile',
        description: 'Fill all your profile information',
        points: 15,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>`
    }
];

// Initialize the app
function initApp() {
    loadUserData();
    renderTasks();
    setupEventListeners();
    updatePointsDisplay();
}

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const data = JSON.parse(savedData);
        pointsBalance = data.pointsBalance || 0;
        userLevel = data.userLevel || 1;
        completedTasks = data.completedTasks || {};
    }
    
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        const user = tg.initDataUnsafe.user;
        if (user) {
            elements.userFirstName.textContent = user.first_name || "User";
            elements.userUsername.textContent = user.username ? "@" + user.username : "@unknown";
            
            if (user.photo_url) {
                elements.userProfilePic.src = user.photo_url;
            }
        }
    }
}

// Save user data to localStorage
function saveUserData() {
    const userData = {
        pointsBalance,
        userLevel,
        completedTasks
    };
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Render tasks
function renderTasks() {
    // Render ad tasks
    elements.adTasksContainer.innerHTML = '';
    adTasks.forEach(task => {
        const isCompleted = completedTasks[task.id] === true;
        const taskElement = createTaskElement(task, isCompleted);
        elements.adTasksContainer.appendChild(taskElement);
    });
    
    // Render daily tasks
    elements.dailyTasksContainer.innerHTML = '';
    dailyTasks.forEach(task => {
        const isCompleted = completedTasks[task.id] === true;
        const taskElement = createTaskElement(task, isCompleted);
        elements.dailyTasksContainer.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task, isCompleted) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
        <div class="task-info">
            <div class="task-icon ${task.iconClass || ''}">${task.icon}</div>
            <div class="task-details">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
            </div>
        </div>
        <button class="task-action ${task.buttonClass || ''}" 
                data-task-id="${task.id}" 
                data-points="${task.points}"
                ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? 'Completed' : (task.id.includes('ad') ? 'Watch' : `+${task.points} Points`)}
        </button>
    `;
    return taskElement;
}

// Setup event listeners
function setupEventListeners() {
    // Withdraw button
    document.getElementById('withdraw-btn').addEventListener('click', showWithdrawModal);
    
    // Modal controls
    document.getElementById('close-withdraw-modal').addEventListener('click', () => closeModal('withdraw-modal'));
    document.getElementById('cancel-withdraw').addEventListener('click', () => closeModal('withdraw-modal'));
    document.getElementById('submit-withdraw').addEventListener('click', submitWithdraw);
    
    // Reward animation close
    document.getElementById('close-reward').addEventListener('click', closeReward);
    
    // Task buttons (event delegation)
    document.addEventListener('click', (event) => {
        const button = event.target.closest('.task-action');
        if (!button) return;
        
        const taskId = button.dataset.taskId;
        const points = parseInt(button.dataset.points);
        
        if (button.textContent === 'Watch') {
            watchAd(taskId, points, button);
        } else {
            completeTask(taskId, points, button);
        }
    });
}

// Watch ad function
function watchAd(taskId, points, button) {
    button.disabled = true;
    button.textContent = 'Watching...';
    
    // Simulate ad watching delay
    setTimeout(() => {
        addPoints(points);
        showRewardAnimation(points);
        
        // Mark task as completed
        completedTasks[taskId] = true;
        saveUserData();
        
        // Re-enable button after cooldown (30 seconds)
        setTimeout(() => {
            button.disabled = false;
            button.textContent = 'Watch';
        }, 30000);
    }, 2000);
}

// Complete task
function completeTask(taskId, points, button) {
    button.disabled = true;
    button.textContent = 'Completed';
    button.classList.add('completed');
    
    addPoints(points);
    showRewardAnimation(points);
    
    // Mark task as completed
    completedTasks[taskId] = true;
    saveUserData();
}

// Add points to balance
function addPoints(amount) {
    pointsBalance += amount;
    updatePointsDisplay();
    checkLevelUp();
    saveUserData();
}

// Update points display
function updatePointsDisplay() {
    elements.pointsBalance.textContent = pointsBalance;
    elements.withdrawBalance.textContent = pointsBalance;
    
    // Calculate level progress
    const currentLevelThreshold = config.levelThresholds[userLevel - 1] || 0;
    const nextLevelThreshold = config.levelThresholds[userLevel] || currentLevelThreshold + 1000;
    const progress = Math.min(100, Math.max(0, 
        ((pointsBalance - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
    ));
    
    elements.levelProgress.style.width = `${progress}%`;
    elements.currentLevel.textContent = userLevel;
    elements.levelProgressText.textContent = `${Math.round(progress)}%`;
}

// Check for level up
function checkLevelUp() {
    const nextLevelThreshold = config.levelThresholds[userLevel];
    
    if (nextLevelThreshold && pointsBalance >= nextLevelThreshold) {
        userLevel++;
        
        // Award level up bonus
        const bonus = config.levelRewards[userLevel - 1] || 0;
        if (bonus > 0) {
            addPoints(bonus);
            showRewardAnimation(bonus, `Level Up! +${bonus} Points`);
        }
        
        updatePointsDisplay();
        saveUserData();
    }
}

// Show reward animation
function showRewardAnimation(points, message) {
    elements.rewardPoints.textContent = `+${points} Points`;
    if (message) {
        document.querySelector('.reward-text').textContent = message;
    }
    elements.rewardAnimation.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.rewardAnimation.classList.remove('show');
    }, 3000);
}

// Close reward animation
function closeReward() {
    elements.rewardAnimation.classList.remove('show');
}

// Show withdraw modal
function showWithdrawModal() {
    elements.withdrawBalance.textContent = pointsBalance;
    elements.withdrawAmount.value = '';
    document.getElementById('withdraw-modal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Submit withdraw request
function submitWithdraw() {
    const amount = parseInt(elements.withdrawAmount.value);
    const method = elements.withdrawMethod.value;
    
    if (isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > pointsBalance) {
        alert('You don\'t have enough points');
        return;
    }
    
    if (amount < config.minWithdrawal) {
        alert(`Minimum withdrawal is ${config.minWithdrawal} points`);
        return;
    }
    
    // In a real app, this would be sent to a backend
    alert(`Withdrawal request submitted: ${amount} points via ${method}`);
    pointsBalance -= amount;
    updatePointsDisplay();
    saveUserData();
    closeModal('withdraw-modal');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
