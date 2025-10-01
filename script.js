// Main Application JavaScript for Munchies & Shukisha

// Global state
let cart = [];
let isLoggedIn = false;
let currentUser = null;
let vendors = [];

// DOM Elements
const authLink = document.getElementById('authLink');
const overlay = document.getElementById('overlay');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const protectedOverlay = document.getElementById('protectedOverlay');
const cartCount = document.getElementById('cartCount');
const homePage = document.getElementById('home-page');
const restaurantDetailPage = document.getElementById('restaurant-detail-page');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutTotal = document.getElementById('checkoutTotal');
const vendorsContainer = document.getElementById('vendors-container');

// Initialize the application
function init() {
    console.log('🚀 Initializing Munchies & Shukisha...');
    loadCart();
    loadVendors();
    setupEventListeners();
    setupMobileMenu();
    checkAuthState();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Setup event listeners
function setupEventListeners() {
    // Overlay click to close modals
    if (overlay) {
        overlay.addEventListener('click', closeAllModals);
    }
    
    if (protectedOverlay) {
        protectedOverlay.addEventListener('click', () => {
            protectedOverlay.style.display = 'none';
        });
    }

    // Prevent modal close when clicking inside modal
    [loginModal, signupModal, forgotPasswordModal, checkoutModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => e.stopPropagation());
        }
    });

    // Setup search and filter
    setupSearchAndFilter();
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
    
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(mobileMenuBtn);
        
        const nav = document.querySelector('nav ul');
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
            mobileMenuBtn.innerHTML = nav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking on links
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// Check authentication state
function checkAuthState() {
    if (window.firebaseAuth && window.firebaseAuth.auth) {
        window.firebaseAuth.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User logged in:', user.email);
                isLoggedIn = true;
                currentUser = user;
                updateAuthUI(user);
            } else {
                console.log('🔒 User logged out');
                isLoggedIn = false;
                currentUser = null;
                updateAuthUI(null);
            }
        });
    }
}

// Update UI based on auth state
function updateAuthUI(user) {
    if (!authLink) return;
    
    if (user) {
        authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span class="nav-text">Logout</span>';
        authLink.onclick = handleLogout;
        
        // Show vendor dashboard link if user is a vendor
        checkUserType(user.uid);
    } else {
        authLink.innerHTML = '<i class="fas fa-user"></i> <span class="nav-text">Login</span>';
        authLink.onclick = showLoginModal;
        
        // Hide vendor dashboard link
        const vendorDashboardLink = document.getElementById('vendorDashboardLink');
        if (vendorDashboardLink) {
            vendorDashboardLink.style.display = 'none';
        }
    }
}

// Check if user is a vendor
async function checkUserType(uid) {
    try {
        if (!window.firebaseAuth || !window.firebaseAuth.db) return;
        
        const userDoc = await window.firebaseAuth.db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const vendorDashboardLink = document.getElementById('vendorDashboardLink');
            if (userData.userType === 'seller' && vendorDashboardLink) {
                vendorDashboardLink.style.display = 'list-item';
            }
        }
    } catch (error) {
        console.error('Error checking user type:', error);
    }
}

// Authentication handlers
async function handleLogin() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    
    if (!email || !password || !email.value || !password.value) {
        showToast('Please enter email and password', true);
        return;
    }
    
    try {
        showToast('Logging in...');
        const result = await window.firebaseAuth.login(email.value, password.value);
        
        if (result.success) {
            showToast('Login successful!', false, 'success');
            closeAllModals();
        } else {
            showToast(result.error, true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', true);
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const userType = document.getElementById('userType');
    const termsAgreed = document.getElementById('termsAgree');
    
    if (!name || !email || !password || !userType || !termsAgreed) {
        showToast('Please fill all required fields', true);
        return;
    }
    
    if (!name.value || !email.value || !password.value || !termsAgreed.checked) {
        showToast('Please fill all required fields and agree to terms', true);
        return;
    }
    
    const userData = { 
        name: name.value, 
        userType: userType.value 
    };
    
    // Add vendor-specific data if seller
    if (userType.value === 'seller') {
        const businessName = document.getElementById('businessName');
        const businessLocation = document.getElementById('businessLocation');
        
        userData.businessName = businessName ? businessName.value : '';
        userData.businessLocation = businessLocation ? businessLocation.value : '';
        userData.description = document.getElementById('description') ? document.getElementById('description').value : '';
        
        if (!userData.businessName || !userData.businessLocation) {
            showToast('Please provide business details for vendor account', true);
            return;
        }
    }
    
    try {
        showToast('Creating account...');
        const result = await window.firebaseAuth.signup(email.value, password.value, userData);
        
        if (result.success) {
            if (userType.value === 'seller') {
                showToast('Account created! Seller verification pending.', false, 'success');
            } else {
                showToast('Account created successfully!', false, 'success');
            }
            closeAllModals();
        } else {
            showToast(result.error, true);
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Signup failed. Please try again.', true);
    }
}

async function handleLogout() {
    try {
        const result = await window.firebaseAuth.logout();
        if (result.success) {
            showToast('Logged out successfully', false, 'success');
            isLoggedIn = false;
            currentUser = null;
            updateAuthUI(null);
        } else {
            showToast(result.error, true);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', true);
    }
}

// Modal functions
function showLoginModal() {
    closeAllModals();
    if (overlay) overlay.style.display = 'block';
    if (loginModal) loginModal.style.display = 'block';
}

function showSignupModal() {
    closeAllModals();
    if (overlay) overlay.style.display = 'block';
    if (signupModal) signupModal.style.display = 'block';
}

function closeAllModals() {
    if (overlay) overlay.style.display = 'none';
    [loginModal, signupModal, forgotPasswordModal, checkoutModal].forEach(modal => {
        if (modal) modal.style.display = 'none';
    });
}

// Cart functionality
function addToCart(itemName, itemPrice) {
    if (!isLoggedIn) {
        if (protectedOverlay) protectedOverlay.style.display = 'flex';
        return;
    }

    cart.push({
        name: itemName,
        price: itemPrice,
        id: Date.now().toString()
    });
    updateCartCount();
    saveCart();
    showToast(`${itemName} added to cart!`, false, 'success');
}

function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

function loadCart() {
    try {
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function saveCart() {
    try {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Vendor management
function loadVendors() {
    try {
        const savedVendors = localStorage.getItem('vendors');
        vendors = savedVendors ? JSON.parse(savedVendors) : [];
        renderVendors();
    } catch (error) {
        console.error('Error loading vendors:', error);
        vendors = [];
        renderVendors();
    }
}

function renderVendors() {
    if (!vendorsContainer) return;
    
    if (vendors.length === 0) {
        vendorsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils" aria-hidden="true"></i>
                <h3>No Vendors Yet</h3>
                <p>Be the first to sign up as a vendor and showcase your culinary creations!</p>
                <button class="btn" onclick="showSignupModal()" style="margin-top: 20px;">Become a Vendor</button>
            </div>
        `;
        return;
    }
    
    let vendorsHTML = '';
    vendors.forEach(vendor => {
        vendorsHTML += `
            <div class="menu-item" onclick="showRestaurantDetail('${vendor.id}')">
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${vendor.businessName} Sample Dish', 499)">
                    <i class="fas fa-plus"></i>
                </button>
                <img src="${vendor.logo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" alt="${vendor.businessName}" class="menu-item-img">
                <div class="menu-item-content">
                    <span class="vendor-badge">${vendor.businessType || 'Food Vendor'}</span>
                    <h3>${vendor.businessName}</h3>
                    <p>${vendor.description || 'Delicious food made with love and tradition.'}</p>
                    <div class="rating">
                        ${generateStarRating(vendor.rating || 4)}
                        <span>(${vendor.reviewCount || 0} reviews)</span>
                    </div>
                    <p class="price">KSh ${vendor.minPrice || 499}+</p>
                    <button class="btn" onclick="event.stopPropagation(); addToCart('${vendor.businessName} Sample Dish', ${vendor.minPrice || 499})">Add to Cart</button>
                </div>
            </div>
        `;
    });
    
    vendorsContainer.innerHTML = vendorsHTML;
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

// Utility functions
function showToast(message, isError = false, type = 'default') {
    try {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : type === 'success' ? 'success' : ''}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 4000);
    } catch (error) {
        console.error('Toast error:', error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search and filter setup (simplified)
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            // Basic search implementation
            const searchTerm = this.value.toLowerCase();
            const filteredVendors = vendors.filter(vendor => 
                vendor.businessName.toLowerCase().includes(searchTerm) ||
                vendor.description.toLowerCase().includes(searchTerm)
            );
            renderFilteredVendors(filteredVendors);
        }, 300));
    }
}

function renderFilteredVendors(filteredVendors) {
    if (!vendorsContainer) return;
    
    if (filteredVendors.length === 0) {
        vendorsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search" aria-hidden="true"></i>
                <h3>No vendors found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
        return;
    }
    
    let vendorsHTML = '';
    filteredVendors.forEach(vendor => {
        vendorsHTML += `
            <div class="menu-item" onclick="showRestaurantDetail('${vendor.id}')">
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${vendor.businessName} Sample Dish', 499)">
                    <i class="fas fa-plus"></i>
                </button>
                <img src="${vendor.logo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" alt="${vendor.businessName}" class="menu-item-img">
                <div class="menu-item-content">
                    <span class="vendor-badge">${vendor.businessType || 'Food Vendor'}</span>
                    <h3>${vendor.businessName}</h3>
                    <p>${vendor.description || 'Delicious food made with love and tradition.'}</p>
                    <div class="rating">
                        ${generateStarRating(vendor.rating || 4)}
                        <span>(${vendor.reviewCount || 0} reviews)</span>
                    </div>
                    <p class="price">KSh ${vendor.minPrice || 499}+</p>
                    <button class="btn" onclick="event.stopPropagation(); addToCart('${vendor.businessName} Sample Dish', ${vendor.minPrice || 499})">Add to Cart</button>
                </div>
            </div>
        `;
    });
    
    vendorsContainer.innerHTML = vendorsHTML;
}

// Restaurant detail page
function showRestaurantDetail(restaurantId) {
    // Simplified implementation
    showToast('Restaurant detail view coming soon!');
}

// Toggle vendor fields
function toggleVendorFields() {
    const userType = document.getElementById('userType');
    const vendorFields = document.getElementById('vendorFields');
    
    if (!userType || !vendorFields) return;
    
    if (userType.value === 'seller') {
        vendorFields.style.display = 'flex';
        if (vendorFields.hasAttribute('aria-hidden')) {
            vendorFields.setAttribute('aria-hidden', 'false');
        }
    } else {
        vendorFields.style.display = 'none';
        if (vendorFields.hasAttribute('aria-hidden')) {
            vendorFields.setAttribute('aria-hidden', 'true');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Global exports for HTML onclick handlers
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;
window.addToCart = addToCart;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.toggleVendorFields = toggleVendorFields;
window.closeAllModals = closeAllModals;