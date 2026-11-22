(function () {
  "use strict";
  function $(s) { return document.querySelector(s); }
  function tous(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  // Même parade que typo.html pour l'insécable trop large de Latin Modern
  function insecable(s) { return s.replace(/\u00a0/g, "\u2060 \u2060"); }

  // Portions
  var bloc = $(".ingredients");
  if (bloc) {
    var base = Number(bloc.dataset.base), courant = base;
    var pas = base < 3 ? 0.5 : 1;
    var afficher = function (n) {
      courant = n;
      var f = n / base;
      $(".portions").textContent = Format.nombre(Math.round(n * 100) / 100);
      tous("[data-ingredient]").forEach(function (e) { e.textContent = insecable(Format.ingredient(JSON.parse(e.dataset.ingredient), f)); });
      tous("[data-modele]").forEach(function (e) { e.textContent = insecable(Format.etape(e.dataset.modele, f)); });
      $(".avis").hidden = n === base;
    };
    $(".moins").addEventListener("click", function () { if (courant - pas > 0) afficher(courant - pas); });
    $(".plus").addEventListener("click", function () { afficher(courant + pas); });
    $(".base").addEventListener("click", function () { afficher(base); });
    $(".reglage").hidden = false;
  }

  // Recherche, sans tenir compte des accents
  var champ = $(".recherche");
  if (champ) {
    var simple = function (s) { return s.toLowerCase().replace(/œ/g, "oe").normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var lignes = tous("[data-mots]").map(function (e) { return { e: e, mots: simple(e.dataset.mots) }; });
    champ.hidden = false;
    champ.addEventListener("input", function () {
      var termes = simple(champ.value).split(/\s+/).filter(Boolean), n = 0;
      lignes.forEach(function (l) {
        var garde = termes.every(function (t) { return l.mots.indexOf(t) >= 0; });
        l.e.hidden = !garde;
        if (garde) n++;
      });
      tous(".groupe").forEach(function (g) { g.hidden = !g.querySelector("[data-mots]:not([hidden])"); });
      $(".aucun").hidden = n > 0;
    });
  }

  // Tourner les pages au clavier
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.target.closest("input, textarea")) return;
    var lien = e.key === "ArrowLeft" ? $("a.precedent") : e.key === "ArrowRight" ? $("a.suivant") : null;
    if (lien) lien.click();
  });

  // Écran allumé en cuisine
  var eveil = $(".eveil");
  if (eveil && "wakeLock" in navigator) {
    var verrou = null, voulu = false;
    var allumer = function () {
      navigator.wakeLock.request("screen").then(function (v) {
        verrou = v;
        eveil.setAttribute("aria-pressed", "true");
      }, function () {
        voulu = false;
        eveil.setAttribute("aria-pressed", "false");
      });
    };
    eveil.hidden = false;
    eveil.addEventListener("click", function () {
      voulu = !voulu;
      if (voulu) return allumer();
      if (verrou) verrou.release();
      eveil.setAttribute("aria-pressed", "false");
    });
    // Le navigateur rend le verrou quand l'onglet est masqué
    document.addEventListener("visibilitychange", function () {
      if (voulu && document.visibilityState === "visible") allumer();
    });
  }
})();
