/* Shared motion and behaviour for the three Magnum concepts.
   Everything degrades gracefully: without JS the content is simply visible. */
(function () {
  var doc = document.documentElement;
  if (location.hash === "#shot") doc.classList.add("shot");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.classList.add(reduce || doc.classList.contains("shot") ? "no-motion" : "motion");

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    // 1. Reveal on scroll: [data-reveal] fades and rises; children of [data-stagger] follow one by one.
    var items = [].slice.call(document.querySelectorAll("[data-reveal]"));
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      [].forEach.call(g.children, function (c, i) { c.setAttribute("data-reveal", ""); c.style.setProperty("--i", i); items.push(c); });
    });
    if ("IntersectionObserver" in window && doc.classList.contains("motion")) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add("in"); });
    }

    // 2. Header turns solid after the first scroll.
    var hdr = document.querySelector("[data-header]");
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle("scrolled", window.scrollY > 24); };
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    }

    // 3. Full-screen menu on phones.
    var mb = document.querySelector("[data-menu-btn]"), menu = document.querySelector("[data-menu]");
    if (mb && menu) {
      var setOpen = function (open) {
        menu.classList.toggle("open", open); doc.classList.toggle("menu-open", open);
        mb.setAttribute("aria-expanded", open ? "true" : "false");
      };
      mb.addEventListener("click", function () { setOpen(!menu.classList.contains("open")); });
      menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    }

    // 4. Hero slideshow: [data-slides] > img, crossfade every 5 seconds.
    document.querySelectorAll("[data-slides]").forEach(function (box) {
      var imgs = box.querySelectorAll("img"), i = 0;
      if (!imgs.length) return;
      imgs[0].classList.add("on");
      if (imgs.length < 2 || !doc.classList.contains("motion")) return;
      setInterval(function () { imgs[i].classList.remove("on"); i = (i + 1) % imgs.length; imgs[i].classList.add("on"); }, 5000);
    });

    // 5. Before / after sliders: [data-ba] holds .ba-after (clipped) and an input[type=range].
    document.querySelectorAll("[data-ba]").forEach(function (ba) {
      var r = ba.querySelector("input[type=range]");
      var set = function (v) { ba.style.setProperty("--pos", v + "%"); };
      set(r.value); r.addEventListener("input", function () { set(r.value); });
      if (!doc.classList.contains("motion") || !("IntersectionObserver" in window)) return;
      var seen = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return; seen.disconnect();
          var steps = [50, 22, 78, 50], k = 0;
          var t = setInterval(function () { if (k >= steps.length) return clearInterval(t); ba.classList.add("glide"); r.value = steps[k]; set(steps[k]); k++; }, 650);
          setTimeout(function () { ba.classList.remove("glide"); }, 3200);
        });
      }, { threshold: 0.5 });
      seen.observe(ba);
    });

    // 6. Marquee: duplicate the track once so it can loop seamlessly.
    document.querySelectorAll("[data-marquee]").forEach(function (m) {
      var t = m.querySelector(".track"); if (!t || !doc.classList.contains("motion")) return;
      t.innerHTML += t.innerHTML;
    });

    // 7. Checklists tick themselves when they scroll into view.
    document.querySelectorAll("[data-ticks]").forEach(function (list) {
      if (!("IntersectionObserver" in window) || !doc.classList.contains("motion")) { list.classList.add("ticked"); return; }
      var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { list.classList.add("ticked"); o.disconnect(); } }); }, { threshold: 0.4 });
      o.observe(list);
    });

    // 8. Gentle page fade between pages of the same site.
    if (doc.classList.contains("motion")) {
      document.querySelectorAll("a[href]").forEach(function (a) {
        var h = a.getAttribute("href");
        if (!h || h.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(h) || a.target === "_blank") return;
        a.addEventListener("click", function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault(); doc.classList.add("leaving");
          setTimeout(function () { location.href = h; }, 220);
        });
      });
      window.addEventListener("pageshow", function () { doc.classList.remove("leaving"); });
    }

    // 9. Current year in footers.
    document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
  });
})();
