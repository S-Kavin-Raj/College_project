// User type configurations
const userConfig = {
    student: {
        description: 'Access your courses, assignments, and grades',
        placeholder: 'student@college.edu',
        iconClass: 'student'
    },
    teacher: {
        description: 'Manage classes, students, and course materials',
        placeholder: 'teacher@college.edu',
        iconClass: 'teacher'
    },
    admin: {
        description: 'College management and administration portal',
        placeholder: 'admin@college.edu',
        iconClass: 'admin'
    }
};

// Current selected user type
let currentUserType = 'student';

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const userIcon = document.getElementById('user-icon');
const userDescription = document.getElementById('user-description');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');
const submitBtn = document.querySelector('.submit-btn');

// Tab switching functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Get user type from data attribute
        currentUserType = tab.dataset.type;

        // Update UI based on user type
        updateUIForUserType(currentUserType);
    });
});

// Update UI based on user type
function updateUIForUserType(userType) {
    const config = userConfig[userType];

    // Update icon styling
    userIcon.className = `icon ${config.iconClass}`;

    // Update description
    userDescription.textContent = config.description;

    // Update email placeholder
    emailInput.placeholder = config.placeholder;

    // Clear any existing messages
    hideMessage();
}

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Update icon
    const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
    if (type === 'text') {
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
});

// Form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Basic validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    hideMessage();

    try {
        // Send login request to server
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                userType: currentUserType
            })
        });

        const data = await response.json();

        // Remove loading state
        submitBtn.classList.remove('loading');

        if (data.success) {
            showMessage('Login successful! Redirecting...', 'success');

            // Store user data in session storage
            sessionStorage.setItem('user', JSON.stringify(data.user));

            // Redirect after 2 seconds
            setTimeout(() => {
                // Redirect to dashboard
                console.log('Redirecting to dashboard...');
                showMessage(`Welcome ${data.user.name}! (${currentUserType})`, 'success');
                window.location.href = "http://localhost:5174";
            }, 2000);
        } else {
            showMessage(data.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        submitBtn.classList.remove('loading');
        showMessage('An error occurred. Please try again later.', 'error');
        console.error('Login error:', error);
    }
});

// Show message function
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
}

// Hide message function
function hideMessage() {
    messageDiv.className = 'message';
    messageDiv.textContent = '';
}

// Auto-hide messages after 5 seconds
let messageTimeout;
function showMessage(text, type) {
    clearTimeout(messageTimeout);
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;

    if (type === 'error') {
        messageTimeout = setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Input validation on blur
emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.style.borderColor = '#fc8181';
    } else {
        emailInput.style.borderColor = '#e2e8f0';
    }
});

passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;
    if (password && password.length < 6) {
        passwordInput.style.borderColor = '#fc8181';
    } else {
        passwordInput.style.borderColor = '#e2e8f0';
    }
});

// Reset border color on focus
emailInput.addEventListener('focus', () => {
    emailInput.style.borderColor = '#667eea';
});

passwordInput.addEventListener('focus', () => {
    passwordInput.style.borderColor = '#667eea';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUIForUserType('student');
});
