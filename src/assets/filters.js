(function () {
  const bar = document.querySelector("[data-filter-bar]");
  if (!bar) return;

  const buttons = Array.from(bar.querySelectorAll("[data-filter]"));
  const rows = Array.from(document.querySelectorAll(".listing-row"));
  const countEl = bar.querySelector("[data-filter-count]");
  const emptyEl = document.querySelector("[data-empty-filter]");
  const active = new Set();

  function apply() {
    let visible = 0;
    rows.forEach((row) => {
      const show = [...active].every((key) => row.getAttribute("data-" + key) === "1");
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (countEl) {
      countEl.textContent = active.size
        ? visible + " of " + rows.length + " listings match"
        : rows.length + " listings";
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-filter");
      const on = !active.has(key);
      if (on) active.add(key);
      else active.delete(key);
      button.setAttribute("aria-pressed", on ? "true" : "false");
      apply();
    });
  });

  apply();
})();
