/**
 * ShopEase - E-Commerce Website JavaScript
 * Handles cart functionality, UI interactions, and dynamic features
 */

// ===================================
// Cart Management
// ===================================

// Initialize cart from localStorage or create empty cart
let cart = JSON.parse(localStorage.getItem('shopEaseCart')) || [];

/**
 * Add item to cart
 * @param {string} productName - Name of the product
 * @param {number} price - Price of the product
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(productName, price, quantity = 1) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('shopEaseCart', JSON.stringify(cart));
    
    // Update cart count in navbar
    updateCartCount();
    
    // Show toast notification
    showToast(`${productName} added to cart!`, 'success');
}

/**
 * Remove item from cart
 * @param {number} index - Index of item to remove
 */
function removeFromCart(index) {
    const itemName = cart[index - 1].name; // Adjust for 1-based index
    cart.splice(index - 1, 1);
    
    // Save to localStorage
    localStorage.setItem('shopEaseCart', JSON.stringify(cart));
    
    // Update cart count and refresh display
    updateCartCount();
    showToast(`${itemName} removed from cart!`, 'warning');
    
    // Refresh cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        location.reload();
    }
}

/**
 * Update quantity of cart item
 * @param {number} index - Index of item (1-based)
 * @param {number} change - Change in quantity (+1 or -1)
 */
function updateCartItem(index, change) {
    const qtyInput = document.getElementById(`qty${index}`);
    let newQty = parseInt(qtyInput.value) + change;
    
    if (newQty < 1) {
        newQty = 1;
    } else if (newQty > 10) {
        newQty = 10;
        showToast('Maximum quantity is 10', 'error');
    }
    
    qtyInput.value = newQty;
    
    // Update total for this item
    const item = cart[index - 1];
    if (item) {
        const totalElement = document.getElementById(`total${index}`);
        if (totalElement) {
            totalElement.textContent = formatCurrency(item.price * newQty);
        }
    }
    
    // Update cart totals
    updateCartTotals();
}

/**
 * Clear entire cart
 */
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        localStorage.setItem('shopEaseCart', JSON.stringify(cart));
        updateCartCount();
        showToast('Cart cleared!', 'warning');
        
        // Refresh cart page if on cart page
        if (window.location.pathname.includes('cart.html')) {
            location.reload();
        }
    }
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count, .badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(el => {
        if (el.classList.contains('badge')) {
            // Update badge count
            el.textContent = totalItems;
        }
    });
}

/**
 * Update cart totals on cart page
 */
function updateCartTotals() {
    const subtotal = cart.reduce((sum, item, index) => {
        const qty = parseInt(document.getElementById(`qty${index + 1}`)?.value || item.quantity);
        return sum + (item.price * qty);
    }, 0);
    
    const tax = subtotal * 0.09; // 9% tax
    const shipping = subtotal > 50 ? 0 : 9.99;
    const discount = 0; // Could be updated with promo codes
    
    const total = subtotal + tax + shipping - discount;
    
    // Update display elements if they exist
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (taxEl) taxEl.textContent = formatCurrency(tax);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

/**
 * Apply promo code
 */
function applyPromo() {
    const promoInput = document.querySelector('.input-group input[type="text"]');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    // Demo promo codes
    const promoCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'FREESHIP': 0,
        'WELCOME15': 0.15
    };
    
    if (promoCodes[promoCode]) {
        const discount = promoCodes[promoCode];
        showToast(`Promo code applied! ${discount * 100}% off${discount === 0 ? ' + Free Shipping' : ''}`, 'success');
        promoInput.value = '';
    } else {
        showToast('Invalid promo code', 'error');
    }
}

// ===================================
// Product Details Page
// ===================================

/**
 * Update quantity on product details page
 * @param {number} change - Change in quantity (+1 or -1)
 */
function updateQuantity(change) {
    const qtyInput = document.getElementById('quantity');
    let newQty = parseInt(qtyInput.value) + change;
    
    if (newQty < 1) {
        newQty = 1;
    } else if (newQty > 10) {
        newQty = 10;
        showToast('Maximum quantity is 10', 'error');
    }
    
    qtyInput.value = newQty;
}

// ===================================
// Toast Notifications
// ===================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-primary';
    
    const iconClass = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    const toastHTML = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-header ${bgClass} text-white">
                <i class="fas ${iconClass} me-2"></i>
                <strong class="me-auto">ShopEase</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// ===================================
// Checkout Functions
// ===================================

/**
 * Place order
 */
function placeOrder() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    // Show loading state
    const placeOrderBtn = document.querySelector('#checkoutModal .btn-primary');
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    placeOrderBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Clear cart
        cart = [];
        localStorage.setItem('shopEaseCart', JSON.stringify(cart));
        updateCartCount();
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        modal.hide();
        
        // Reset button
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
        
        // Show success message
        showToast('Order placed successfully! Thank you for shopping with us!', 'success');
        
        // Redirect to thank you page after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 2000);
}

// ===================================
// Utility Functions
// ===================================

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
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

// ===================================
// Event Listeners
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count on page load
    updateCartCount();
    
    // Mobile sidebar toggle for admin panel
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992 && 
                !adminSidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                adminSidebar.classList.remove('show');
            }
        });
    }
    
    // Form validation feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Rating star hover effect
    const ratingInputs = document.querySelectorAll('.rating-input i');
    ratingInputs.forEach((star, index) => {
        star.addEventListener('mouseenter', function() {
            const stars = this.parentElement.querySelectorAll('i');
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            // Reset to original state
            const stars = this.parentElement.querySelectorAll('i');
            stars.forEach(s => {
                // This would need the actual rating value in a real implementation
                s.classList.remove('fas');
                s.classList.add('far');
            });
        });
    });
    
    // Product image gallery thumbnails
    const productThumbnails = document.querySelectorAll('.product-details-image');
    if (productThumbnails.length > 1) {
        productThumbnails.forEach((thumb, index) => {
            if (index > 0) { // Skip main image
                thumb.style.cursor = 'pointer';
                thumb.addEventListener('click', function() {
                    // Swap with main image (simplified implementation)
                    showToast('Image gallery click handled', 'info');
                });
            }
        });
    }
    
    // Quantity button click handlers for product details page
    const qtyBtns = document.querySelectorAll('.quantity-selector .quantity-btn');
    qtyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input && input.id === 'quantity') {
                const change = this.textContent === '+' ? 1 : -1;
                updateQuantity(change);
            }
        });
    });
    
    // Search functionality
    const searchForms = document.querySelectorAll('form.d-flex');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            if (searchInput && searchInput.value.trim()) {
                window.location.href = `products.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    });
    
    // Wishlist toggle
    const wishlistBtns = document.querySelectorAll('.btn-outline-danger');
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.querySelector('.fas.fa-heart')) {
                this.classList.remove('btn-outline-danger');
                this.classList.add('btn-danger');
                this.querySelector('.fas').classList.remove('fa-heart');
                this.querySelector('.fas').classList.add('fa-heart-broken');
                showToast('Added to wishlist!', 'success');
            } else {
                this.classList.remove('btn-danger');
                this.classList.add('btn-outline-danger');
                this.querySelector('.fas').classList.add('fa-heart');
                this.querySelector('.fas').classList.remove('fa-heart-broken');
                showToast('Removed from wishlist', 'warning');
            }
        });
    });
    
    // Compare products (demo functionality)
    const compareBtns = document.querySelectorAll('[data-compare]');
    compareBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Added to compare list!', 'success');
        });
    });
    
    // Quick view buttons
    const quickViewBtns = document.querySelectorAll('[data-quickview]');
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            showToast(`Quick view: ${productName}`, 'info');
        });
    });
    
    // Admin sidebar submenu toggle (if needed)
    const adminNavItems = document.querySelectorAll('.admin-nav-item');
    adminNavItems.forEach(item => {
        item.addEventListener('click', function() {
            adminNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Chart period buttons
    const chartPeriodBtns = document.querySelectorAll('.chart-card .btn-group .btn');
    chartPeriodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            chartPeriodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});
