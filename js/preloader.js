const preloader = document.querySelector('.preloader');
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500);
});

// Fallback
setTimeout(() => {
    preloader.classList.add('hidden');
}, 2000);
