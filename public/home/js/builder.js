import { LogoLoopClass } from '../text_loop/text_loop.js';
import { imageLogos } from '../text_loop/text_loop_setup.js';

export function createMainTitle(text) {
    const h1 = document.createElement('h1');
    h1.className = 'component-main-title';
    h1.textContent = text;
    return h1;
}

export function createInfoParagraph(text) {
    const p = document.createElement('p');
    p.className = 'component-info-paragraph';
    p.textContent = text;
    return p;
}

// Funzione helper per le particelle esplosive rosse
function createHeartParticles(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'heart-particle';

        // Direzione ed errore casuali per ciascuna particella
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
        const distance = 18 + Math.random() * 14;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        // Rimuove la particella a fine animazione
        particle.addEventListener('animationend', () => particle.remove());
    }
}

export function createPasswordCard(iconPath, name, username, password, onClick, isFavorite = false) {
    const card = document.createElement('div');
    card.className = 'component-password-card';

    const leftSection = document.createElement('div');
    leftSection.className = 'password-card-left';

    const icon = document.createElement('img');
    icon.src = iconPath;
    icon.alt = name;
    icon.className = 'password-card-icon';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'password-card-text';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'password-card-name';
    nameSpan.textContent = name;

    const userSpan = document.createElement('span');
    userSpan.className = 'password-card-username';
    userSpan.textContent = username;

    textWrapper.appendChild(nameSpan);
    textWrapper.appendChild(userSpan);
    leftSection.appendChild(icon);
    leftSection.appendChild(textWrapper);

    const rightSection = document.createElement('div');
    rightSection.className = 'password-card-right';

    const pwdSpan = document.createElement('span');
    pwdSpan.className = 'password-card-value';
    pwdSpan.textContent = '••••••••';

    const eyeIcon = document.createElement('img');
    eyeIcon.src = './asset/eyes/close.png';
    eyeIcon.alt = 'Mostra Password';
    eyeIcon.className = 'password-card-eye';

    let isVisible = false;

    eyeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        isVisible = !isVisible;
        pwdSpan.textContent = isVisible ? password : '••••••••';
        eyeIcon.src = `./asset/eyes/${isVisible ? 'open' : 'close'}.png`;
    });

    // Icona Preferiti
    let favState = isFavorite;
    const favIcon = document.createElement('img');
    favIcon.src = `./asset/${favState ? 'red' : 'white'}/favorite.png`;
    favIcon.alt = 'Preferito';
    favIcon.className = 'password-card-favorite';

    favIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        favState = !favState;
        favIcon.src = `./asset/${favState ? 'red' : 'white'}/favorite.png`;

        // Genera le particelle rosse solo quando si attiva l'icona
        if (favState) {
            createHeartParticles(favIcon);
        }
    });

    rightSection.appendChild(pwdSpan);
    rightSection.appendChild(eyeIcon);
    rightSection.appendChild(favIcon);

    card.appendChild(leftSection);
    card.appendChild(rightSection);

    if (typeof onClick === 'function') {
        card.addEventListener('click', onClick);
    }

    return card;
}
export function createDivider() {
    const hr = document.createElement('hr');
    hr.className = 'component-divider';
    return hr;
}

export function createCustomInput(placeholder = '', type = 'text', iconSrc = '', value = '', id = '', hasPicker = false, randomBtn = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'component-input-group';

    let iconHtml = '';
    if (iconSrc) {
        iconHtml = `<img src="${iconSrc}" class="input-icon" alt="icon">`;
    }

    let pickerHtml = '';
    if (hasPicker) {
        pickerHtml = `
            <div class="picker-trigger-wrapper" id="picker-trigger-${id}">
                <img src="./asset/icon/select.png" class="picker-trigger-icon" alt="Select Icon">
                <div class="brand-picker-dropdown" id="picker-dropdown-${id}">
                    <div class="picker-search-container">
                        <input type="text" class="picker-search-input" placeholder="Cerca icona..." id="picker-search-${id}">
                    </div>
                    <div class="picker-grid" id="picker-grid-${id}"></div>
                </div>
            </div>
        `;
    }

    let randomHtml = '';
    if (randomBtn) {
        randomHtml = `
            <div class="random-trigger-wrapper" id="random-trigger-${id}">
                <img src="./asset/white/generator.png" class="random-trigger-icon" alt="Genera Password" title="Genera password casuale">
            </div>
        `;
    }

    wrapper.innerHTML = `
        <input type="${type}" placeholder="${placeholder}" value="${value}" id="${id}">
        ${iconHtml}
        ${pickerHtml}
        ${randomHtml}
    `;

    // Se l'input nasce come password, gestisce il cambio tipo all'hover su TUTTO il contenitore
    if (type === 'password') {
        const inputEl = wrapper.querySelector('input');

        wrapper.addEventListener('mouseenter', () => {
            inputEl.type = 'text';
        });

        wrapper.addEventListener('mouseleave', () => {
            inputEl.type = 'password';
        });
    }

    if (hasPicker) {
        setTimeout(() => initBrandPicker(id), 0);
    }

    if (randomBtn) {
        setTimeout(() => initRandomGenerator(id), 0);
    }

    return wrapper;
}

function initBrandPicker(id) {
    const triggerWrapper = document.getElementById(`picker-trigger-${id}`);
    const triggerIcon = triggerWrapper.querySelector('.picker-trigger-icon');
    const dropdown = document.getElementById(`picker-dropdown-${id}`);
    const searchInput = document.getElementById(`picker-search-${id}`);
    const grid = document.getElementById(`picker-grid-${id}`);

    if (!triggerWrapper || !dropdown || !grid) return;


    const renderIcons = (filterText = '') => {
        grid.innerHTML = '';
        const filtered = imageLogos.filter(logo =>
            logo.title.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="picker-no-results">Nessuna icona trovata</div>`;
            return;
        }

        filtered.forEach(logo => {
            const item = document.createElement('div');
            item.className = 'picker-grid-item';
            item.title = logo.title;
            item.innerHTML = `<img src="${logo.src}" alt="${logo.alt}">`;

            item.addEventListener('click', (e) => {
                e.stopPropagation();

                triggerIcon.src = logo.src;
                triggerIcon.dataset.selectedSrc = logo.src;
                dropdown.classList.remove('is-visible');
            });

            grid.appendChild(item);
        });
    };

    renderIcons();


    triggerIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('is-visible');


        document.querySelectorAll('.brand-picker-dropdown.is-visible').forEach(d => d.classList.remove('is-visible'));

        if (!isOpen) {
            dropdown.classList.add('is-visible');
            searchInput.value = '';
            renderIcons();
            setTimeout(() => searchInput.focus(), 100);
        }
    });


    searchInput.addEventListener('input', (e) => {
        renderIcons(e.target.value);
    });


    dropdown.addEventListener('click', (e) => e.stopPropagation());


    document.addEventListener('click', () => {
        dropdown.classList.remove('is-visible');
    });
}

function initRandomGenerator(id) {
    const trigger = document.getElementById(`random-trigger-${id}`);
    const input = document.getElementById(id);

    if (!trigger || !input) return;

    // Generazione password casuale al click
    trigger.addEventListener('click', () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
        let generatedPassword = '';
        for (let i = 0; i < 16; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        input.value = generatedPassword;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Mostra in chiaro al passaggio del mouse
    trigger.addEventListener('mouseenter', () => {
        input.type = 'text';
    });

    // Nasconde la password quando il mouse esce
    trigger.addEventListener('mouseleave', () => {
        input.type = 'password';
    });
}
export function createEmptyState(onAddClick = "") {
    function setActiveNavByIcon(iconName) {
        if (!iconName) return;


        const targetName = String(iconName).trim().toLowerCase();
        const navItems = document.querySelectorAll('.sidebar .nav-item');

        navItems.forEach(item => {
            const img = item.querySelector('.nav-icon');


            const currentIcon = (img?.dataset.icon || item.dataset.icon || '').trim().toLowerCase();


            const isTarget = (currentIcon === targetName);

            item.classList.toggle('active', isTarget);

            if (img && currentIcon) {
                const folder = isTarget ? 'red' : 'white';
                img.src = `./asset/${folder}/${currentIcon}.png`;
            }
        });
    }


    const wrapper = document.createElement('div');
    wrapper.className = 'component-empty-state';

    const textSpan = document.createElement('span');
    textSpan.textContent = 'Non hai collegato ancora nessuna password ';

    const addLink = document.createElement('a');
    addLink.href = '#';
    addLink.className = 'empty-state-link';
    addLink.textContent = 'aggiungi una nuova';

    addLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveNavByIcon('add');
        loadAddView();

    });


    wrapper.appendChild(textSpan);
    wrapper.appendChild(addLink);

    return wrapper;
}



export function createSecurityChartCard(danger = 0, warning = 0, good = 0, totalPasswords = null) {
    const card = document.createElement('div');
    card.className = 'component-chart-card';

    const total = totalPasswords !== null ? totalPasswords : (danger + warning + good);

    const pDanger = total > 0 ? (danger / total) * 100 : 0;
    const pWarning = total > 0 ? (warning / total) * 100 : 0;
    const pGood = total > 0 ? (good / total) * 100 : 0;

    const strokeGood = pGood;
    const strokeWarning = pWarning;
    const strokeDanger = pDanger;

    const offsetGood = 25;
    const offsetWarning = offsetGood - strokeGood;
    const offsetDanger = offsetWarning - strokeWarning;

    card.innerHTML = `
        <div class="chart-container-left">
            <svg viewBox="0 0 42 42" class="donut-chart">
                <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#ffffff"></circle>
                <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" stroke-width="5"></circle>
                
                <!-- Segmento Verde (Buona) -->
                <circle class="donut-segment segment-good" cx="21" cy="21" r="15.91549430918954" 
                        fill="transparent" stroke="#10b981" stroke-width="5" 
                        stroke-dasharray="${strokeGood} ${100 - strokeGood}" 
                        stroke-dashoffset="${offsetGood}"></circle>
                
                <!-- Segmento Arancione (Medio) -->
                <circle class="donut-segment segment-warning" cx="21" cy="21" r="15.91549430918954" 
                        fill="transparent" stroke="#f59e0b" stroke-width="5" 
                        stroke-dasharray="${strokeWarning} ${100 - strokeWarning}" 
                        stroke-dashoffset="${offsetWarning}"></circle>
                
                <!-- Segmento Rosso (Pericolo) -->
                <circle class="donut-segment segment-danger" cx="21" cy="21" r="15.91549430918954" 
                        fill="transparent" stroke="#ef4444" stroke-width="5" 
                        stroke-dasharray="${strokeDanger} ${100 - strokeDanger}" 
                        stroke-dashoffset="${offsetDanger}"></circle>
            </svg>
        </div>

        <div class="chart-container-right">
            <h4 class="chart-title">Stato di Sicurezza Password</h4>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-dot dot-danger"></span>
                    <span class="legend-label">Deboli / Pericolo (${danger})</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot dot-warning"></span>
                    <span class="legend-label">Medie (${warning})</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot dot-good"></span>
                    <span class="legend-label">Forti / Sicure (${good})</span>
                </div>
            </div>
            <span class="chart-footer">Calcolato su <strong>${total}</strong> password</span>
        </div>
    `;

    return card;
}

export function createLogoLoop(customOptions = {}) {
    const options = {
        logos: imageLogos,
        speed: 80,
        gap: 30,
        logoHeight: 35,
        ...customOptions
    };

    const instance = new LogoLoopClass(options);
    return instance.render();
}

export function createButton(buttonText, onclick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-login';
    button.id = 'btn-login';

    if (onclick) {
        if (typeof onclick === 'function') {
            button.addEventListener('click', onclick);
        } else {
            button.setAttribute('onclick', onclick);
        }
    }

    button.innerHTML = `
        <span class="btn-text">${buttonText}</span>
        <span class="btn-icon-wrapper">
            <i class="fa-solid fa-spinner fa-spin icon-spinner"></i>
            <i class="fa-solid fa-check icon-success"></i>
            <i class="fa-solid fa-xmark icon-error"></i>
        </span>
    `;

    return button;
}

export function createBackupCards(onSelect) {
    const container = document.createElement('div');
    container.className = 'component-backup-container';

    let selectedType = null;

    const cardPlain = document.createElement('div');
    cardPlain.className = 'backup-card';
    cardPlain.dataset.type = 'plain';
    cardPlain.innerHTML = `
        <div class="backup-card-content">
            <img src="./asset/icon/db_clear.png" class="backup-card-icon" alt="Scarica">
            <span class="backup-card-title">Scarica lista password in chiaro</span>
        </div>
    `;

    const cardEncrypted = document.createElement('div');
    cardEncrypted.className = 'backup-card';
    cardEncrypted.dataset.type = 'encrypted';
    cardEncrypted.innerHTML = `
        <div class="backup-card-content">
            <img src="./asset/icon/db_protect.png" class="backup-card-icon" alt="Criptato">
            <span class="backup-card-title">Scarica DB criptato</span>
        </div>
    `;

    const cards = [cardPlain, cardEncrypted];

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Rimuove la classe .selected da tutte le card
            cards.forEach(c => c.classList.remove('selected'));

            // Aggiunge la classe alla card cliccata
            card.classList.add('selected');
            selectedType = card.dataset.type;

            if (typeof onSelect === 'function') {
                onSelect(selectedType);
            }
        });
    });

    container.appendChild(cardPlain);
    container.appendChild(cardEncrypted);

    return container;
}

export function createAuthErrorComponent(targetElement = '#auth-error-msg') {
    let container = typeof targetElement === 'string'
        ? document.querySelector(targetElement)
        : targetElement;

    if (!container) {
        container = document.createElement('div');
        container.id = 'auth-error-msg';
        container.className = 'auth-error-component';
    } else {
        container.classList.add('auth-error-component');
    }

    container.innerHTML = `
        <i class="fa-solid fa-circle-exclamation auth-error-icon"></i>
        <span class="auth-error-text"></span>
    `;

    const textSpan = container.querySelector('.auth-error-text');

    return {
        element: container,

        show(message) {
            if (!message) return;
            textSpan.textContent = message;
            container.classList.remove('hide');
            container.classList.add('show');
        },


        hide() {
            container.classList.remove('show');
            container.classList.add('hide');
        },


        clear() {
            container.classList.remove('show', 'hide');
            textSpan.textContent = '';
        }
    };
}

export function createProfileCard(username, createdAt, totalPasswords) {


    const container = document.createElement('div');
    container.className = 'component-profile-card';

    container.innerHTML = `
        <div class="profile-avatar-wrapper">
            <i class="fa-regular fa-user"></i>
        </div>
        <div class="profile-details">
            <h3 class="profile-username">${username}</h3>
            <div class="profile-info-group">
                <div class="profile-info-item">
                    <i class="fa-regular fa-calendar-alt"></i>
                    <span>Account creato il <strong>${createdAt}</strong></span>
                </div>
                <div class="profile-info-item">
                    <i class="fa-solid fa-key"></i>
                    <span>Password salvate: <strong>${totalPasswords}</strong></span>
                </div>
            </div>
        </div>
    `;

    return container;
}

export function createSettingBox({ title, desc, icon, type, options = [], checked = false, onChange }) {
    const card = document.createElement('div');
    card.className = 'setting-card';

    let controlHTML = '';
    if (type === 'select') {
        const opts = options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        controlHTML = `<select class="setting-select">${opts}</select>`;
    } else if (type === 'switch') {
        controlHTML = `
            <label class="switch">
                <input type="checkbox" ${checked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;
    }

    card.innerHTML = `
        <div class="setting-info">
            <i class="${icon} setting-icon"></i>
            <div>
                <span class="setting-label">${title}</span>
                <p class="setting-desc">${desc}</p>
            </div>
        </div>
        <div class="setting-action">
            ${controlHTML}
        </div>
    `;

    const input = card.querySelector('select, input[type="checkbox"]');
    if (input && typeof onChange === 'function') {
        input.addEventListener('change', (e) => {
            const val = type === 'switch' ? e.target.checked : e.target.value;
            onChange(val);
        });
    }

    return card;
}

export function createSubTitle(text) {
    const subTitle = document.createElement('h3');
    subTitle.className = 'component-subtitle-red';
    subTitle.textContent = text;
    return subTitle;
}

export function createInactivitySlider(defaultValue = 5, onChange) {
    const container = document.createElement('div');
    container.className = 'slider-card';

    container.innerHTML = `
        <div class="slider-header">
            <span class="slider-title">Inattività Vault</span>
            <span class="slider-value" id="inactivity-val">${defaultValue} min</span>
        </div>
        <div class="slider-wrapper">
            <input 
                type="range" 
                class="custom-inactivity-slider" 
                min="5" 
                max="30" 
                step="5" 
                value="${defaultValue}"
                id="inactivity-range"
            >
        </div>
    `;

    const input = container.querySelector('#inactivity-range');
    const label = container.querySelector('#inactivity-val');

    const updateSliderFill = (val) => {
        const min = Number(input.min);
        const max = Number(input.max);
        const percentage = ((val - min) / (max - min)) * 100;

        input.style.background = `linear-gradient(to right, #e63946 0%, #e63946 ${percentage}%, #cbd5e1 ${percentage}%, #cbd5e1 100%)`;
        label.textContent = `${val} min`;
    };

    updateSliderFill(defaultValue);

    input.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        updateSliderFill(val);
        if (typeof onChange === 'function') {
            onChange(val);
        }
    });

    return container;
}

export function createBoxToggleCard(title, description, initialChecked = false, onChange) {
    const card = document.createElement('div');
    card.className = `toggle-box-card ${initialChecked ? 'active' : ''}`;

    card.innerHTML = `
        <div class="toggle-checkbox-custom ${initialChecked ? 'checked' : ''}">
            <i class="fa-solid fa-check check-icon"></i>
        </div>
        <div class="toggle-content">
            <span class="toggle-title">${title}</span>
            <p class="toggle-desc">${description}</p>
        </div>
    `;

    const checkbox = card.querySelector('.toggle-checkbox-custom');

    card.addEventListener('click', () => {
        const isChecked = card.classList.toggle('active');
        checkbox.classList.toggle('checked', isChecked);

        if (typeof onChange === 'function') {
            onChange(isChecked);
        }
    });

    return card;
}

export function createSettingsRowButton(text, iconSrc = '', isDangerous = true, onClick) {
    const btn = document.createElement('button');
    btn.className = `settings-row-btn ${isDangerous ? 'danger-hover' : ''}`;
    btn.type = 'button';

    const iconHTML = iconSrc ? `<img src="${iconSrc}" class="row-btn-img" alt="" />` : '';
    btn.innerHTML = `
        <div class="row-btn-content">
            ${iconHTML}
            <span>${text}</span>
        </div>
        <span class="row-btn-arrow">›</span>
    `;

    if (typeof onClick === 'function') {
        btn.addEventListener('click', onClick);
    }

    return btn;
}

/**
 * Crea un pulsante di importazione generando direttamente un `createSettingsRowButton`
 * per garantire una perfetta identità visiva al 100%.
 */
export function createImportButton(text, iconSrc = '', onClick) {
    const btn = document.createElement('button');
    btn.className = 'settings-row-btn import-btn-wrapper';
    btn.type = 'button';

    const iconHTML = iconSrc ? `<img src="${iconSrc}" class="row-btn-img" alt="" />` : '';
    
    // Identico al 100% a createSettingsRowButton + barra progressiva
    btn.innerHTML = `
        <div class="import-progress-fill"></div>
        <div class="row-btn-content">
            ${iconHTML}
            <span>${text}</span>
            <span class="import-status-icon"></span>
        </div>
        <span class="row-btn-arrow">›</span>
    `;

    const fill = btn.querySelector('.import-progress-fill');
    const statusIcon = btn.querySelector('.import-status-icon');
    const arrow = btn.querySelector('.row-btn-arrow');
    let isAnimating = false;

    const startAnimation = (durationMs = 2000) => {
        if (isAnimating) return;
        isAnimating = true;
        btn.disabled = true;
        btn.classList.remove('status-success', 'status-error', 'shake-error');
        statusIcon.innerHTML = '';
        if (arrow) arrow.style.opacity = '0';

        fill.style.transition = `width ${durationMs}ms linear`;
        fill.style.width = '100%';
    };

    const stopAnimation = (success = true) => {
        fill.style.transition = 'width 0.2s ease, opacity 0.4s ease';
        fill.style.opacity = '0';

        setTimeout(() => {
            fill.style.width = '0%';
            fill.style.opacity = '1';
        }, 200);

        if (success) {
            btn.classList.add('status-success');
            statusIcon.innerHTML = `<i class="fa-solid fa-check text-success"></i>`;
        } else {
            btn.classList.add('status-error', 'shake-error');
            statusIcon.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i>`;
            
            setTimeout(() => {
                btn.classList.remove('shake-error');
            }, 500);
        }

        btn.disabled = false;
        isAnimating = false;
    };

    const reset = () => {
        btn.classList.remove('status-success', 'status-error', 'shake-error');
        statusIcon.innerHTML = '';
        if (arrow) arrow.style.opacity = '1';
        fill.style.width = '0%';
        btn.disabled = false;
        isAnimating = false;
    };

    btn.addEventListener('click', () => {
        if (isAnimating) return;
        if (typeof onClick === 'function') {
            onClick({ startAnimation, stopAnimation, reset });
        }
    });

    return {
        element: btn,
        startAnimation,
        stopAnimation,
        reset
    };
}