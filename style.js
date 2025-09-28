
/*
  Paradise Network • Vencord Local Plugin (JS)
  File: pn-mouse-tracker.js
  Load as a Local Plugin or via "UserScript" plugin. Creates a silky mouse trail + ring.
*/
(function() {
  if (window.__PN_MOUSE_TRACKER__) return;
  window.__PN_MOUSE_TRACKER__ = true;

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const trailCount = Math.max(4, Math.min(24, parseInt(getComputedStyle(root).getPropertyValue("--pn-cursor-trail")) || 10));

  const dot = document.createElement("div");
  dot.className = "pn-cursor";
  const ring = document.createElement("div");
  ring.className = "pn-cursor-ring";
  const trail = document.createElement("div");
  trail.className = "pn-cursor-trail";

  for (let i = 0; i < trailCount; i++) trail.appendChild(document.createElement("span"));

  document.body.appendChild(trail);
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let tx = window.innerWidth/2, ty = window.innerHeight/2;
  let x = tx, y = ty;
  let rx = tx, ry = ty;
  const speed = Math.max(.05, Math.min(.45, parseFloat(getComputedStyle(root).getPropertyValue("--pn-cursor-speed")) || .18));
  const positions = Array.from({length: trailCount}, ()=>({x, y}));

  function onMove(e) {
    tx = e.clientX; ty = e.clientY;
  }
  function onLeave() {
    tx = -9999; ty = -9999;
  }
  function onDown() {
    dot.style.transition = "transform .08s ease-out";
    ring.style.transition = "transform .08s ease-out";
    dot.style.transform += ` scale(${getVar("--pn-cursor-scale-on-click", .8)})`;
    ring.style.transform += ` scale(${getVar("--pn-cursor-ring-scale-on-click", 1.18)})`;
  }
  function onUp() {
    dot.style.transition = "transform .18s ease-out";
    ring.style.transition = "transform .18s ease-out";
  }

  function getVar(name, fallback) {
    const v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  }

  document.addEventListener("mousemove", onMove, {passive:true});
  document.addEventListener("mouseleave", onLeave, {passive:true});
  document.addEventListener("mousedown", onDown, {passive:true});
  document.addEventListener("mouseup", onUp, {passive:true});

  let raf;
  function loop() {
    raf = requestAnimationFrame(loop);
    x += (tx - x) * speed;
    y += (ty - y) * speed;
    rx += (tx - rx) * (speed * .65);
    ry += (ty - ry) * (speed * .65);

    dot.style.transform = `translate3d(${x - dot.offsetWidth/2}px, ${y - dot.offsetHeight/2}px, 0)`;
    ring.style.transform = `translate3d(${rx - ring.offsetWidth/2}px, ${ry - ring.offsetHeight/2}px, 0)`;

    positions.pop();
    positions.unshift({x, y});
    const spans = trail.children;
    for (let i = 0; i < spans.length; i++) {
      const p = positions[Math.min(positions.length - 1, i * 1.2 | 0)];
      spans[i].style.transform = `translate3d(${p.x - spans[i].offsetWidth/2}px, ${p.y - spans[i].offsetHeight/2}px, 0) scale(${1 - i/(spans.length*1.8)})`;
      spans[i].style.opacity = (parseFloat(getComputedStyle(root).getPropertyValue("--pn-cursor-trail-opacity")) || .10) * (1 - i/(spans.length+2));
    }
  }

  if (!prefersReduced) loop();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(raf);
    try { dot.remove(); ring.remove(); trail.remove(); } catch {}
  });

  // Hide native cursor inside Discord only
  const hideCursorCss = document.createElement("style");
  hideCursorCss.textContent = `* { cursor: none !important; }`;
  document.head.appendChild(hideCursorCss);
})();
