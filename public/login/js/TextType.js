export class TextType {
  constructor(element, options = {}) {
    this.container = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.container) return;

    const textInput = options.text || ["Text typing effect", "for your websites"];
    this.textArray = Array.isArray(textInput) ? textInput : [textInput];

    this.typingSpeed = options.typingSpeed ?? 50;
    this.deletingSpeed = options.deletingSpeed ?? 30;
    this.pauseDuration = options.pauseDuration ?? 2000;
    this.initialDelay = options.initialDelay ?? 0;
    this.loop = options.loop ?? true;
    this.showCursor = options.showCursor ?? true;
    this.cursorCharacter = options.cursorCharacter ?? '|';
    this.textColors = options.textColors || [];
    this.variableSpeed = options.variableSpeed || null;
    this.rtl = options.rtl ?? false; // <-- Nuova opzione per Scrittura da DX a SX

    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.displayedText = '';
    this.timeoutId = null;

    this.init();
  }

  init() {
    this.container.classList.add('text-type');

    // Se RTL è attivo, posizioniamo il cursore a sinistra del testo
    if (this.rtl) {
      this.container.classList.add('text-type--rtl');
      this.container.innerHTML = `
        ${this.showCursor ? `<span class="text-type__cursor">${this.cursorCharacter}</span>` : ''}
        <span class="text-type__content"></span>
      `;
    } else {
      this.container.innerHTML = `
        <span class="text-type__content"></span>
        ${this.showCursor ? `<span class="text-type__cursor">${this.cursorCharacter}</span>` : ''}
      `;
    }

    this.contentEl = this.container.querySelector('.text-type__content');
    this.cursorEl = this.container.querySelector('.text-type__cursor');

    if (this.initialDelay > 0) {
      this.timeoutId = setTimeout(() => this.tick(), this.initialDelay);
    } else {
      this.tick();
    }
  }

  getRandomSpeed() {
    if (!this.variableSpeed) return this.typingSpeed;
    const { min, max } = this.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  getCurrentColor() {
    if (this.textColors.length === 0) return 'inherit';
    return this.textColors[this.currentTextIndex % this.textColors.length];
  }

  tick() {
    const currentText = this.textArray[this.currentTextIndex];

    if (this.isDeleting) {
      this.currentCharIndex--;
    } else {
      this.currentCharIndex++;
    }

    if (this.isDeleting) {
      // CANCELLAZIONE: Mangia da SX verso DX mantenendo la coda della frase
      this.displayedText = currentText.substring(currentText.length - this.currentCharIndex);

      // Mette il cursore a SINISTRA mentre cancella
      if (this.showCursor && this.cursorEl) {
        this.container.appendChild(this.contentEl);
        this.container.insertBefore(this.cursorEl, this.contentEl);
      }
    } else {
      // SCRITTURA: Aggiunge caratteri in ordine naturale da SX a DX
      this.displayedText = currentText.substring(0, this.currentCharIndex);

      // Mette il cursore a DESTRA mentre scrive
      if (this.showCursor && this.cursorEl) {
        this.container.appendChild(this.cursorEl);
      }
    }

    this.contentEl.textContent = this.displayedText;
    this.contentEl.style.color = this.getCurrentColor();

    let delay = this.isDeleting ? this.deletingSpeed : this.getRandomSpeed();

    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      if (!this.loop && this.currentTextIndex === this.textArray.length - 1) return;
      delay = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
      delay = 500;
    }

    this.timeoutId = setTimeout(() => this.tick(), delay);
  }

  destroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.container) this.container.innerHTML = '';
  }
}