import { createMainTitle, createInfoParagraph, createPasswordCard, createDivider, createCustomInput, createEmptyState, createSecurityChartCard, createLogoLoop, createButton, createBackupCards, createAuthErrorComponent, createProfileCard, createSubTitle, createInactivitySlider, createBoxToggleCard, createSettingsRowButton, createImportButton } from './builder.js';

const optionBox = document.getElementById('option-box');

export function renderStack(components = []) {
    optionBox.innerHTML = '';
    components.forEach(component => {
        optionBox.appendChild(component);
    });
}

function evaluatePasswordStrength(password) {
    if (!password) {
        return { score: 0, level: 'danger', length: 0, feedback: ['Password vuota'] };
    }

    let score = 0;
    const feedback = [];
    const len = password.length;


    if (len >= 8) score += 20;
    if (len >= 12) score += 20;
    if (len >= 16) score += 10;
    if (len < 8) feedback.push('Usa almeno 8 caratteri');


    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    if (hasLowercase) score += 10;
    else feedback.push('Aggiungi lettere minuscole');

    if (hasUppercase) score += 15;
    else feedback.push('Aggiungi lettere maiuscole');

    if (hasNumbers) score += 10;
    else feedback.push('Aggiungi numeri');

    if (hasSymbols) score += 15;
    else feedback.push('Aggiungi caratteri speciali (!@#$%^&*)');

    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
        score -= 15;
        feedback.push('Evita di usare solo numeri o solo lettere');
    }

    if (/(.)\1{2,}/.test(password)) {
        score -= 10;
        feedback.push('Evita ripetizioni di caratteri');
    }

    score = Math.max(0, Math.min(100, score));

    let level = 'danger';
    if (score >= 70) {
        level = 'good';
    } else if (score >= 45) {
        level = 'warning';
    }

    return {
        score,
        level,
        length: len,
        feedback
    };
}

function password_level(password_list) {
    let risk_high = 0, risk_mid = 0, risk_low = 0;
    for (let row of password_list) {
        const result = evaluatePasswordStrength(row.password);
        if (result.level === 'danger') risk_high++;
        else if (result.level === 'warning') risk_mid++;
        else if (result.level === 'good') risk_low++;
    }
    return [risk_high, risk_mid, risk_low];
}

export async function loadHomeView() {
    const block1 = createMainTitle("Home");
    const block2 = createInfoParagraph("Qui puoi gestire tutte le tue password e impostazioni");
    let block3 = "";
    const password_list = await window.api.leggi_data();
    if (!password_list.status || password_list.data.accounts.length < 1) {
        block3 = createSecurityChartCard(0, 0, 0, 0);
    } else {
        let [risk_high, risk_mid, risk_low] = password_level(password_list.data.accounts);
        block3 = createSecurityChartCard(risk_high, risk_mid, risk_low, password_list.data.accounts.length);
    }



    const baseText = "Collega nuove password";
    const block4 = createInfoParagraph(baseText);

    const block5 = createLogoLoop({
        onHover: (brandName) => {
            block4.textContent = `${baseText} ( ${brandName} )`;
        },
        onLeave: () => {
            block4.textContent = baseText;
        }
    });

    renderStack([block1, block2, block3, block4, block5]);
}

export async function loadPasswordView() {
    const block1 = createMainTitle("Password");
    const block2 = createInfoParagraph("Gestisci tutte le tue password clicca sull'occhio per visualizzarla o sul cuore per aggiungerla ai preferiti");
    const component = [block1, block2];
    let password_list = await window.api.leggi_data();
    let component_vett = [];

    if (password_list && password_list.status && password_list.data?.accounts && password_list.data.accounts.length > 0) {
        const raw_list = (password_list.data.accounts).toReversed();
        for (const row of raw_list) {
            const src = (row.icon && typeof row.icon === 'string' && row.icon.trim() !== '')
                ? row.icon
                : './asset/icon/default.png';
            component_vett.push(createPasswordCard(src, row.name, row.username, row.password));
        }
    } else {
        const block4 = createEmptyState();
        component_vett.push(block4);
    }



    renderStack([...component, ...component_vett]);
}

export function loadAddView() {
    const block1 = createMainTitle("Aggiungi nuova password");
    const block2 = createInfoParagraph("Inserisci nome APP / sito ...")
    const block3 = createCustomInput("nome", "", "./asset/icon/name.png", "", "nome", true);
    const block4 = createInfoParagraph("Inserisci username")
    const block5 = createCustomInput("username", "", "./asset/icon/username.png", "", "username");
    const block6 = createInfoParagraph("Inserisci password")
    const block7 = createCustomInput("password", "password", "./asset/icon/password.png", "", "password-i", false, true);
    const block8 = createButton("Aggiungi", "carica_password()")
    renderStack([block1, block2, block3, block4, block5, block6, block7, block8])
}

window.loadAddView = loadAddView;

export function preferitiaView() {

}
export function backupView() {
    let selectedOption = null;

    const authError = createAuthErrorComponent('#auth-error-msg');

    const block1 = createMainTitle("Crea un Backup");
    const block2 = createInfoParagraph("Se vuoi esportare le tue password in chiaro ( per avere una lista ordinata ) o criptate ( per importarle su un altro dispositivo in Krypta ) scegli il metodo di esportazione desiderato qua sotto:");
    const block3 = createDivider();

    const block4 = createBackupCards((type) => {
        selectedOption = type;
    });

    const block5 = createButton("Scarica", async () => {
        startLoginAnimation();
        if (!selectedOption) {
            authError.show("Seleziona metodo di dowload");
            setTimeout(() => {
                finishLoginAnimation(false);
            }, 500);
            return;
        }

        const isProtected = (selectedOption === 'encrypted');
        const res = await window.api.download_db(isProtected);
        console.log(res);
        if (!res.status) {
            authError.show(res.message);
        } else {
            authError.clear();
        }
        setTimeout(() => {
            finishLoginAnimation(res.status);
        }, 500);
    });

    renderStack([block1, block2, block3, block4, authError.element, block5]);
}
export function cestinoView() {

}
export async function profiloView() {

    const user_data = await window.api.leggi_data();

    const block1 = createMainTitle("Profilo");
    const block2 = createProfileCard(user_data.username, user_data.created_at, user_data.data.accounts.length);
    const block3 = createInfoParagraph("Per informazioni sulla privacy o per contattare l'assistenza:")
    const block4 = createInfoParagraph("gmail:  krypta-info@gmail.net");
    const block5 = createInfoParagraph("Cell:   +3534462385");


    renderStack([block1, block2, block3, block4, block5]);

}
export function impostazioniView() {
    const block1 = createMainTitle("Impostazioni");
    const block2 = createInfoParagraph("Gestisci sicurezza e preferenze qui nell'area impostazioni");
    const block3 = createDivider();
    const block4 = createSubTitle("Gestione inattività");
    const block5 = createInfoParagraph("Blocco automatico per inattività: scegli dopo quanto tempo effettuare il logout");
    const block6 = createInactivitySlider(10, (minuti) => {
        console.log(`Tempo impostato a: ${minuti} minuti`);
    });
    const block7 = createBoxToggleCard(
        "Blocco alla minimizzazione",
        "Blocca la sessione di Krypta automaticamente quando l'applicazione viene ridotta ad icona",
        false,
        (stato) => console.log("Minimizzazione attiva:", stato)
    );
    const block8 = createDivider();
    const block9 = createSubTitle("Interfaccia e prestazioni");
    const block10 = createBoxToggleCard(
        "Risparmi prestazioni CPU",
        "Risparmi prestazioni sulla CPU disattivando gli sfondi animati",
        false,
        (stato) => console.log("Risparmio CPU attivo:", stato)
    );
    const block11 = createDivider();
    const block12 = createSubTitle("Gestione database");

    const importBtnObj = createImportButton(
        "Importa un file di backup .json",
        "./asset/icon/backup.png",
        async ({ startAnimation, stopAnimation }) => {
            startAnimation(1500);

            const res = await window.api.importa_backup();
            console.log(res);
            setTimeout(() => {
                if (res && res.status) {
                    stopAnimation(true);
                } else {
                    stopAnimation(false);
                }
            }, 1500);
        }
    );

    const block14 = createSettingsRowButton("Eliminami dal database", "./asset/icon/delete_db.png", true);
    const block15 = createSettingsRowButton("Elimina tutte le mie password", "./asset/icon/delete_password.png", true);

    renderStack([
        block1, block2, block3, block4, block5,
        block6, block7, block8, block9, block10,
        block11, block12, importBtnObj.element, block14, block15
    ]);
}

loadHomeView();