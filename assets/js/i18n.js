/* Tiny i18n engine shared by the main site and /medical/.
   - [data-i18n="key"]        innerHTML from I18N_DICT[lang][key]; English is whatever the HTML ships with.
   - [data-i18n-attr="attr:key;attr2:key2"] translated attributes.
   - [data-lsrc] [data-lposter] [data-llb] [data-lhref]  "{l}" is replaced by the language (localised media and links).
   Language: ?lang= > saved choice > browser language > en. */
(() => {
  const LANGS = ["en", "it", "es"];
  const D = window.I18N_DICT || {};
  const txt = [...document.querySelectorAll("[data-i18n]")];
  const enTxt = new Map(txt.map((e) => [e, e.innerHTML]));
  const att = [...document.querySelectorAll("[data-i18n-attr]")].map((e) => ({
    e, pairs: e.dataset.i18nAttr.split(";").map((p) => p.split(":")).map(([a, k]) => ({ a, k, en: e.getAttribute(a) })),
  }));
  const metaDesc = document.querySelector('meta[name="description"]');
  const en = { _title: document.title, _desc: metaDesc ? metaDesc.content : "" };
  let cur = "en";

  const store = { get() { try { return localStorage.getItem("lang"); } catch (e) { return null; } },
                  set(v) { try { localStorage.setItem("lang", v); } catch (e) {} } };
  function pick() {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    const s = store.get(); if (LANGS.includes(s)) return s;
    const n = (navigator.language || "en").slice(0, 2).toLowerCase();
    return LANGS.includes(n) ? n : "en";
  }
  const t = (k) => (cur !== "en" && D[cur] && D[cur][k] != null) ? D[cur][k] : ((D.en && D.en[k] != null) ? D.en[k] : en[k]);

  function apply(l, first) {
    cur = l;
    document.documentElement.lang = l;
    txt.forEach((e) => {
      const k = e.dataset.i18n;
      const v = l === "en" ? enTxt.get(e) : (D[l] && D[l][k]);
      if (v != null && e.innerHTML !== v) e.innerHTML = v;
    });
    att.forEach(({ e, pairs }) => pairs.forEach(({ a, k, en: v0 }) => {
      const v = l === "en" ? v0 : (D[l] && D[l][k]);
      if (v != null) e.setAttribute(a, v);
    }));
    document.title = t("_title");
    if (metaDesc) metaDesc.content = t("_desc");
    const sub = (s) => s.replace(/\{l\}/g, l);
    document.querySelectorAll("[data-lposter]").forEach((v) => { v.poster = sub(v.dataset.lposter); });
    document.querySelectorAll("[data-lsrc]").forEach((m) => {
      const src = sub(m.dataset.lsrc);
      if (m.getAttribute("src") === src) return;
      if (m.tagName === "VIDEO") {
        const playing = !m.paused;
        m.src = src;
        if (playing) m.play().catch(() => {});
      } else m.src = src;
    });
    document.querySelectorAll("[data-llb]").forEach((m) => { m.dataset.lb = sub(m.dataset.llb); });
    document.querySelectorAll("[data-lhref]").forEach((a) => { a.href = sub(a.dataset.lhref); });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    if (!first) dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    const l = b.dataset.lang;
    store.set(l);
    const u = new URL(location.href); u.searchParams.set("lang", l);
    history.replaceState(null, "", u);
    apply(l);
  }));

  window.I18N = { t, lang: () => cur };
  apply(pick(), true);
})();
