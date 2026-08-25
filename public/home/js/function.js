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