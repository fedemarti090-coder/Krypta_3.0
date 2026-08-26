
export function initDecryptedText({
    container,
    text,
    speed = 40,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    sequential = true,
    revealDirection = 'start',
    animateOn = 'view',
    className = 'revealed',
    encryptedClassName = 'encrypted'
}) {
    if (!container) return;

    const availableChars = characters.split('');
    const textLength = text.length;

    // Struttura HTML accessibile (screen reader legge il testo vero, l'utente vede l'effetto)
    container.style.display = 'inline-block';
    container.style.whiteSpace = 'pre-wrap';

    const srOnly = document.createElement('span');
    srOnly.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    srOnly.textContent = text;

    const visualSpan = document.createElement('span');
    visualSpan.setAttribute('aria-hidden', 'true');

    container.innerHTML = '';
    container.appendChild(srOnly);
    container.appendChild(visualSpan);

    const charSpans = [];
    for (let i = 0; i < textLength; i++) {
        const span = document.createElement('span');
        span.textContent = text[i] === ' ' ? ' ' : availableChars[Math.floor(Math.random() * availableChars.length)];
        span.className = encryptedClassName;
        visualSpan.appendChild(span);
        charSpans.push(span);
    }

    let intervalId = null;
    let isAnimating = false;
    const revealedIndices = new Set();

    // Genera l'ordine di rivelazione dei caratteri
    function getNextIndex() {
        if (revealDirection === 'start') {
            return revealedIndices.size;
        } else if (revealDirection === 'end') {
            return textLength - 1 - revealedIndices.size;
        } else if (revealDirection === 'center') {
            const middle = Math.floor(textLength / 2);
            const offset = Math.floor(revealedIndices.size / 2);
            const nextIdx = revealedIndices.size % 2 === 0 ? middle + offset : middle - offset - 1;
            if (nextIdx >= 0 && nextIdx < textLength && !revealedIndices.has(nextIdx)) {
                return nextIdx;
            }
            for (let i = 0; i < textLength; i++) {
                if (!revealedIndices.has(i)) return i;
            }
        }
        return revealedIndices.size;
    }

    function startAnimation() {
        if (isAnimating) return;
        isAnimating = true;
        revealedIndices.clear();

        intervalId = setInterval(() => {
            if (revealedIndices.size < textLength) {
                const nextIndex = getNextIndex();
                revealedIndices.add(nextIndex);

                // Aggiorna lo stato visivo di ogni carattere
                for (let i = 0; i < textLength; i++) {
                    if (text[i] === ' ') continue;

                    if (revealedIndices.has(i)) {
                        charSpans[i].textContent = text[i];
                        charSpans[i].className = className;
                    } else {
                        charSpans[i].textContent = availableChars[Math.floor(Math.random() * availableChars.length)];
                        charSpans[i].className = encryptedClassName;
                    }
                }
            } else {
                clearInterval(intervalId);
                isAnimating = false;
            }
        }, speed);
    }

    // Gestione Triggers
    if (animateOn === 'view') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(container);
    } else if (animateOn === 'hover') {
        container.addEventListener('mouseenter', startAnimation);
    } else if (animateOn === 'click') {
        container.addEventListener('click', startAnimation);
    }
}