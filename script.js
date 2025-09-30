// Enhanced JavaScript for Munchies & Shukisha

// DOM Elements
const mobileMenuBtn = document.createElement('button');
const body = document.body;

// Initialize enhanced functionality
function enhancedInit() {
  addMobileMenu();
  addLoadingStates();
  initializeAnimations();
  setupFormValidation();
  setupScrollEffects();
  setupServiceWorker();
}

// Add mobile menu functionality
function addMobileMenu() {
  mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  mobileMenuBtn.className = 'mobile-menu-btn';
  mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
  document.querySelector('header').appendChild(mobileMenuBtn);
  
  const nav = document.querySelector('nav ul');
  const overlay = document.getElementById('overlay');
  
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    mobileMenuBtn.innerHTML = nav.classList.contains('active') ? 
      '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });
  
  // Close mobile menu when clicking on links
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// Add loading states to buttons
function addLoadingStates() {
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && 
        (e.target.textContent.includes('Login') || 
         e.target.textContent.includes('Sign up') || 
         e.target.textContent.includes('Pay') ||
         e.target.textContent.includes('Place Order'))) {
      const originalText = e.target.innerHTML;
      e.target.innerHTML = '<span class="loading-spinner"></span> Processing...';
      e.target.disabled = true;
      
      // Reset after 2 seconds (simulated loading)
      setTimeout(() => {
        e.target.innerHTML = originalText;
        e.target.disabled = false;
      }, 2000);
    }
  });
}

// Initialize animations using Intersection Observer
function initializeAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.feature-card, .menu-item, .menu-header').forEach(el => {
    observer.observe(el);
  });
}

// Setup form validation
function setupFormValidation() {
  const forms = document.querySelectorAll('.auth-modal');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Validate on blur
      input.addEventListener('blur', () => {
        validateInput(input);
      });
      
      // Remove error on focus
      input.addEventListener('focus', () => {
        clearError(input);
      });
    });
  });
}

// Validate individual input
function validateInput(input) {
  const group = input.closest('.form-group');
  let isValid = true;
  let errorMessage = '';
  
  // Required validation
  if (input.hasAttribute('required') && !input.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (input.type === 'email' && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Password validation (at least 6 characters)
  if (input.type === 'password' && input.value && input.value.length < 6) {
    isValid = false;
    errorMessage = 'Password must be at least 6 characters';
  }
  
  // Phone validation
  if (input.id === 'mpesaPhone' && input.value) {
    const phoneRegex = /^(\+?254|0)[7][0-9]{8}$/;
    if (!phoneRegex.test(input.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid Kenyan phone number';
    }
  }
  
  // Update UI
  if (!isValid) {
    group.classList.add('error');
    
    // Add or update error message
    let errorEl = group.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      group.appendChild(errorEl);
    }
    errorEl.textContent = errorMessage;
  } else {
    clearError(input);
  }
  
  return isValid;
}

// Clear error state
function clearError(input) {
  const group = input.closest('.form-group');
  group.classList.remove('error');
  
  const errorEl = group.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = '';
  }
}

// Setup scroll effects
function setupScrollEffects() {
  let lastScrollTop = 0;
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header hide/show on scroll
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      hero.style.transform = `translate3d(0px, ${rate}px, 0px)`;
    }
  }, { passive: true });
}

// Setup service worker for offline functionality (optional)
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// FIXED: Enhanced vendor profile image handling
function getVendorProfileImage(vendor) {
  // Check for vendor's uploaded images in order of priority
  if (vendor.businessLogo && vendor.businessLogo !== '') {
    return vendor.businessLogo;
  }
  if (vendor.logo && vendor.logo !== '') {
    return vendor.logo;
  }
  if (vendor.profileImage && vendor.profileImage !== '') {
    return vendor.profileImage;
  }
  if (vendor.photos && vendor.photos.length > 0) {
    return vendor.photos[0];
  }
  
  // Fallback to a generic food image instead of default vendor image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
}

// FIXED: Enhanced vendor creation with proper image handling
async function createVendorProfile(uid, userData) {
  try {
    let logoUrl = '';
    let photosUrls = [];
    
    // Handle logo upload if provided
    const logoFile = document.getElementById('businessLogo')?.files[0];
    if (logoFile) {
      logoUrl = await uploadVendorImage(logoFile, `vendors/${uid}/logo`);
    }
    
    // Handle business photos upload if provided
    const photosFiles = document.getElementById('businessPhotos')?.files;
    if (photosFiles && photosFiles.length > 0) {
      for (let i = 0; i < photosFiles.length; i++) {
        const photoUrl = await uploadVendorImage(photosFiles[i], `vendors/${uid}/photos/${i}`);
        photosUrls.push(photoUrl);
      }
    }
    
    const vendorData = {
      businessName: userData.businessName,
      businessLocation: userData.businessLocation,
      description: userData.description,
      businessType: userData.businessType || 'Food Vendor',
      owner: userData.email,
      status: 'pending',
      // Store uploaded images properly
      businessLogo: logoUrl,
      photos: photosUrls,
      cuisineType: userData.cuisineType || 'Kenyan',
      deliveryTime: userData.deliveryTime || 45,
      minPrice: userData.minPrice || 300,
      rating: 0,
      reviewCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('vendors').doc(uid).set(vendorData);
    
    // Update the vendors array and re-render
    vendors.push({
      id: uid,
      ...vendorData
    });
    saveVendors();
    renderVendors();
    
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    throw error;
  }
}

// FIXED: Upload vendor image function
async function uploadVendorImage(file, path) {
  try {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(path);
    const snapshot = await imageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading vendor image:', error);
    throw error;
  }
}

// FIXED: Enhanced vendor rendering - removed sample dishes and fixed image handling
function renderFilteredVendors(filteredVendors) {
  if (filteredVendors.length === 0) {
    vendorsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils" aria-hidden="true"></i>
        <h3>No vendors found</h3>
        <p>Try adjusting your search or filters to find what you're looking for.</p>
        <button class="btn" onclick="resetSearchAndFilter()" style="margin-top: 20px;" aria-label="Reset all filters">Reset Filters</button>
      </div>
    `;
    return;
  }

  let vendorsHTML = '';
  
  filteredVendors.forEach(vendor => {
    // Use the fixed vendor profile image function
    const vendorImage = getVendorProfileImage(vendor);
    
    vendorsHTML += `
      <div class="menu-item" onclick="showRestaurantDetail('${vendor.id}')" role="button" tabindex="0" aria-label="View ${vendor.businessName} details">
        <img src="${vendorImage}" alt="${vendor.businessName}" class="menu-item-img" loading="lazy">
        <div class="menu-item-content">
          <span class="vendor-badge">${vendor.businessType || 'Food Vendor'}</span>
          <h3>${vendor.businessName}</h3>
          <p>${vendor.description || 'Delicious food made with love and tradition.'}</p>
          <div class="rating" aria-label="Rating: ${vendor.rating || 0} out of 5 stars">
            ${generateStarRating(vendor.rating || 0)}
            <span>(${vendor.reviewCount || 0} reviews)</span>
          </div>
          <p class="price">From KSh ${vendor.minPrice || 300}</p>
          <button class="btn" onclick="event.stopPropagation(); showRestaurantDetail('${vendor.id}')" aria-label="View ${vendor.businessName} menu">
            View Menu
          </button>
        </div>
      </div>
    `;
  });
  
  vendorsContainer.innerHTML = vendorsHTML;
}

// FIXED: Enhanced addToCart function - removed sample dish references
function enhancedAddToCart(itemName, itemPrice, vendorId) {
  if (!isLoggedIn) {
    protectedOverlay.style.display = 'flex';
    return;
  }

  cart.push({
    name: itemName,
    price: itemPrice,
    vendorId: vendorId,
    id: Date.now().toString()
  });
  updateCartCount();
  saveCart();
  
  // Cart icon animation
  const cartIcon = document.querySelector('.cart-icon');
  cartIcon.classList.add('added');
  setTimeout(() => {
    cartIcon.classList.remove('added');
  }, 1000);
  
  showToast(`${itemName} added to cart!`, false, 'success');
}

// FIXED: Load vendors from Firebase instead of localStorage
async function loadVendors() {
  try {
    const vendorsSnapshot = await db.collection('vendors').where('status', '==', 'active').get();
    vendors = [];
    
    vendorsSnapshot.forEach(doc => {
      const vendorData = doc.data();
      vendors.push({
        id: doc.id,
        ...vendorData
      });
    });
    
    renderVendors();
    
  } catch (error) {
    console.error("Error loading vendors:", error);
    showToast("Error loading vendors", true);
    // Fallback to empty vendors array
    vendors = [];
    renderVendors();
  }
}

// FIXED: Enhanced vendor signup with image validation
async function signup() {
  try {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('userType').value;
    const termsAgreed = document.getElementById('termsAgree').checked;

    // Validate form
    const isNameValid = validateField(document.getElementById('signupName'), 'signupNameError', 'Please enter your full name');
    const isEmailValid = validateEmail(document.getElementById('signupEmail'), 'signupEmailError');
    const isPasswordValid = validatePassword(document.getElementById('signupPassword'), 'signupPasswordError');
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      showToast("Please fix the errors in the form", true);
      return;
    }
    
    if (!termsAgreed) {
      showToast("Please agree to the Terms of Service and Privacy Policy", true);
      return;
    }

    // Additional validation for sellers
    if (userType === 'seller') {
      const businessName = document.getElementById('businessName').value;
      const businessLocation = document.getElementById('businessLocation').value;
      
      if (!businessName || !businessLocation) {
        showToast("As a seller, please provide your business details", true);
        return;
      }
    }

    // Show enhanced loading state
    const signupButton = document.getElementById('signupButton');
    const originalText = showLoadingState(signupButton, 'Creating account...');
    
    showToast("Creating account...");
    
    // Prepare user data
    const userData = {
      name: name,
      userType: userType
    };
    
    // Add vendor-specific data if seller
    if (userType === 'seller') {
      userData.businessName = document.getElementById('businessName').value;
      userData.businessLocation = document.getElementById('businessLocation').value;
      userData.description = document.getElementById('description').value;
      userData.businessType = document.getElementById('deliveryMethod') ? document.getElementById('deliveryMethod').value : 'Food Vendor';
    }
    
    // Use Firebase signup
    firebaseAuth.signup(email, password, userData).then(result => {
      if (result.success) {
        if (userType === 'seller') {
          showToast("Account created! Your vendor profile is being set up.", false, 'success');
        } else {
          showToast("Account created successfully!", false, 'success');
        }
        isLoggedIn = true;
        currentUser = result.user;
        closeModals();
        
        // Reload vendors if user is a seller
        if (userType === 'seller') {
          loadVendors();
        }
      } else {
        showToast(result.error, true);
      }
      
      // Remove loading state
      hideLoadingState(signupButton, originalText);
    }).catch(error => {
      showToast("An unexpected error occurred", true);
      hideLoadingState(signupButton, originalText);
    });
  } catch (error) {
    console.error("Signup error:", error);
    showToast("An unexpected error occurred", true);
    
    // Remove loading state
    const signupButton = document.getElementById('signupButton');
    if (signupButton) {
      hideLoadingState(signupButton, 'Create Account');
    }
  }
}

// Enhanced showToast function with more options
function enhancedShowToast(message, isError = false, type = 'default', duration = 4000) {
  try {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : type === 'success' ? 'success' : ''}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${isError ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show the toast
    toast.style.display = 'block';
    
    // Auto-remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    }, duration);
  } catch (error) {
    console.error("Toast error:", error);
  }
}

// Image lazy loading enhancement
function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  simulateAuthState();
  enhancedInit();
  setupLazyLoading();
});

// Add event listeners for window resize and scroll
window.addEventListener('resize', checkBackgroundColor);
window.addEventListener('scroll', checkBackgroundColor);