// ============================================
// AUTHENTICATION SYSTEM
// ============================================

let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    updateAuthUI();
});

// Load current user from storage
async function loadCurrentUser() {
    try {
        const result = await window.storage.get('luxhaven_current_user');
        if (result && result.value) {
            currentUser = JSON.parse(result.value);
        }
    } catch (error) {
        console.log('No current user found');
    }
}

// Save current user to storage
async function saveCurrentUser() {
    try {
        if (currentUser) {
            await window.storage.set('luxhaven_current_user', JSON.stringify(currentUser));
        } else {
            await window.storage.delete('luxhaven_current_user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const authNavLink = document.getElementById('authNavLink');
    const authIcon = document.getElementById('authIcon');
    
    if (currentUser) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        authIcon.textContent = initials;
        authNavLink.innerHTML = `<span id="authIcon">${initials}</span> ${currentUser.name.split(' ')[0]}`;
        authNavLink.onclick = () => openProfile();
    } else {
        authIcon.textContent = '👤';
        authNavLink.innerHTML = '<span id="authIcon">👤</span> Accedi';
        authNavLink.onclick = () => openAuthModal();
    }
}

// Open authentication modal
function openAuthModal() {
    if (currentUser) {
        openProfile();
        return;
    }
    
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    switchToLogin();
}

// Close authentication modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
}

// Switch to login form
function switchToLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('userProfile').classList.remove('active');
}

// Switch to register form
function switchToRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('userProfile').classList.remove('active');
}

// Open user profile
function openProfile() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    // Update profile display
    document.getElementById('profileInitials').textContent = 
        currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('memberSince').textContent = 
        new Date(currentUser.registeredAt).toLocaleDateString('it-IT');
    document.getElementById('userBookings').textContent = currentUser.bookings || 0;
    
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('userProfile').classList.add('active');
    
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // Check if user exists
        const result = await window.storage.get(`luxhaven_user_${email}`);
        
        if (!result) {
            showNotification('Account non trovato. Registrati per continuare.', 'error');
            return;
        }
        
        const user = JSON.parse(result.value);
        
        // Verify password (in production, use proper hashing)
        if (user.password !== password) {
            showNotification('Password non corretta.', 'error');
            return;
        }
        
        // Login successful
        currentUser = user;
        await saveCurrentUser();
        updateAuthUI();
        closeAuthModal();
        showNotification(`Benvenuto, ${user.name}!`, 'success');
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Errore durante il login. Riprova.', 'error');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Le password non coincidono.', 'error');
        return;
    }
    
    try {
        // Check if user already exists
        try {
            const existingUser = await window.storage.get(`luxhaven_user_${email}`);
            if (existingUser) {
                showNotification('Email già registrata. Effettua il login.', 'error');
                return;
            }
        } catch (error) {
            // User doesn't exist, continue with registration
        }
        
        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password, // In production, hash this!
            registeredAt: new Date().toISOString(),
            bookings: 0
        };
        
        // Save user
        await window.storage.set(`luxhaven_user_${email}`, JSON.stringify(newUser));
        
        // Login the user
        currentUser = newUser;
        await saveCurrentUser();
        updateAuthUI();
        closeAuthModal();
        showNotification(`Benvenuto in LuxHaven360, ${name}!`, 'success');
        
        // Clear form
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
        document.getElementById('acceptTerms').checked = false;
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Errore durante la registrazione. Riprova.', 'error');
    }
}

// Handle logout
async function handleLogout() {
    currentUser = null;
    await saveCurrentUser();
    updateAuthUI();
    closeAuthModal();
    showNotification('Logout effettuato con successo.', 'success');
}

// ============================================
// PROTECTED ACTIONS
// ============================================

// Request property visit
async function requestPropertyVisit(propertyName, price) {
    if (!currentUser) {
        showNotification('Effettua il login per richiedere una visita.', 'info');
        openAuthModal();
        return;
    }
    
    // Increment bookings
    currentUser.bookings = (currentUser.bookings || 0) + 1;
    await window.storage.set(`luxhaven_user_${currentUser.email}`, JSON.stringify(currentUser));
    await saveCurrentUser();
    
    showNotification(`Richiesta visita per ${propertyName} inviata con successo!`, 'success');
}

// Request test drive
async function requestTestDrive(carName, price) {
    if (!currentUser) {
        showNotification('Effettua il login per richiedere un test drive.', 'info');
        openAuthModal();
        return;
    }
    
    currentUser.bookings = (currentUser.bookings || 0) + 1;
    await window.storage.set(`luxhaven_user_${currentUser.email}`, JSON.stringify(currentUser));
    await saveCurrentUser();
    
    showNotification(`Richiesta test drive per ${carName} inviata con successo!`, 'success');
}

// Request booking
async function requestBooking(experienceName, price) {
    if (!currentUser) {
        showNotification('Effettua il login per prenotare un\'esperienza.', 'info');
        openAuthModal();
        return;
    }
    
    currentUser.bookings = (currentUser.bookings || 0) + 1;
    await window.storage.set(`luxhaven_user_${currentUser.email}`, JSON.stringify(currentUser));
    await saveCurrentUser();
    
    showNotification(`Prenotazione ${experienceName} confermata!`, 'success');
}

// Purchase product
async function purchaseProduct(productName, price) {
    if (!currentUser) {
        showNotification('Effettua il login per acquistare.', 'info');
        openAuthModal();
        return;
    }
    
    currentUser.bookings = (currentUser.bookings || 0) + 1;
    await window.storage.set(`luxhaven_user_${currentUser.email}`, JSON.stringify(currentUser));
    await saveCurrentUser();
    
    showNotification(`${productName} aggiunto al carrello!`, 'success');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ============================================
// NAVIGATION
// ============================================

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

// Close modal when clicking outside
document.getElementById('authModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'authModal') {
        closeAuthModal();
    }
});
