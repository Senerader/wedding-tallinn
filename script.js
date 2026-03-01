// Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    document.body.style.overflow = menu.classList.contains('hidden') ? 'auto' : 'hidden';
}

// Form Handling
const form = document.getElementById('rsvp-form');
const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
const guestDetails = document.getElementById('guest-details');
const foodSection = document.getElementById('food-section');
const drinkSection = document.getElementById('drink-section');
const successMessage = document.getElementById('success-message');
const guestsNumberSection = document.getElementById('guests-number-section'); 
const emailSection = document.getElementById('email-section'); 
const dietarySection = document.getElementById('dietary-section'); 

// Handle attendance selection
attendanceInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const emailField = form.querySelector('[name="email"]');
        const guestsField = form.querySelector('[name="guests"]');
        
        if (e.target.value === 'yes') {
            guestDetails.style.display = 'block';
            foodSection.style.display = 'block';
            drinkSection.style.display = 'block';
            guestsNumberSection.style.display = 'block'; 
            emailSection.style.display = 'block';
            dietarySection.style.display = 'block';
            // Add required attributes back for acceptance
            emailField.setAttribute('required', '');
            guestsField.setAttribute('required', '');
            // Add animation
            [guestDetails, foodSection, drinkSection].forEach((el, i) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'all 0.5s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, i * 100);
            });
        } else {
            // If declining, still show guest details but remove required from email and guests
            guestDetails.style.display = 'block';
            foodSection.style.display = 'none';
            drinkSection.style.display = 'none';
            guestsNumberSection.style.display = 'none'; 
            emailSection.style.display = 'none';
            dietarySection.style.display = 'none';
            // Remove required attributes so only name is mandatory
            emailField.removeAttribute('required');
            guestsField.removeAttribute('required');
        }
    });
});

// Form validation feedback
function showFieldError(fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-400 text-xs mt-1 flex items-center gap-1 animate-fade-in';
    errorDiv.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i><span>${message}</span>`;
    
    // Add error after field
    if (field.type === 'radio') {
        // For radio buttons, find the parent container
        const container = field.closest('.space-y-4') || field.parentElement.parentElement;
        container.appendChild(errorDiv);
    } else {
        field.parentElement.appendChild(errorDiv);
    }
    
    // Highlight field
    if (field.type !== 'radio') {
        field.classList.add('border-red-400/60', 'bg-red-500/10');
    }
    
    // Reinitialize icons
    if (window.lucide) lucide.createIcons();
}

function clearFieldErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('border-red-400/60', 'bg-red-500/10');
    });
}

function validateForm() {
    clearFieldErrors();
    let isValid = true;
    let firstErrorField = null;
    
    // Check attendance (required)
    const attendance = form.querySelector('input[name="attendance"]:checked');
    if (!attendance) {
        showFieldError('attendance', 'Please select whether you will attend or not');
        isValid = false;
        if (!firstErrorField) firstErrorField = form.querySelector('input[name="attendance"]');
    }
    
    const selectedAttendance = attendance ? attendance.value : null;
    
    if (selectedAttendance === 'yes' || selectedAttendance === 'no') {
        // Name is always mandatory for both acceptance and decline
        const name = form.querySelector('[name="name"]');
        if (!name.value.trim()) {
            showFieldError('name', 'Please enter your full name');
            isValid = false;
            if (!firstErrorField) firstErrorField = name;
        }
    }
    
    // Different validation for acceptance vs decline
    if (selectedAttendance === 'yes') {
        // For acceptance: all fields except dietary restrictions text field are mandatory
        const email = form.querySelector('[name="email"]');
        if (!email.value.trim()) {
            showFieldError('email', 'Please enter your email address');
            isValid = false;
            if (!firstErrorField) firstErrorField = email;
        } else if (!email.value.includes('@')) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
            if (!firstErrorField) firstErrorField = email;
        }
        
        const guests = form.querySelector('[name="guests"]');
        if (!guests.value) {
            showFieldError('guests', 'Please select the number of guests');
            isValid = false;
            if (!firstErrorField) firstErrorField = guests;
        }
        
        // Note: Dietary preferences checkboxes and drinks checkboxes are optional
        // Dietary restrictions text field is optional as requested
    } else if (selectedAttendance === 'no') {
        // For decline: ONLY name is mandatory
        // Email and guests are optional - we don't validate them at all
        // Dietary sections are hidden anyway
    }
    
    // Scroll to first error
    if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}

// Clear errors on input
form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('change', () => {
        const error = field.parentElement.querySelector('.field-error');
        if (error) {
            error.remove();
            field.classList.remove('border-red-400/60', 'bg-red-500/10');
        }
    });
});

// Form submission - Now integrated with Formspree
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate first
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Sending...</span>';
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Hide form, urgency notice and show success
            form.style.display = 'none';
            const urgencyNotice = document.getElementById('urgency-notice');
            if (urgencyNotice) {
                urgencyNotice.style.display = 'none';
            }
            successMessage.classList.remove('hidden');
            
            // Reinitialize icons for success message
            if (window.lucide) {
                lucide.createIcons();
            }
            
            // Smooth scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Confetti effect could be added here!
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        // Show error but keep it friendly
        submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2 text-red-200"><i data-lucide="alert-circle" class="w-4 h-4"></i> Oops! Please try again</span>';
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            lucide.createIcons();
        }, 3000);
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.glass-card, .glass-timeline').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('header');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Smooth reveal for timeline items
const timelineItems = document.querySelectorAll('.group');
timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `all 0.6s ease ${index * 0.2}s`;
    
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.2 });
    
    itemObserver.observe(item);
});

// Add floating animation to specific elements randomly
document.querySelectorAll('.glass-sub').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.1}s`;
});

// Prevent form submission on Enter key for better UX
form.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Console welcome message
console.log('%c💍 Mark & Daria 2025', 'font-size: 24px; font-weight: bold; color: #a855f7;');
console.log('%cThank you for checking out our wedding invite!', 'font-size: 14px; color: #c084fc;');
