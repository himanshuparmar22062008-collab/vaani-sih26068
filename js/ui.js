function mark(svg) {
  return `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="14.5" stroke="currentColor" opacity=".45"/><circle cx="16" cy="16" r="10" stroke="currentColor" opacity=".7"/><path d="M16 9.5 L21.2 21.2 H18.7 L17.6 18.4 H14.4 L13.3 21.2 H10.8 Z" fill="currentColor"/></svg>`;
}
function nav(active) {
  const links = [
    ["index.html", "Home"],
    ["ask.html", "Ask"],
    ["alerts.html", "Alerts"],
    ["climate.html", "Climate"],
    ["pitch.html", "Pitch"],
    ["brief.html", "Script"],
    ["system.html", "System"]
  ];
  return `<header class="nav"><div class="wrap nav-inner">
    <a class="brand" href="index.html">${mark()}VAANI</a>
    <nav class="links">${links.map(([h, l]) => `<a href="${h}" class="${active===l?"on":""}">${l}</a>`).join("")}</nav>
  </div></header>`;
}
function foot() {
  return `<footer class="foot wrap"><p>VAANI · SIH26068 · Ministry of Earth Sciences · Disaster Management</p><p>Team VAANI · IISER Bhopal · B.Tech EECS</p></footer>`;
}
document.addEventListener("DOMContentLoaded", () => {
  const n = document.getElementById("site-nav");
  const f = document.getElementById("site-foot");
  if (n) n.outerHTML = nav(document.body.dataset.page || "Home");
  if (f) f.outerHTML = foot();
});
