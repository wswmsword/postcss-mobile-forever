import "./index.css";

const title = "Vanilla Mobile View";
const letters = ['✨', ' '].concat(title.split(''), '🐰', ' ', '🐱');

let spanHtml = '';
letters.forEach((letter, idx) => {
  // span.innerHTML = 
  spanHtml += `<span style="transform: rotate(${idx * 5}deg)">${letter}</span>`
});

const bgTitle = document.getElementById("bg-title");
bgTitle.innerHTML = spanHtml;