document.addEventListener("DOMContentLoaded", () => {
    // Создаем элемент курсора
    const cursor = document.createElement('div');
    cursor.id = 'ascii-cursor';
    cursor.textContent = '[+]';
    document.body.appendChild(cursor);

    // Следим за мышью (без задержек и плавных анимаций, жесткий трекинг)
    document.addEventListener("mousemove", (e) => {
        cursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
        if (cursor.style.display === 'none') {
            cursor.style.display = 'block';
        }
    });

    document.addEventListener("mouseleave", () => {
        cursor.style.display = 'none';
    });

    // Функция смены текста
    const setCursor = (text) => {
        cursor.textContent = text;
    };

    // Привязываем к интерактивным элементам
    const bindHover = (selector, textHover, textDefault = '[+]') => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => setCursor(textHover));
            el.addEventListener('mouseleave', () => setCursor(textDefault));
        });
    };

    bindHover('a, button, .btn, input, textarea, .faq-item', '[GO]');
    bindHover('.project-card-custom', '[VIEW]');
    
    // Для 3D канваса (если он подгружается динамически)
    const canvasObserver = new MutationObserver(() => {
        const canvas = document.querySelector('canvas');
        if (canvas && !canvas.hasAttribute('data-cursor-bound')) {
            canvas.setAttribute('data-cursor-bound', 'true');
            canvas.addEventListener('mouseenter', () => setCursor('[3D]'));
            canvas.addEventListener('mouseleave', () => setCursor('[+]'));
        }
    });
    
    canvasObserver.observe(document.body, { childList: true, subtree: true });
});
