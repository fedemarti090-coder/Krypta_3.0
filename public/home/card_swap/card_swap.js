import gsap from '../../../node_modules/gsap/index.js';

export function createCardSwap({
    cardsData = [],
    width = 420,
    height = 340,
    cardDistance = 50,
    verticalDistance = 45,
    delay = 4000,
    skewAmount = 4,
    easing = 'elastic'
}) {
    const container = document.createElement('div');
    container.className = 'card-swap-container';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    const config = easing === 'elastic' ? {
        ease: 'elastic.out(0.6,0.9)',
        durDrop: 2,
        durMove: 2,
        durReturn: 2,
        promoteOverlap: 0.9,
        returnDelay: 0.05
    } : {
        ease: 'power1.inOut',
        durDrop: 0.8,
        durMove: 0.8,
        durReturn: 0.8,
        promoteOverlap: 0.45,
        returnDelay: 0.2
    };

    const makeSlot = (i, distX, distY, total) => ({
        x: i * distX,
        y: -i * distY,
        z: -i * distX * 1.5,
        zIndex: total - i
    });

    const placeNow = (el, slot, skew) => {
        gsap.set(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            xPercent: -50,
            yPercent: -50,
            skewY: skew,
            transformOrigin: 'center center',
            zIndex: slot.zIndex,
            force3D: true
        });
    };

    const cardElements = cardsData.map(data => {
        const card = document.createElement('div');
        card.className = 'card-swap-item';
        card.innerHTML = `
            <div class="card-tag">
                ${data.icon ? `<span class="card-icon">${data.icon}</span>` : '<span class="card-tag-dot"></span>'}
                <span>${data.tag}</span>
            </div>
        `;
        container.appendChild(card);
        return card;
    });

    const total = cardElements.length;
    const order = Array.from({ length: total }, (_, i) => i);

    cardElements.forEach((el, i) => placeNow(el, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

    let intervalId = null;

    const swap = () => {
        if (order.length < 2) return;

        const [front, ...rest] = order;
        const elFront = cardElements[front];
        const tl = gsap.timeline();

        tl.to(elFront, {
            y: '+=450',
            duration: config.durDrop,
            ease: config.ease
        });

        tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
        rest.forEach((idx, i) => {
            const el = cardElements[idx];
            const slot = makeSlot(i, cardDistance, verticalDistance, total);
            tl.set(el, { zIndex: slot.zIndex }, 'promote');
            tl.to(el, {
                x: slot.x,
                y: slot.y,
                z: slot.z,
                duration: config.durMove,
                ease: config.ease
            }, `promote+=${i * 0.15}`);
        });

        const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
        tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
        tl.call(() => {
            gsap.set(elFront, { zIndex: backSlot.zIndex });
        }, undefined, 'return');

        tl.to(elFront, {
            x: backSlot.x,
            y: backSlot.y,
            z: backSlot.z,
            duration: config.durReturn,
            ease: config.ease
        }, 'return');

        tl.call(() => {
            order.splice(0, order.length, ...rest, front);
        });
    };

    intervalId = setInterval(swap, delay);

    return container;
}