import { TextType } from './TextType.js';

document.addEventListener('DOMContentLoaded', () => {
  new TextType('#typing-heading', {
    text: [
      "Benvenuto in Krypta!",
      "Proteggi le TUE password",
      "Il tuo Caveau personale",
      "Tutto è pronto INIZIAMO!"
    ],
    typingSpeed: 75,
    deletingSpeed: 50,
    pauseDuration: 1500,
    showCursor: true,
    cursorCharacter: "_",
    loop: true,
    textColors: ['#ffffff', '#ffffff', '#ffffff']
  });
});