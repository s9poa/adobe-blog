// Class Names:
// .custom_cursor - <div>

// .custom_cursor {
//     opacity: 0
// }

document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom_cursor');
    if (!cursor || 'ontouchstart' in window || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cursor && (cursor.style.display = 'none');
        return;
    }

    const config = {
        size: 50,
        speed: .9
    };

    Object.assign(cursor.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: `${config.size}px`,
        height: `${config.size}px`,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',
        transition: 'none'
    });

    requestAnimationFrame(() => {
        cursor.style.transition = 'transform 0.1s, opacity 0.3s';
    });

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const speed = config.speed;
    const cursorStyle = cursor.style;
    let frameId;

    const throttle = (fn, wait) => {
        let last = 0;
        return (...args) => {
            const now = performance.now();
            if (now - last >= wait) {
                last = now;
                fn(...args);
            }
        };
    };

    const updateMouse = throttle(e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorStyle.opacity = '1';
    }, 16);

    document.addEventListener('mousemove', updateMouse);
    document.addEventListener('mouseleave', () => cursorStyle.opacity = '0');
    document.addEventListener('mouseenter', () => cursorStyle.opacity = '1');

    const animate = () => {
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        cursorStyle.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frameId);
        } else {
            frameId = requestAnimationFrame(animate);
        }
    });

    window.addEventListener('resize', () => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
    });
});