// INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
const revealElements = document.querySelectorAll('.reveal-text, .service-card, .project-item, .process-step, .bento-item, .scroll-block');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => {
    observer.observe(el);
});

// WORD REVEAL 3D ANIMATION FOR HEADINGS
const headingElements = document.querySelectorAll('.section-header h2, .about-title h2');

headingElements.forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    const words = text.split(' ');
    
    words.forEach((word, index) => {
        const mask = document.createElement('span');
        mask.style.display = 'inline-block';
        mask.style.perspective = '600px';
        mask.style.marginRight = index < words.length - 1 ? '0.25em' : '0';
        
        const inner = document.createElement('span');
        inner.innerText = word;
        inner.classList.add('word-reveal');
        inner.style.display = 'inline-block';
        inner.style.transitionDelay = `${index * 0.1}s`;
        
        mask.appendChild(inner);
        el.appendChild(mask);
    });
    
    el.classList.add('word-reveal-container');
    observer.observe(el);
});

// HORIZONTAL SCROLL FOR PROJECTS
const projectsSection = document.querySelector('.projects');
const projectsSlider = document.querySelector('.projects-slider');

if (projectsSection && projectsSlider) {
    window.addEventListener('scroll', () => {
        const sectionTop = projectsSection.offsetTop;
        const sectionHeight = projectsSection.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.pageYOffset;
        
        const maxTranslate = projectsSlider.scrollWidth - window.innerWidth + 100;
        
        if (scrollPosition < sectionTop) {
            projectsSlider.style.transform = `translateX(0px)`;
        } else if (scrollPosition > sectionTop + sectionHeight - windowHeight) {
            projectsSlider.style.transform = `translateX(-${maxTranslate}px)`;
        } else {
            const progress = (scrollPosition - sectionTop) / (sectionHeight - windowHeight);
            projectsSlider.style.transform = `translateX(-${progress * maxTranslate}px)`;
        }
    });
}
