## 🛡️ Panoramica del Progetto

**Krypta** è un password manager e vault desktop ad alte prestazioni, sviluppato con un'architettura moderna basata su **Electron**, **Express.js** e **SQLite**. Progettato con un forte focus sulla sicurezza informatica e sulla privacy assoluta, implementa un modello **Zero-Knowledge**: i dati sono crittografati localmente e neanche l'applicazione o il sistema sottostante possono decifrarli senza la chiave primaria dell'utente.

Caratterizzato da un'interfaccia grafica rifinita in stile **Liquid Glass** e animazioni fluide gestite interamente via GPU, Krypta unisce usabilità e robustezza crittografica di livello industriale (pronto per standard Post-Quantum).

---

## 🚀 Caratteristiche Principali

* **🔐 Architettura Zero-Knowledge & Crittografia Robusta:** 
  * Derivazione della chiave tramite **Argon2id**.
  * Espansione della chiave con **HKDF**.
  * Cifratura simmetrica dei dati con **AES-256-GCM**.
* **⚙️ Stack Desktop Moderno:** Sviluppato su Electron e Node.js con un server Express locale per gestire la logica protetta dei dati.
* **📂 Gestione Completa del Database & Backup:**
  * Importazione ed esportazione di backup sicuri (in chiaro o criptati in formato `.json`).
  * Strumenti integrati di pulizia e manutenzione del database e dei log di sicurezza.
* **🛡️ Monitoraggio e Sicurezza Avanzata:**
  * Terminale interattivo dei log di sistema per tracciare ogni accesso o modifica.
  * Radar interattivo per la generazione di password sicure basate su preferenze granulari.
  * Valutazione in tempo reale della forza delle password (Password Strength Evaluator).
* **📝 Note Protette con PIN:** Sezione isolata per la memorizzazione di informazioni altamente sensibili protetta da PIN dedicato.
* **🎨 UI/UX curata nel dettaglio:** Design system a tema scuro, effetti *Liquid Glass* (`backdrop-filter`), transizioni fluide senza sfarfallii (FOUC prevention) e griglie di punti interattive.

---

## 🛠️ Stack Tecnologico

* **Frontend:** HTML5, CSS3 (Custom Properties & Keyframe animations), JavaScript (ES Modules).
* **Backend & Desktop Core:** Electron, Node.js, Express.js.
* **Database:** SQLite con gestione locale protetta.
* **Sicurezza & Crittografia:** Argon2id, HKDF, AES-256-GCM.


## ⚙️ Installazione ed Esecuzione

Assicurati di avere installato Node.js sul tuo sistema.

   ```bash
   git clone [https://github.com/tuo-username/krypta.git](https://github.com/tuo-username/krypta.git)
   cd krypta

   npm install

   npm start

```

---

## 🔒 Sicurezza e Privacy

Krypta non invia alcuna credenziale o dato sensibile a server esterni. Ogni operazione di cifratura e decifratura avviene esclusivamente sul dispositivo dell'utente. I registri di log interni permettono di monitorare costantemente lo stato di integrità del database.

---


## 🖼️ Anteprime dell'Interfaccia

<table>
  <tr>
    <td align="center"><img src="img/final/img1.png" alt="Krypta Anteprima 1" width="100%"/></td>
    <td align="center"><img src="img/final/img2.png" alt="Krypta Anteprima 2" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><img src="img/final/img3.png" alt="Krypta Anteprima 3" width="100%"/></td>
    <td align="center"><img src="img/final/img4.png" alt="Krypta Anteprima 4" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><img src="img/final/img5.png" alt="Krypta Anteprima 5" width="100%"/></td>
    <td align="center"><img src="img/final/img6.png" alt="Krypta Anteprima 6" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><img src="img/final/img7.png" alt="Krypta Anteprima 7" width="100%"/></td>
    <td align="center"><img src="img/final/img8.png" alt="Krypta Anteprima 8" width="100%"/></td>
  </tr>
</table>