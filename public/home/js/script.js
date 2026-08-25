document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.sidebar .nav-item');


    function updateIconPath(item, isActive) {
        const img = item.querySelector('.nav-icon');
        if (!img) return;

        const iconName = img.dataset.icon;
        const folder = isActive ? 'red' : 'white';

        img.src = `./asset/${folder}/${iconName}.png`;
    }


    navItems.forEach(item => {
        const isActive = item.classList.contains('active');
        updateIconPath(item, isActive);
    });


    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();


            navItems.forEach(el => {
                el.classList.remove('active');
                updateIconPath(el, false);
            });


            item.classList.add('active');
            updateIconPath(item, true);
        });
    });
});




import { loadHomeView, loadPasswordView, loadAddView, backupView, profiloView, impostazioniView } from './option.js';

document.getElementById("home").addEventListener("click", () => {
    loadHomeView();
    //window.api.svuota_data();
});

document.getElementById("password").addEventListener("click", () => {
    loadPasswordView();
});

document.getElementById("add").addEventListener("click", () => {
    loadAddView();
})

document.getElementById("backup").addEventListener("click", ()=>{
    backupView();
})

document.getElementById("profilo").addEventListener("click", ()=>{
    profiloView();
})

document.getElementById("setting").addEventListener("click", ()=>{
    impostazioniView();
})