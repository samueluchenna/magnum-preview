document.addEventListener("DOMContentLoaded", function () {
  // "choose your space" tabs
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
      t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.id !== t.getAttribute("aria-controls"); });
    });
  });

  // quote form: builds a WhatsApp message to Magnum
  var form = document.getElementById("quote");
  if (!form) return;
  var q = new URLSearchParams(location.search);
  if (q.get("space")) { var sp = form.querySelector("[name=space]"); if (sp) sp.value = q.get("space"); }
  if (q.get("service")) { var sv = form.querySelector("[name=service]"); if (sv) sv.value = q.get("service"); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form), err = form.querySelector(".err");
    if (!f.get("name") || !f.get("phone") || !f.get("area")) {
      err.textContent = "Add your name, phone number and area so Magnum can reply with a price.";
      return;
    }
    err.textContent = "";
    var lines = [
      "Hello Magnum, I'd like a quote.",
      "Name: " + f.get("name"),
      "Phone: " + f.get("phone"),
      "Space: " + f.get("space"),
      "Service: " + f.get("service"),
      "Area: " + f.get("area"),
      f.get("size") ? "Size: " + f.get("size") : "",
      f.get("date") ? "Preferred date: " + f.get("date") : "",
      "How often: " + (f.get("often") || "One-off"),
      f.get("notes") ? "Notes: " + f.get("notes") : ""
    ].filter(Boolean).join("\n");
    window.open("https://wa.me/2349052942567?text=" + encodeURIComponent(lines), "_blank", "noopener");
    form.querySelector(".done").style.display = "block";
  });
});
