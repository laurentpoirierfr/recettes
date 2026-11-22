// Portions : mêmes règles que theme/format.typ, à modifier ensemble.
(function (global) {
  "use strict";
  var NB = " ";
  var MESURES = ["g", "kg", "ml", "cl", "l", "litre"];

  function arrondi(x, n) { var p = Math.pow(10, n || 0); return Math.round(x * p) / p; }

  function arrondir(q, unite, facteur, precis) {
    var v = q * facteur;
    if (facteur === 1) return q;
    if (precis) return arrondi(v, 1);
    if (MESURES.indexOf(unite) >= 0) {
      if (unite === "kg" || unite === "l" || unite === "litre") return arrondi(v, 2);
      if (v >= 100) return Math.round(v / 5) * 5;
      if (v >= 10) return Math.round(v);
      return arrondi(v, 1);
    }
    if (unite.indexOf("cuillère") === 0 || q !== Math.floor(q)) return Math.ceil(arrondi(v * 2, 6)) / 2;
    return Math.ceil(arrondi(v, 6));
  }

  function nombre(v) { return String(v).replace(".", ","); }

  function typo(s) {
    return s.replace(/'/g, "’")
      .replace(/ ([;!?])/g, " $1")
      .replace(/ :/g, NB + ":")
      .replace(/(\d) (h|g|kg|mm|ml|cl|l|min)(?![\wÀ-ÿ])/g, "$1" + NB + "$2")
      .replace(/(\d) (%|°C|minutes)/g, "$1" + NB + "$2")
      .replace(/(^|[^\wÀ-ÿ])h (\d)/g, "$1h" + NB + "$2");
  }

  function ingredient(i, facteur) {
    if (i.quantite === undefined) return typo(i.nom);
    var unite = i.unite || "";
    var q = arrondir(i.quantite, unite, facteur, i.precis);
    var n = nombre(q);
    if (!unite) {
      if (q === 0.25) n = "¼"; else if (q === 0.5) n = "½";
      return typo(n + NB + (q >= 2 && i.pluriel ? i.pluriel : i.nom));
    }
    if (["g", "kg", "ml", "cl", "l"].indexOf(unite) < 0 && q % 1 === 0.5) {
      n = q < 1 ? "½" : Math.floor(q) + "½";
    }
    var u = q >= 2 && i.unite_pluriel ? i.unite_pluriel : unite;
    var de = /^([aeiouyàâéèêîôœ]|huile|herbe)/.test(i.nom.toLowerCase()) ? "d’" : "de ";
    return typo(n + NB + u + " " + de + i.nom);
  }

  function etape(s, facteur) {
    return typo(s.replace(/\{([0-9]+(?:[.,][0-9]+)?) *([^}]*)\}/g, function (_, n, unite) {
      return nombre(arrondir(parseFloat(n.replace(",", ".")), unite, facteur)) + (unite ? NB + unite : "");
    }));
  }

  global.Format = { ingredient: ingredient, etape: etape, nombre: nombre };
})(typeof window === "undefined" ? globalThis : window);
