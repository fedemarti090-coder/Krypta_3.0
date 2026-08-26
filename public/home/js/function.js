function startLoginAnimation() {
    const btn = document.getElementById('btn-login');
    if (!btn) return;

    btn.classList.remove('is-success', 'is-error');
    btn.classList.add('is-loading');
}

function finishLoginAnimation(success) {
    const btn = document.getElementById('btn-login');
    if (!btn) return;

    btn.classList.remove('is-loading');

    if (success) {
        btn.classList.add('is-success');
        setTimeout(() => {
            btn.classList.remove('is-succes');
        }, 2500);
    } else {
        btn.classList.add('is-error');

        setTimeout(() => {
            btn.classList.remove('is-error');
        }, 2500);
    }
}


function triggerErrorAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.remove('is-error');

    void element.offsetWidth;

    element.classList.add('is-error');

    setTimeout(() => {
        element.classList.remove('is-error');
    }, 500);
}

async function carica_password() {
    const name = document.getElementById("nome").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password-i").value;
    const triggerIcon = document.querySelector("#picker-trigger-nome .picker-trigger-icon");

    const src = triggerIcon ? (triggerIcon.dataset.selectedSrc || triggerIcon.src) : "./asset/icon/default.png";

    let correct = true;
    if (!name) {
        triggerErrorAnimation("nome");
        correct = false;
    }
    if (!username) {
        triggerErrorAnimation("username");
        correct = false;
    }
    if (!password) {
        triggerErrorAnimation("password-i");
        correct = false;
    }
    if (!correct) { return };
    startLoginAnimation();
    const ans = await window.api.aggiungi_data({ icon: src, name: name, username: username, password: password });
    setTimeout(() => {
        finishLoginAnimation(ans.status);
    }, 500);

    console.log(ans)

}

function openConfirmPopup(question, onConfirm) {

    const existingOverlay = document.querySelector('.popup-confirm-overlay');
    if (existingOverlay) existingOverlay.remove();


    const overlay = document.createElement('div');
    overlay.className = 'popup-confirm-overlay';

    overlay.innerHTML = `
        <div class="popup-confirm-card">
            <p class="popup-confirm-text">${question}</p>
            <div class="popup-confirm-actions">
                <button type="button" class="popup-btn popup-btn-cancel">Annulla</button>
                <button type="button" class="popup-btn popup-btn-confirm">Procedi</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);


    const closePopup = () => {
        overlay.classList.add('closing');
        overlay.addEventListener('animationend', () => {
            overlay.remove();
        }, { once: true });
    };


    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });


    const cancelBtn = overlay.querySelector('.popup-btn-cancel');
    const confirmBtn = overlay.querySelector('.popup-btn-confirm');


    cancelBtn.addEventListener('click', closePopup);


    confirmBtn.addEventListener('click', () => {
        closePopup();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });


    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });
}

function switch_state(state) {
    const bg2 = document.getElementById("dot-field-wrapper");

    if (bg2) bg2.classList.toggle('hidden', Boolean(state));
}