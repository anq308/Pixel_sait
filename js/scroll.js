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
