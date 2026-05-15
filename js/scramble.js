const scrambleElements = document.querySelectorAll('.scramble-trigger');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

scrambleElements.forEach(el => {
    const originalText = el.getAttribute('data-text') || el.innerText;
    let interval = null;
    
    el.addEventListener('mouseover', () => {
        let iteration = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
            el.innerText = originalText
                .split('')
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            
            iteration += 1 / 3;
        }, 30);
    });
});
