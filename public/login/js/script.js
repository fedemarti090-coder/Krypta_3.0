document.addEventListener('DOMContentLoaded', async () => {
  const pref = await window.api.load_pref();
  console.log(pref)
  const usernameInput = document.getElementById("username");
  const rememberCheckbox = document.getElementById("remember");

  usernameInput.value = pref.global.username;
  rememberCheckbox.checked = pref.global.remember;


});

const btn_dx_up = document.getElementById("btn-signin");
const change_btn = document.getElementById("change-btn");
const button = document.getElementById("btn-login");

function register_html() {
  btn_dx_up.textContent = "ACCEDI";
  change_btn.textContent = "Torna al Login";

  const btnText = button.querySelector(".btn-text");
  if (btnText) btnText.textContent = "REGISTRATI";

  const pwdAlert = document.getElementById("pwd-alert");
  if (pwdAlert) {
    pwdAlert.style.display = "flex";
    pwdAlert.classList.add("is-visible");
  }
}

function login_html() {
  btn_dx_up.textContent = "REGISTRATI";
  change_btn.textContent = "Nuovo utente? Registrati QUI";

  const btnText = button.querySelector(".btn-text");
  if (btnText) btnText.textContent = "ACCEDI";

  const pwdAlert = document.getElementById("pwd-alert");
  if (pwdAlert) {
    pwdAlert.style.display = "none";
    pwdAlert.classList.remove("is-visible");
  }
}
let side = true;

function change() {
  side = !side;
  if (side) {
    login_html();
  } else {
    register_html();
  }
}

function get_data() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  return { username: username, password: password };
}

function action_start() {
  if (side) {
    login();
  } else {
    register();
  }
}

async function login() {
  const { username, password } = get_data();


  if (!username || !password) {
    startLoginAnimation();
    setTimeout(() => finishLoginAnimation(false), 300);
    if (!username) {
      showError("Username mancante", ["username"]);
    }
    if (!password) {
      showError("Password mancante", ["password"]);
    }
    return;
  }


  startLoginAnimation();

  try {
    const ans = await window.api.login(username, password, document.getElementById("remember").checked);
    console.log(ans);
    finishLoginAnimation(ans.status);
    if (!ans.status) {
      showError(ans.message);
      return;
    }
    setTimeout(async () => {
      await start_transition();
      setTimeout(()=>{
        window.api.load_html('home');
      }, 350);
      
    }, 850)
  } catch (error) {
    console.error("Errore di rete/IPC:", error);
    finishLoginAnimation(false);
  }
}

async function register() {
  const { username, password } = get_data();

  if (!username || !password) {
    startLoginAnimation();
    setTimeout(() => finishLoginAnimation(false), 300);
    if (!username) {
      showError("Username mancante", ["username"]);
    }
    if (!password) {
      showError("Password mancante", ["password"]);
    }
    return;
  }

  startLoginAnimation();

  try {
    const ans = await window.api.register(username, password, document.getElementById("remember").checked);
    console.log(ans);
    finishLoginAnimation(ans.status);
    if (!ans.status) {
      showError(ans.message);
      return;
    }
    setTimeout(async () => {
      await start_transition();
      window.api.load_html('home')
    }, 850)
  } catch (error) {
    console.error("Errore di rete/IPC:", error);
    finishLoginAnimation(false);
  }
}

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
  } else {
    btn.classList.add('is-error');

    setTimeout(() => {
      btn.classList.remove('is-error');
    }, 2500);
  }
}

function showError(message, fieldsToHighlight = []) {
  const errorEl = document.getElementById('auth-error-msg');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }

  fieldsToHighlight.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('input-error');
  });

  setTimeout(() => { clearErrors() }, 5000);
}

function clearErrors() {
  const errorEl = document.getElementById('auth-error-msg');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  document.querySelectorAll('.input-group input').forEach(input => {
    input.classList.remove('input-error');
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    login();
  }
});

function start_transition() {
    return new Promise((resolve) => {
        const container = document.querySelector('.main-container');

        container.classList.add('is-animating');

        setTimeout(() => {
            container.classList.add('view-home');

            setTimeout(() => {
                resolve();
            }, 350); 

        }, 250);
    });
}

