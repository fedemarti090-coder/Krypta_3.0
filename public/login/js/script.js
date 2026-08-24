
const btn_dx_up = document.getElementById("btn-signin");
const change_btn = document.getElementById("change-btn");
const button = document.getElementById("btn-login");
function register_html() {
  btn_dx_up.textContent = "ACCEDI";
  change_btn.textContent = "Torna al Login";
  button.textContent = "REGISTRATI"
}
function login_html() {
  btn_dx_up.textContent = "REGISTRATI";
  change_btn.textContent = "Nuovo utente? Registrati QUI";
  button.textContent = "ACCEDI"
}

let side = true;  //true --> login false --> register

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

function action_start(){
  if(side){
    login();
  }else{
    register();
  }
}

async function login() {
  const { username, password } = get_data();
  const ans = await window.api.login(username, password);
  console.log(ans);

}

async function register() {
  const { username, password } = get_data();
  const ans = await window.api.register(username, password);
  console.log(ans);
}