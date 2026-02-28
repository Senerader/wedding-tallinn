// Countdown Timer - Counting down to the ceremony at 15:30
function updateCountdown() {
    const weddingDate = new Date('July 10, 2025 15:15:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(3, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

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

// Handle attendance selection
attendanceInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            guestDetails.style.display = 'block';
            foodSection.style.display = 'block';
            drinkSection.style.display = 'block';
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
            // If declining, still show guest details to know who is declining
            guestDetails.style.display = 'block';
            foodSection.style.display = 'none';
            drinkSection.style.display = 'none';
        }
    });
});

// Form submission - Now integrated with Formspree
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
            // Hide form and show success
            form.style.display = 'none';
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