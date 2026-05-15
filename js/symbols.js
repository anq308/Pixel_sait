function initFlyingSymbols() {
    const chars = '*!?&^%$@#';
    const count = 40;
    
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.innerText = chars[Math.floor(Math.random() * chars.length)];
        span.style.position = 'fixed';
        span.style.color = 'rgba(255, 255, 255, 0.1)';
        span.style.fontFamily = "'Press Start 2P', monospace";
        span.style.fontSize = Math.random() * 20 + 10 + 'px';
        span.style.left = Math.random() * 100 + 'vw';
        span.style.top = Math.random() * 100 + 'vh';
        span.style.zIndex = '-1';
        span.style.pointerEvents = 'none';
        span.style.filter = 'blur(1px)'; // Add soft blur
        
        const speedX = (Math.random() - 0.5) * 0.15; // Slower speed
        const speedY = (Math.random() - 0.5) * 0.15;
        
        function move() {
            let x = parseFloat(span.style.left);
            let y = parseFloat(span.style.top);
            
            x += speedX;
            y += speedY;
            
            if (x < -5) x = 105;
            if (x > 105) x = -5;
            if (y < -5) y = 105;
            if (y > 105) y = -5;
            
            span.style.left = x + 'vw';
            span.style.top = y + 'vh';
            
            requestAnimationFrame(move);
        }
        
        document.body.appendChild(span);
        move();
    }
}

initFlyingSymbols();
