// User Authentication State
let currentUser = null;

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('luxhaven_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthButton();
    }
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section, .hero').forEach(s => s.classList.remove('active'));
    
    if (sectionId === 'home') {
        document.querySelector('.hero').style.display = 'flex';
    } else {
        document.querySelector('.hero').style.display = 'none';
        document.getElementById(sectionId).classList.add('active');
    }
    
    // Close mobile menu
    document.getElementById('navLinks').classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const toggle = document.querySelector('.mobile-toggle');
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Auth Modal Functions
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal when clicking outside
document.getElementById('authModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'authModal') {
        closeAuthModal();
    }
});

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('luxhaven_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { name: user.name, email: user.email };
        localStorage.setItem('luxhaven_user', JSON.stringify(currentUser));
        updateAuthButton();
        closeAuthModal();
        
        // Success notification
        showNotification('Accesso effettuato con successo! Benvenuto ' + user.name, 'success');
    } else {
        showNotification('Email o password non corretti', 'error');
    }
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Le password non coincidono', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('luxhaven_users') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showNotification('Questa email è già registrata', 'error');
        return;
    }
    
    // Add new user
    const newUser = { name, email, phone, password };
    users.push(newUser);
    localStorage.setItem('luxhaven_users', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email };
    localStorage.setItem('luxhaven_user', JSON.stringify(currentUser));
    updateAuthButton();
    closeAuthModal();
    
    // Success notification
    showNotification('Registrazione completata! Benvenuto ' + name, 'success');
}

// Update Auth Button
function updateAuthButton() {
    const authButton = document.getElementById('authButton');
    if (currentUser) {
        authButton.innerHTML = `
            <a href="#" onclick="handleLogout(event)" title="Esci">
                <span style="margin-right: 0.5rem;">👤</span>${currentUser.name}
            </a>
        `;
    } else {
        authButton.innerHTML = '<a href="#" onclick="showAuthModal(\'login\')">Accedi</a>';
    }
}

// Handle Logout
function handleLogout(event) {
    event.preventDefault();
    if (confirm('Sei sicuro di voler uscire?')) {
        currentUser = null;
        localStorage.removeItem('luxhaven_user');
        updateAuthButton();
        showNotification('Logout effettuato con successo', 'success');
    }
}

// Require Auth for Actions
function requireAuth(action) {
    if (!currentUser) {
        showNotification('Devi effettuare l\'accesso per procedere', 'warning');
        setTimeout(() => showAuthModal('login'), 1000);
    } else {
        showNotification(action + ' confermata! Ti contatteremo presto.', 'success');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
