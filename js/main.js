// MAGNETIC BUTTONS
const buttons = document.querySelectorAll('.btn, .btn-cta');
buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
    });
});

// NAVBAR SCROLL EFFECT
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// COMPETENCIES BROWSER TABS
const sidebarItems = document.querySelectorAll('.sidebar-item');
const displayContents = document.querySelectorAll('.display-content');

function typeText(p, speed = 15) {
    if (!p) return;
    if (p.timeoutId) {
        clearTimeout(p.timeoutId);
    }
    const originalText = p.getAttribute('data-text') || p.textContent;
    p.setAttribute('data-text', originalText); // save original text
    p.textContent = ''; // clear text
    
    let i = 0;
    function type() {
        if (i < originalText.length) {
            p.textContent += originalText.charAt(i);
            if (window.playTypingSound) {
                window.playTypingSound();
            }
            i++;
            p.timeoutId = setTimeout(type, speed);
        }
    }
    type();
}

sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        
        // Remove active class from all items and contents
        sidebarItems.forEach(i => i.classList.remove('active'));
        displayContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked item and target content
        item.classList.add('active');
        const activeContent = document.getElementById(target);
        activeContent.classList.add('active');
        
        // Typing effect for the active paragraph
        const p = activeContent.querySelector('p');
        typeText(p);
    });
});

// Trigger typing for the initial active tab on load
const initialActiveP = document.querySelector('.display-content.active p');
if (initialActiveP) {
    typeText(initialActiveP);
}

// STATS COUNTER ANIMATION
const stats = document.querySelectorAll('.stat-num');
const statsSection = document.querySelector('.stats');
let counted = false;

const countObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !counted) {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            let count = 0;
            const speed = 2000 / target;
            
            const updateCount = () => {
                if (count < target) {
                    count++;
                    stat.innerText = count;
                    setTimeout(updateCount, speed);
                } else {
                    stat.innerText = target;
                }
            };
            updateCount();
        });
        counted = true;
    }
}, { threshold: 0.5 });

if (statsSection) countObserver.observe(statsSection);

// FAQ ACCORDION
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(i => {
            i.classList.remove('active');
            // Stop typing if another item is clicked
            const p = i.querySelector('.faq-content p');
            if (p && p.timeoutId) {
                clearTimeout(p.timeoutId);
                if (p.getAttribute('data-text')) {
                    p.textContent = p.getAttribute('data-text');
                }
            }
        });
        
        if (!isActive) {
            item.classList.add('active');
            const p = item.querySelector('.faq-content p');
            if (p) {
                typeText(p, 10); // slightly faster for longer text
            }
        }
    });
});

// PARALLAX EFFECT FOR HERO BLURS
const circles = document.querySelectorAll('.circle-blur, .circle-blur-2');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    circles.forEach((circle, index) => {
        const factor = (index + 1) * 30;
        circle.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});
