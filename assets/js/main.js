(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nav background once the hero is scrolled past.
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll.
  const rv = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv").forEach((el) => rv.observe(el));

  // Play muted clips only while visible (saves bandwidth and battery).
  const vids = document.querySelectorAll("video[data-auto]");
  const vo = new IntersectionObserver((es) => {
    for (const e of es) {
      const v = e.target;
      if (e.isIntersecting && !reduce) { v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    }
  }, { threshold: 0.25 });
  vids.forEach((v) => vo.observe(v));
  if (reduce) document.querySelector(".hero video")?.pause();

  // Sound toggles.
  document.querySelectorAll(".unmute").forEach((b) => {
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const v = document.getElementById(b.dataset.target);
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
      b.textContent = v.muted ? "🔊 Sound on" : "🔇 Mute";
    });
  });

  // 3D model switcher.
  const mv = document.getElementById("mv");
  const info = document.getElementById("mvinfo");
  document.querySelectorAll("#mtabs button").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#mtabs button").forEach((x) => x.classList.toggle("on", x === b));
      mv.src = b.dataset.src;
      mv.cameraOrbit = b.dataset.orbit;
      info.textContent = b.dataset.info;
    });
  });

  // Lightbox.
  const lb = document.getElementById("lb");
  const lbc = document.getElementById("lbc");
  const close = () => { lb.classList.remove("on"); lbc.innerHTML = ""; document.body.style.overflow = ""; };
  document.querySelectorAll("[data-lb]").forEach((el) => {
    el.addEventListener("click", () => {
      const src = el.dataset.lb;
      lbc.innerHTML = src.endsWith(".mp4")
        ? `<video src="${src}" controls autoplay loop playsinline></video>`
        : `<img src="${src}" alt="">`;
      lb.classList.add("on");
      document.body.style.overflow = "hidden";
    });
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("x")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
