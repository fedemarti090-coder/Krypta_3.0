const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

const toCssLength = value => (typeof value === 'number' ? `${value}px` : (value ?? undefined));

export class LogoLoopClass {
    constructor(options = {}) {
        this.logos = options.logos || [];
        this.speed = options.speed ?? 80;
        this.direction = options.direction || 'left';
        this.width = options.width || '100%';
        this.logoHeight = options.logoHeight ?? 28;
        this.gap = options.gap ?? 32;
        this.pauseOnHover = options.pauseOnHover;
        this.hoverSpeed = options.hoverSpeed;
        this.fadeOut = options.fadeOut ?? false;
        this.fadeOutColor = options.fadeOutColor;
        this.scaleOnHover = options.scaleOnHover ?? false;
        this.renderItem = options.renderItem;
        this.ariaLabel = options.ariaLabel || 'Partner logos';
        this.className = options.className || '';

        // Callback per la gestione dell'hover
        this.onHover = options.onHover;
        this.onLeave = options.onLeave;

        this.isVertical = this.direction === 'up' || this.direction === 'down';

        // Gestione velocità al passaggio del mouse
        if (this.hoverSpeed !== undefined) {
            this.effectiveHoverSpeed = this.hoverSpeed;
        } else if (this.pauseOnHover === true) {
            this.effectiveHoverSpeed = 0;
        } else if (this.pauseOnHover === false) {
            this.effectiveHoverSpeed = undefined;
        } else {
            this.effectiveHoverSpeed = 0;
        }

        // Calcolo velocità target
        const magnitude = Math.abs(this.speed);
        let directionMultiplier = this.isVertical
            ? (this.direction === 'up' ? 1 : -1)
            : (this.direction === 'left' ? 1 : -1);
        const speedMultiplier = this.speed < 0 ? -1 : 1;
        this.targetVelocity = magnitude * directionMultiplier * speedMultiplier;

        // Stato Animazione
        this.rafId = null;
        this.lastTimestamp = null;
        this.offset = 0;
        this.velocity = 0;
        this.isHovered = false;
        this.seqWidth = 0;
        this.seqHeight = 0;
        this.copyCount = ANIMATION_CONFIG.MIN_COPIES;

        this.container = null;
        this.track = null;
        this.seqRef = null;
        this.resizeObserver = null;
    }

    createLogoItem(item, key) {
        const li = document.createElement('li');
        li.className = 'logoloop__item';
        li.setAttribute('role', 'listitem');

        // Gestione Eventi Hover per aggiornare il testo dinamico
        const brandName = item.title || item.alt || '';

        if (this.onHover) {
            li.addEventListener('mouseenter', () => this.onHover(brandName));
        }
        if (this.onLeave) {
            li.addEventListener('mouseleave', () => this.onLeave());
        }

        if (this.renderItem) {
            const customContent = this.renderItem(item, key);
            if (typeof customContent === 'string') {
                li.innerHTML = customContent;
            } else if (customContent instanceof HTMLElement) {
                li.appendChild(customContent);
            }
            return li;
        }

        const isNodeItem = 'node' in item;
        let content;

        if (isNodeItem) {
            const span = document.createElement('span');
            span.className = 'logoloop__node';
            if (item.href && !item.ariaLabel) {
                span.setAttribute('aria-hidden', 'true');
            }
            if (typeof item.node === 'string') {
                span.innerHTML = item.node;
            } else if (item.node instanceof HTMLElement) {
                span.appendChild(item.node);
            }
            content = span;
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            if (item.srcSet) img.srcset = item.srcSet;
            if (item.sizes) img.sizes = item.sizes;
            if (item.width) img.width = item.width;
            if (item.height) img.height = item.height;
            img.alt = item.alt ?? '';
            // Rimossa la riga img.title per disabilitare l'etichetta tooltip del browser
            img.loading = 'eager';
            img.decoding = 'async';
            img.draggable = false;
            content = img;
        }

        const itemAriaLabel = isNodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);

        if (item.href) {
            const a = document.createElement('a');
            a.className = 'logoloop__link';
            a.href = item.href;
            a.setAttribute('aria-label', itemAriaLabel || 'logo link');
            a.target = '_blank';
            a.rel = 'noreferrer noopener';
            a.appendChild(content);
            li.appendChild(a);
        } else {
            li.appendChild(content);
        }

        return li;
    }

    renderLists() {
        if (!this.track) return;
        this.track.innerHTML = '';

        for (let copyIndex = 0; copyIndex < this.copyCount; copyIndex++) {
            const ul = document.createElement('ul');
            ul.className = 'logoloop__list';
            ul.setAttribute('role', 'list');
            if (copyIndex > 0) {
                ul.setAttribute('aria-hidden', 'true');
            } else {
                this.seqRef = ul;
            }

            this.logos.forEach((item, itemIndex) => {
                const li = this.createLogoItem(item, `${copyIndex}-${itemIndex}`);
                ul.appendChild(li);
            });

            this.track.appendChild(ul);
        }
    }

    updateDimensions() {
        if (!this.container || !this.seqRef) return;

        const containerWidth = this.container.clientWidth || 0;
        const sequenceRect = this.seqRef.getBoundingClientRect();
        const sequenceWidth = sequenceRect.width || 0;
        const sequenceHeight = sequenceRect.height || 0;

        let newCopyCount = this.copyCount;

        if (this.isVertical) {
            const parentHeight = this.container.parentElement?.clientHeight || 0;
            if (parentHeight > 0) {
                const targetHeight = Math.ceil(parentHeight);
                if (this.container.style.height !== `${targetHeight}px`) {
                    this.container.style.height = `${targetHeight}px`;
                }
            }
            if (sequenceHeight > 0) {
                this.seqHeight = Math.ceil(sequenceHeight);
                const viewport = this.container.clientHeight || parentHeight || sequenceHeight;
                const copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM;
                newCopyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
            }
        } else if (sequenceWidth > 0) {
            this.seqWidth = Math.ceil(sequenceWidth);
            const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
            newCopyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
        }

        if (newCopyCount !== this.copyCount) {
            this.copyCount = newCopyCount;
            this.renderLists();
        }
    }

    setupResizeObserver() {
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
            this.resizeObserver.observe(this.container);
            if (this.seqRef) this.resizeObserver.observe(this.seqRef);
        } else {
            window.addEventListener('resize', () => this.updateDimensions());
        }
    }

    setupImageLoader() {
        if (!this.seqRef) return;
        const images = this.seqRef.querySelectorAll('img');
        if (images.length === 0) {
            this.updateDimensions();
            return;
        }

        let remaining = images.length;
        const handleImageLoad = () => {
            remaining -= 1;
            if (remaining === 0) this.updateDimensions();
        };

        images.forEach(img => {
            if (img.complete) {
                handleImageLoad();
            } else {
                img.addEventListener('load', handleImageLoad, { once: true });
                img.addEventListener('error', handleImageLoad, { once: true });
            }
        });
    }

    animate(timestamp) {
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        const target = this.isHovered && this.effectiveHoverSpeed !== undefined
            ? this.effectiveHoverSpeed
            : this.targetVelocity;

        const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
        this.velocity += (target - this.velocity) * easingFactor;

        const seqSize = this.isVertical ? this.seqHeight : this.seqWidth;

        if (seqSize > 0 && this.track) {
            let nextOffset = this.offset + this.velocity * deltaTime;
            nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
            this.offset = nextOffset;

            const transformValue = this.isVertical
                ? `translate3d(0, ${-this.offset}px, 0)`
                : `translate3d(${-this.offset}px, 0, 0)`;
            this.track.style.transform = transformValue;
        }

        this.rafId = requestAnimationFrame(t => this.animate(t));
    }

    render() {
        this.container = document.createElement('div');

        const rootClasses = [
            'logoloop',
            this.isVertical ? 'logoloop--vertical' : 'logoloop--horizontal',
            this.fadeOut && 'logoloop--fade',
            this.scaleOnHover && 'logoloop--scale-hover',
            this.className
        ].filter(Boolean).join(' ');

        this.container.className = rootClasses;
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', this.ariaLabel);

        const widthVal = toCssLength(this.width);
        if (this.isVertical) {
            if (widthVal && widthVal !== '100%') this.container.style.width = widthVal;
        } else {
            this.container.style.width = widthVal ?? '100%';
        }

        this.container.style.setProperty('--logoloop-gap', `${this.gap}px`);
        this.container.style.setProperty('--logoloop-logoHeight', `${this.logoHeight}px`);
        if (this.fadeOutColor) {
            this.container.style.setProperty('--logoloop-fadeColor', this.fadeOutColor);
        }

        this.track = document.createElement('div');
        this.track.className = 'logoloop__track';

        if (this.effectiveHoverSpeed !== undefined) {
            this.track.addEventListener('mouseenter', () => { this.isHovered = true; });
            this.track.addEventListener('mouseleave', () => { this.isHovered = false; });
        }

        this.container.appendChild(this.track);

        this.renderLists();

        setTimeout(() => {
            this.setupImageLoader();
            this.setupResizeObserver();
            this.updateDimensions();
            this.rafId = requestAnimationFrame(t => this.animate(t));
        }, 0);

        return this.container;
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }
}