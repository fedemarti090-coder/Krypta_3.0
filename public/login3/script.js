async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const ans = await window.api.register(username, password);
    console.log(ans)
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const ans = await window.api.login(username, password);
    console.log(ans)
}

async function save_ps() {
    const name = document.getElementById("name").value;
    const username = document.getElementById("username-ps").value;
    const password = document.getElementById("password-ps").value;

    const new_obj = {name: name, username: username, password: password};

    const ans = await window.api.aggiungi_data(new_obj);
}

async function read_ps() {
    const ans = await window.api.leggi_data();
    document.getElementById("ps-display").value = JSON.stringify(ans.data);
}

async function clear_ps(){
    const ans = await window.api.svuota_data()
}