import { LogoLoopClass } from '../text_loop/text_loop.js';
import { imageLogos } from '../text_loop/text_loop_setup.js';
import { createCardSwap } from '../card_swap/card_swap.js';

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



export function createPasswordCard(iconPath, name, username, password, onClick) {
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

    rightSection.appendChild(pwdSpan);
    rightSection.appendChild(eyeIcon);

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

async function initRandomGenerator(id) {
    const trigger = document.getElementById(`random-trigger-${id}`);
    const input = document.getElementById(id);

    if (!trigger || !input) return;

    const allPrefs = (await window.api.load_pref()) || {};
    const defaultPrefs = {
        length: 16,
        numbersRatio: 0.5,
        symbolsRatio: 0.5,
        lettersRatio: 0.5,
        uppercaseRatio: 0.5
    };

    const preferencie = { ...defaultPrefs, ...(allPrefs.generator || allPrefs.generato_pref || {}) };

    trigger.addEventListener('click', () => {

        const charset = {
            lettersUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lettersLower: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        let availableChars = '';

        if (preferencie.lettersRatio > 0) {
            if (preferencie.uppercaseRatio > 0) availableChars += charset.lettersUpper;
            availableChars += charset.lettersLower;
        }

        if (preferencie.numbersRatio > 0) {
            availableChars += charset.numbers;
        }

        if (preferencie.symbolsRatio > 0) {
            availableChars += charset.symbols;
        }

        if (!availableChars) {
            availableChars = charset.lettersUpper + charset.lettersLower + charset.numbers;
        }

        let generatedPassword = '';
        const targetLength = Number(preferencie.length) || 16;

        for (let i = 0; i < targetLength; i++) {
            generatedPassword += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
        }

        input.value = generatedPassword;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    trigger.addEventListener('mouseenter', () => {
        input.type = 'text';
    });

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

            cards.forEach(c => c.classList.remove('selected'));


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


    const stopAnimation = (success = true, message = '') => {
        fill.style.transition = 'width 0.2s ease, opacity 0.4s ease';
        fill.style.opacity = '0';

        setTimeout(() => {
            fill.style.width = '0%';
            fill.style.opacity = '1';
        }, 200);

        const msgHTML = message ? `<span class="import-status-msg">${message}</span>` : '';

        if (success) {
            btn.classList.add('status-success');
            statusIcon.innerHTML = `<i class="fa-solid fa-check text-success"></i> ${msgHTML}`;
        } else {
            btn.classList.add('status-error', 'shake-error');
            statusIcon.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> ${msgHTML}`;

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

export function createLogTerminal(username = 'User', logs = [], iconPath = './asset/icon/log.png') {
    const container = document.createElement('div');
    container.className = 'ps-terminal-container';

    const header = document.createElement('div');
    header.className = 'ps-terminal-header';
    header.innerHTML = `
        <div class="ps-header-left">
            <img src="${iconPath}" class="ps-header-icon-img" alt="Log" />
            <span class="ps-header-title">Cronologia Log - Krypta Vault</span>
        </div>
    `;

    const body = document.createElement('div');
    body.className = 'ps-terminal-body';

    const initialPrompt = document.createElement('div');
    initialPrompt.className = 'ps-log-line ps-prompt-header';
    initialPrompt.style.whiteSpace = 'pre-line'; // Permette i \n solo per l'intestazione iniziale
    initialPrompt.textContent = 'Krypta Security Audit Shell [Version 1.0.2]\n(c) Krypta Corporation. Tutti i diritti riservati.\n';

    body.appendChild(initialPrompt);

    if (!logs || logs.length === 0) {
        const emptyLine = document.createElement('div');
        emptyLine.className = 'ps-log-line ps-empty';
        emptyLine.style.whiteSpace = 'nowrap';
        emptyLine.innerHTML = `<span class="ps-prompt">C:\\Logs&gt;</span> <span style="color: #ff9800; font-weight: bold;">[${username}]</span> <span class="ps-text">Nessun evento registrato.</span>`;
        body.appendChild(emptyLine);
    } else {
        logs.forEach(logItem => {
            const [logText = "", status = "INFO"] = Array.isArray(logItem) ? logItem : [logItem, "INFO"];
            const isDanger = status.toUpperCase() === 'DANGER';

            const line = document.createElement('div');
            line.className = 'ps-log-line';

            // Forziamo tutto su una singola riga senza andare a capo
            line.style.whiteSpace = 'nowrap';
            line.style.overflow = 'hidden';
            line.style.textOverflow = 'ellipsis';

            if (isDanger) {
                line.style.color = '#ff4d4d';
                line.innerHTML = `<span class="ps-prompt" style="color: #ff4d4d;">C:\\Logs&gt;</span> <span style="color: #ff4d4d; font-weight: bold;">[${username}]</span> <span class="ps-text" style="color: #ff4d4d;">${logText}</span> <span style="color: #ff4d4d; font-weight: bold; margin-left: 8px;">[DANGER]</span>`;
            } else {
                let statusColor = '#a0a0a0';
                const upperStatus = status.toUpperCase();

                if (upperStatus === 'SUCCESS') {
                    statusColor = '#4caf50';
                } else if (upperStatus === 'FAILED' || upperStatus === 'ERROR') {
                    statusColor = '#f44336';
                }

                line.innerHTML = `<span class="ps-prompt">C:\\Logs&gt;</span> <span style="color: #ff9800; font-weight: bold;">[${username}]</span> <span class="ps-text">${logText}</span> <span style="color: ${statusColor}; font-weight: bold; margin-left: 8px;">[${upperStatus}]</span>`;
            }

            body.appendChild(line);
        });
    }

    container.appendChild(header);
    container.appendChild(body);

    return container;
}

export function createNotesIntroSection() {
    const wrapper = document.createElement('div');
    wrapper.className = 'notes-intro-card';

    const textSection = document.createElement('div');
    textSection.className = 'notes-intro-text';
    textSection.innerHTML = `
        <h2>Sezione Note Protette</h2>
        <p>Salva testo in modo completamente sicuro e criptato</p>
    `;

    const cardsData = [
        { tag: "Sicuro", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-cog-corner-icon lucide-shield-cog-corner"><path d="M11 22c-3.806-1.45-7-3.966-7-9V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v4"/><path d="M14.923 16.547 14 16.164"/><path d="m14.923 18.843-.923.383"/><path d="M16.547 14.923 16.164 14"/><path d="m16.547 20.467-.383.924"/><path d="m18.843 14.923.383-.923"/><path d="m19.225 21.391-.382-.924"/><path d="m20.467 16.547.923-.383"/><path d="m20.467 18.843.923.383"/><circle cx="17.695" cy="17.695" r="3"/></svg>` },
        { tag: "Duraturo", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-biceps-flexed-icon lucide-biceps-flexed"><path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/><path d="M15 14a5 5 0 0 0-7.584 2"/><path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/></svg>` },
        { tag: "Flessibile", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap-icon lucide-zap"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/></svg>` }
    ];

    const cardSwap = createCardSwap({
        cardsData,
        cardDistance: 45,
        verticalDistance: 40,
        delay: 2800,
        skewAmount: 4
    });

    wrapper.appendChild(textSection);
    wrapper.appendChild(cardSwap);

    return wrapper;
}


export function createProtectedNote({ onPinSubmit, onSave, set = false } = {}) {
    const container = document.createElement('div');
    container.className = 'protected-note-container locked';

    let activePin = null;

    // Iniezione Stili CSS
    if (!document.getElementById('protected-note-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'protected-note-styles';
        styleSheet.textContent = `
            @keyframes protectedNoteShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-6px); }
                40%, 80% { transform: translateX(6px); }
            }
            @keyframes noteBtnSpinner {
                to { transform: rotate(360deg); }
            }
            .protected-note-container {
                height: auto !important;
                min-height: fit-content !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .protected-note-title.error-state {
                color: #ff4d4d !important;
                animation: protectedNoteShake 0.4s ease-in-out;
            }
            .protected-note-title.error-state svg {
                stroke: #ff4d4d !important;
            }
            .protected-note-editor {
                width: 100%;
                min-height: 140px;
                height: auto !important;
                max-height: none !important;
                field-sizing: content;
                resize: none;
                box-sizing: border-box;
                overflow: visible !important;
            }
            .protected-note-actions {
                display: none;
                justify-content: flex-end;
                gap: 10px;
                padding-top: 10px;
            }
            .protected-note-container.unlocked .protected-note-actions {
                display: flex;
            }
            .btn-note-cancel {
                background-color: transparent;
                color: #888;
                border: 1px solid #444;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .btn-note-cancel:hover {
                color: #fff;
                border-color: #666;
            }

            /* --- Stili Pulsante Salva Animato --- */
            .btn-note-save {
                background-color: #22c55e;
                color: #ffffff;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                min-width: 90px;
                transition: background-color 0.2s ease, transform 0.1s ease;
            }
            .btn-note-save:hover:not(:disabled) {
                background-color: #16a34a;
            }
            .btn-note-save:disabled {
                opacity: 0.85;
                cursor: not-allowed;
            }
            .btn-note-save.btn-state-loading {
                background-color: #16a34a;
            }
            .btn-note-save.btn-state-success {
                background-color: #22c55e !important;
            }
            .btn-note-save.btn-state-error {
                background-color: #ef4444 !important;
                animation: protectedNoteShake 0.4s ease-in-out;
            }
            .btn-note-save .spinner-icon {
                animation: noteBtnSpinner 0.8s linear infinite;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Textarea (Editor)
    const editor = document.createElement('textarea');
    editor.className = 'protected-note-editor';
    editor.placeholder = 'Scrivi qui la tua nota protetta...';
    const maskText = '• '.repeat(100);
    editor.value = maskText;

    const updateEditorHeight = () => {
        editor.style.height = 'auto';
        editor.style.height = `${editor.scrollHeight}px`;
    };
    editor.addEventListener('input', updateEditorHeight);

    // Action Bar
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'protected-note-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-note-cancel';
    cancelBtn.textContent = 'Annulla';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn-note-save';

    // Gestione degli stati UI del pulsante Salva
    const setSaveButtonState = (state, customText) => {
        saveBtn.classList.remove('btn-state-loading', 'btn-state-success', 'btn-state-error');
        saveBtn.disabled = false;

        const icons = {
            spinner: `<svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
            check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
            error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        };

        switch (state) {
            case 'loading':
                saveBtn.classList.add('btn-state-loading');
                saveBtn.disabled = true;
                saveBtn.innerHTML = `${icons.spinner} <span>${customText || 'Salvataggio...'}</span>`;
                break;
            case 'success':
                saveBtn.classList.add('btn-state-success');
                saveBtn.disabled = true;
                saveBtn.innerHTML = `${icons.check} <span>${customText || 'Salvato!'}</span>`;
                break;
            case 'error':
                saveBtn.classList.add('btn-state-error');
                saveBtn.innerHTML = `${icons.error} <span>${customText || 'Errore'}</span>`;
                break;
            default: // 'idle'
                saveBtn.innerHTML = `<span>Salva</span>`;
                break;
        }
    };

    setSaveButtonState('idle');

    // Helper per ritardo minimo
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Click su Salva con spinner garantito per almeno 1000ms
    saveBtn.onclick = async () => {
        const testo = editor.value;
        setSaveButtonState('loading');

        const minSpinnerTime = wait(1000);

        try {
            const [result] = await Promise.all([
                window.api.save_plain_text(testo, activePin),
                minSpinnerTime
            ]);

            setSaveButtonState('success');

            if (onSave) {
                onSave(result);
            }

            setTimeout(() => {
                setSaveButtonState('idle');
            }, 1800);
        } catch (err) {
            console.error("Errore durante il salvataggio:", err);
            await minSpinnerTime;
            setSaveButtonState('error');

            setTimeout(() => {
                setSaveButtonState('idle');
            }, 2000);
        }
    };

    actionsContainer.appendChild(cancelBtn);
    actionsContainer.appendChild(saveBtn);

    // Overlay di blocco
    const overlay = document.createElement('div');
    overlay.className = 'protected-note-overlay';

    const title = document.createElement('h3');
    title.className = 'protected-note-title';

    const lockIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fingerprint-pattern-icon lucide-fingerprint-pattern"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>`;

    const updateTitleText = (text) => {
        title.innerHTML = `${lockIconSvg}<span>${text}</span>`;
    };

    updateTitleText(set ? "Imposta il PIN delle note" : "Inserisci PIN");

    const otpWrapper = document.createElement('div');
    otpWrapper.className = 'otp-container';

    const otpInputs = [];
    let firstPinAttempt = null;

    const resetOtpInputs = () => {
        otpInputs.forEach(inp => {
            inp.value = '';
            inp.classList.remove('filled', 'error');
        });
        if (otpInputs[0]) otpInputs[0].focus();
    };

    for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'password';
        input.maxLength = 1;
        input.className = 'otp-input';
        input.dataset.index = i;

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val) {
                input.classList.add('filled');
                if (i < 5) {
                    otpInputs[i + 1].focus();
                } else {
                    input.blur();
                    const pin = otpInputs.map(inp => inp.value).join('');

                    if (set) {
                        if (!firstPinAttempt) {
                            firstPinAttempt = pin;
                            updateTitleText("Conferma il PIN delle note");
                            resetOtpInputs();
                        } else {
                            if (pin === firstPinAttempt) {
                                activePin = pin;
                                if (onPinSubmit) onPinSubmit(pin, true);
                            } else {
                                container.triggerError("PIN non coincidenti!", 1200);
                                setTimeout(() => {
                                    firstPinAttempt = null;
                                    updateTitleText("Imposta il PIN delle note");
                                }, 1200);
                            }
                        }
                    } else {
                        activePin = pin;
                        if (onPinSubmit) onPinSubmit(pin, false);
                    }
                }
            } else {
                input.classList.remove('filled');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && i > 0) {
                otpInputs[i - 1].focus();
            }
        });

        input.addEventListener('focus', () => {
            input.select();
        });

        otpInputs.push(input);
        otpWrapper.appendChild(input);
    }

    cancelBtn.addEventListener('click', () => {
        container.lockNote();
    });

    overlay.appendChild(title);
    overlay.appendChild(otpWrapper);

    container.appendChild(editor);
    container.appendChild(actionsContainer);
    container.appendChild(overlay);

    // --- METODI PUBBLICI ---

    container.triggerError = function (errorMessage = 'PIN Errato!', durationMs = 1200) {
        activePin = null;
        const originalText = set ? "Imposta il PIN delle note" : "Inserisci PIN";
        updateTitleText(errorMessage);
        title.classList.add('error-state');
        resetOtpInputs();

        setTimeout(() => {
            title.classList.remove('error-state');
            updateTitleText(originalText);
        }, durationMs);
    };

    container.unlockNote = function (decryptedContent = '', pinUsed = null) {
        if (pinUsed) activePin = pinUsed;
        setSaveButtonState('idle');
        container.classList.remove('locked');
        container.classList.add('unlocked');
        editor.value = decryptedContent;
        requestAnimationFrame(() => updateEditorHeight());
        editor.focus();
    };

    container.lockNote = function () {
        activePin = null;
        setSaveButtonState('idle');
        container.classList.remove('unlocked');
        container.classList.add('locked');
        firstPinAttempt = null;
        title.classList.remove('error-state');
        updateTitleText(set ? "Imposta il PIN delle note" : "Inserisci PIN");
        resetOtpInputs();
        editor.value = maskText;
        requestAnimationFrame(() => updateEditorHeight());
    };

    return container;
}

function estimateCrackTime(length, numRatio, symRatio, letRatio, upperRatio) {

    if (length > 20) {
        return "Impenetrabile";
    }

    let poolSize = 0;
    if (letRatio > 0.05) poolSize += 26;
    if (upperRatio > 0.05) poolSize += 26;
    if (numRatio > 0.05) poolSize += 10;
    if (symRatio > 0.05) poolSize += 33;

    if (poolSize === 0) poolSize = 26;

    const entropyBits = length * Math.log2(poolSize);
    const guessesPerSecond = 1e11;
    const totalCombinations = Math.pow(2, entropyBits);
    const seconds = totalCombinations / (2 * guessesPerSecond);

    if (seconds < 0.001) return "Pochi millisecondi";
    if (seconds < 1) return "Meno di un secondo";
    if (seconds < 60) return `${Math.round(seconds)} secondi`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minuti`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} ore`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} giorni`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} mesi`;

    const years = Math.round(seconds / 31536000);
    if (years < 1000) return `${years} anni`;
    if (years < 1000000) return `${Math.round(years / 1000)} mila anni`;
    if (years < 1000000000) return `${Math.round(years / 1000000)} milioni di anni`;

    return "Miliardi di anni";
}
export function createPasswordRadar(onApply, initialStats = {}) {
    const size = 280;
    const center = size / 2;
    const radius = 80;

    const MIN_LENGTH = 6;
    const MAX_LENGTH = 32;

    const labelNames = ["Lunghezza", "Numeri", "Speciali", "Lettere", "Maiuscole"];

    // 1. Gestione caricamento dati iniziali
    let rawCharLength = typeof initialStats.length === 'number' ? initialStats.length : 16;
    rawCharLength = Math.min(Math.max(rawCharLength, MIN_LENGTH), MAX_LENGTH);

    const initialLengthRatio = (rawCharLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH);

    let currentValues = [
        initialLengthRatio,
        initialStats.numbersRatio ?? 0.5,
        initialStats.symbolsRatio ?? 0.5,
        initialStats.lettersRatio ?? 0.5,
        initialStats.uppercaseRatio ?? 0.5
    ];

    function getCoordinates(valueRatio, index) {
        const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
        const currentRadius = radius * valueRatio;
        return {
            x: center + currentRadius * Math.cos(angle),
            y: center + currentRadius * Math.sin(angle)
        };
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'krypta-radar-wrapper';

    wrapper.innerHTML = `
        <!-- Colonna Sinistra: Grafico SVG -->
        <div class="krypta-radar-left">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="krypta-radar-svg">
                <g class="radar-grids"></g>
                <g class="radar-axes"></g>
                <polygon class="radar-polygon" />
                <g class="radar-points-group"></g>
                <g class="radar-labels-group"></g>
            </svg>
        </div>

        <!-- Colonna Destra: Testo & Controlli -->
        <div class="krypta-radar-right">
            <div class="krypta-radar-header">
                <div class="krypta-radar-title">
                    <img src="./asset/icon/cr_gen.png" alt="Generatore Icona" class="krypta-radar-title-icon" />
                    Generatore Password
                </div>
                <div class="krypta-radar-subtitle">Seleziona le preferenze sulla generazione password trascinando i punti nel grafico.</div>
                
                <!-- Paragrafetto dinamico per il tempo di Hacking -->
                <div class="krypta-radar-crack-time">
                    Tempo stimato per craccarla: <span class="crack-time-value">...</span>
                </div>
            </div>
            
            <button type="button" class="btn-login krypta-radar-apply-btn">
                <span class="btn-text">Applica</span>
                <span class="btn-icon-wrapper">
                    <i class="fa-solid fa-spinner fa-spin icon-spinner"></i>
                    <i class="fa-solid fa-check icon-success"></i>
                    <i class="fa-solid fa-xmark icon-error"></i>
                </span>
            </button>
        </div>
    `;

    const svg = wrapper.querySelector('.krypta-radar-svg');
    const gridsGroup = wrapper.querySelector('.radar-grids');
    const axesGroup = wrapper.querySelector('.radar-axes');
    const polygon = wrapper.querySelector('.radar-polygon');
    const pointsGroup = wrapper.querySelector('.radar-points-group');
    const labelsGroup = wrapper.querySelector('.radar-labels-group');
    const applyBtn = wrapper.querySelector('.krypta-radar-apply-btn');
    const crackTimeValue = wrapper.querySelector('.crack-time-value');

    // Disegna griglie concentriche
    [0.33, 0.66, 1.0].forEach(level => {
        const pointsStr = [0, 1, 2, 3, 4].map(i => {
            const pt = getCoordinates(level, i);
            return `${pt.x},${pt.y}`;
        }).join(' ');
        gridsGroup.innerHTML += `<polygon points="${pointsStr}" class="radar-grid-line" fill="none" />`;
    });

    // Disegna assi del radar
    [0, 1, 2, 3, 4].forEach(i => {
        const outerPt = getCoordinates(1.0, i);
        axesGroup.innerHTML += `<line x1="${center}" y1="${center}" x2="${outerPt.x}" y2="${outerPt.y}" class="radar-axis-line" />`;
    });

    // Aggiorna la posizione dei vertici, le etichette e la stima del tempo
    function updateRadar() {
        const dataPoints = currentValues.map((val, i) => getCoordinates(val, i));
        polygon.setAttribute('points', dataPoints.map(pt => `${pt.x},${pt.y}`).join(' '));

        pointsGroup.innerHTML = '';
        dataPoints.forEach((pt, i) => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", pt.x);
            circle.setAttribute("cy", pt.y);
            circle.setAttribute("r", "7");
            circle.setAttribute("class", "radar-point-handle");
            circle.setAttribute("data-index", i);
            pointsGroup.appendChild(circle);
        });

        labelsGroup.innerHTML = '';
        [0, 1, 2, 3, 4].forEach(i => {
            const labelPt = getCoordinates(1.28, i);
            let displayValue;

            if (i === 0) {
                const charCount = Math.round(MIN_LENGTH + currentValues[0] * (MAX_LENGTH - MIN_LENGTH));
                displayValue = `${charCount} ch`;
            } else {
                displayValue = `${Math.round(currentValues[i] * 100)}%`;
            }

            const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textNode.setAttribute("x", labelPt.x);
            textNode.setAttribute("y", labelPt.y);
            textNode.setAttribute("class", "radar-label");
            textNode.textContent = `${labelNames[i]} (${displayValue})`;
            labelsGroup.appendChild(textNode);
        });

        // Aggiorna il calcolo dinamico del tempo di crack
        const currentLength = Math.round(MIN_LENGTH + currentValues[0] * (MAX_LENGTH - MIN_LENGTH));
        const calculatedTime = estimateCrackTime(
            currentLength,
            currentValues[1], // Numbers
            currentValues[2], // Symbols
            currentValues[3], // Letters
            currentValues[4]  // Uppercase
        );

        if (crackTimeValue) {
            crackTimeValue.textContent = calculatedTime;
        }
    }

    // Drag and Drop
    let activeIndex = null;

    function handleMove(clientX, clientY) {
        if (activeIndex === null) return;

        const rect = svg.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const angle = (Math.PI * 2 / 5) * activeIndex - Math.PI / 2;
        const axisX = Math.cos(angle);
        const axisY = Math.sin(angle);

        const dx = mouseX - center;
        const dy = mouseY - center;

        let projectedDist = dx * axisX + dy * axisY;
        let normVal = projectedDist / radius;

        normVal = Math.min(Math.max(normVal, 0.0), 1.0);
        currentValues[activeIndex] = normVal;

        updateRadar();
    }

    svg.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('radar-point-handle')) {
            activeIndex = parseInt(e.target.getAttribute('data-index'));
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (activeIndex !== null) {
            handleMove(e.clientX, e.clientY);
        }
    });

    window.addEventListener('mouseup', () => {
        activeIndex = null;
    });

    svg.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('radar-point-handle')) {
            activeIndex = parseInt(e.target.getAttribute('data-index'));
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (activeIndex !== null && e.touches.length > 0) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        activeIndex = null;
    });

    function setButtonState(state) {
        applyBtn.classList.remove('is-loading', 'is-success', 'is-error');
        if (state) {
            applyBtn.classList.add(state);
        }
    }

    // Gestione salvataggio
    applyBtn.addEventListener('click', async () => {
        if (applyBtn.classList.contains('is-loading')) return;

        const calculatedPreferences = {
            length: Math.round(MIN_LENGTH + currentValues[0] * (MAX_LENGTH - MIN_LENGTH)),
            numbersRatio: Number(currentValues[1].toFixed(2)),
            symbolsRatio: Number(currentValues[2].toFixed(2)),
            lettersRatio: Number(currentValues[3].toFixed(2)),
            uppercaseRatio: Number(currentValues[4].toFixed(2))
        };

        setButtonState('is-loading');

        try {
            let res = await window.api.salva_pref("generato_pref", calculatedPreferences);

            if (typeof onApply === 'function') {
                onApply(calculatedPreferences);
            }

            const isSuccess = res !== false && res !== null && res !== undefined;

            setButtonState(isSuccess ? 'is-success' : 'is-error');
            setTimeout(() => {
                setButtonState(null);
            }, 2500);

        } catch (err) {
            console.error("Errore salvataggio preferenze generatore:", err);
            setButtonState('is-error');
            setTimeout(() => {
                setButtonState(null);
            }, 2500);
        }
    });

    updateRadar();
    return wrapper;
}