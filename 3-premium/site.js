var SIZES = {
  "Home": ["Studio or 1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms", "Not sure"],
  "Short-let": ["Studio or 1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms", "Not sure"],
  "Office": ["Up to 10 people", "10 to 30 people", "30 to 60 people", "60+ people", "Not sure"],
  "Estate": ["Up to 10 units", "10 to 30 units", "30+ units", "Not sure"],
  "_": ["Small", "Medium", "Large", "Not sure"]
};

document.addEventListener("DOMContentLoaded", function () {
  var b = document.getElementById("builder");
  if (b) builder(b);

  // before/after job switcher on the home page
  var show = document.querySelector("[data-show]");
  if (show) {
    var ba = show.querySelector("[data-ba]"), imgB = ba.querySelector(":scope > img"), imgA = ba.querySelector(".ba-after img"), r = ba.querySelector("input");
    show.querySelectorAll(".job").forEach(function (j) {
      j.addEventListener("click", function () {
        show.querySelectorAll(".job").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        j.setAttribute("aria-pressed", "true");
        imgB.src = j.dataset.before; imgA.src = j.dataset.after;
        imgB.alt = j.dataset.altb; imgA.alt = j.dataset.alta;
        r.value = 50; ba.style.setProperty("--pos", "50%");
      });
    });
  }

  var ask = document.getElementById("ask");
  if (ask) ask.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(ask);
    if (!f.get("name") || !f.get("phone")) { ask.querySelector(".err").textContent = "Add your name and phone number."; return; }
    var msg = ["Hello Magnum, I'd like a price for a cleaning contract.", "Name: " + f.get("name"), "Company: " + (f.get("company") || "-"),
      "Phone: " + f.get("phone"), "Type of building: " + f.get("type"), "Area: " + (f.get("area") || "-"),
      "Schedule: " + f.get("schedule"), f.get("notes") ? "Notes: " + f.get("notes") : ""].filter(Boolean).join("\n");
    window.open("https://wa.me/2349052942567?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
});

function builder(b) {
  var steps = b.querySelectorAll(".step"), i = 0, bar = b.querySelector(".bar i"), cnt = b.querySelector(".count");
  var next = b.querySelector(".next"), back = b.querySelector(".back"), err = b.querySelector(".err"), sum = b.querySelector(".sum");

  function val(name) { var x = b.querySelector('[name="' + name + '"]:checked'); return x ? x.value : ""; }
  function vals(name) { return [].map.call(b.querySelectorAll('[name="' + name + '"]:checked'), function (x) { return x.value; }); }
  function txt(name) { var x = b.querySelector('[name="' + name + '"]'); return x ? x.value.trim() : ""; }

  function fillSizes() {
    var list = SIZES[val("space")] || SIZES._, box = b.querySelector(".sizes");
    box.innerHTML = list.map(function (s) {
      return '<label class="opt"><input type="radio" name="size" value="' + s + '"><span>' + s + '</span></label>';
    }).join("");
  }

  function summary() {
    var parts = [val("space"), val("size"), vals("svc").join(", "), val("often"), txt("area")].filter(Boolean);
    sum.innerHTML = parts.length ? "<b>Your clean:</b> " + parts.join(" · ") : "Pick an option to start. It takes about a minute.";
  }

  function show() {
    steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    bar.style.width = ((i + 1) / steps.length * 100) + "%";
    cnt.textContent = "Step " + (i + 1) + " of " + steps.length;
    back.disabled = i === 0;
    next.textContent = i === steps.length - 1 ? "Send to Magnum on WhatsApp" : "Next";
    err.textContent = "";
  }

  function ok() {
    if (i === 0 && !val("space")) return "Choose the kind of space.";
    if (i === 1 && !val("size")) return "Choose a size, or pick 'Not sure'.";
    if (i === 2 && !vals("svc").length) return "Choose at least one service.";
    if (i === 3 && !val("often")) return "Choose how often.";
    if (i === 4 && (!txt("name") || !txt("phone"))) return "Add your name and phone number so Magnum can reply.";
    return "";
  }

  b.addEventListener("change", function (e) {
    if (e.target.name === "space") fillSizes();
    summary();
  });
  b.addEventListener("input", summary);

  next.addEventListener("click", function () {
    var m = ok();
    if (m) { err.textContent = m; return; }
    if (i < steps.length - 1) { i++; show(); return; }
    var msg = ["Hello Magnum, I'd like a price.",
      "Space: " + val("space") + " (" + val("size") + ")",
      "Services: " + vals("svc").join(", "),
      "How often: " + val("often"),
      txt("date") ? "Preferred date: " + txt("date") : "",
      txt("area") ? "Area: " + txt("area") : "",
      "Name: " + txt("name"), "Phone: " + txt("phone")].filter(Boolean).join("\n");
    window.open("https://wa.me/2349052942567?text=" + encodeURIComponent(msg), "_blank", "noopener");
    sum.innerHTML = "<b>WhatsApp is open with your details.</b> Press send and Magnum replies with a price.";
  });
  back.addEventListener("click", function () { if (i > 0) { i--; show(); } });

  fillSizes(); show(); summary();
}
