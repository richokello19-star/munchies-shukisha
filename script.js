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

// Enhanced addToCart function with animation
function enhancedAddToCart(itemName, itemPrice) {
  if (!isLoggedIn) {
    protectedOverlay.style.display = 'flex';
    return;
  }

  cart.push({
    name: itemName,
    price: itemPrice,
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