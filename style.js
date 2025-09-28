(() => {
  if (window.__vcMouseFX && window.__vcMouseFX.cleanup) try { window.__vcMouseFX.cleanup() } catch {}
  const d = document
  const s = d.createElement('style')
  s.id = 'vc-mousefx-style'
  s.textContent = `
  #vc-mousefx {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity .25s ease;
  }`
  d.head.appendChild(s)
  const c = d.createElement('canvas')
  c.id = 'vc-mousefx'
  d.documentElement.appendChild(c)
  const ctx = c.getContext('2d')
  let w = c.width = window.innerWidth * devicePixelRatio
  let h = c.height = window.innerHeight * devicePixelRatio
  c.style.width = window.innerWidth + 'px'
  c.style.height = window.innerHeight + 'px'
  const colors = ['#7b2cff','#ffe96e','#8a63ff','#c7a7ff']
  const parts = []
  let lastX = w * .5, lastY = h * .5
  let active = false
  let lastMove = 0
  let rafId = 0
  const now = () => performance.now()
  const spawn = (x, y, n, spread, speedMin, speedMax, lifeMin, lifeMax, sizeMin, sizeMax) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = speedMin + Math.random() * (speedMax - speedMin)
      parts.push({
        x, y,
        vx: Math.cos(a) * sp + (Math.random() - .5) * spread,
        vy: Math.sin(a) * sp + (Math.random() - .5) * spread,
        life: lifeMin + Math.random() * (lifeMax - lifeMin),
        age: 0,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color: colors[(Math.random() * colors.length) | 0]
      })
    }
  }
  const onMove = e => {
    const px = (e.clientX || lastX / devicePixelRatio) * devicePixelRatio
    const py = (e.clientY || lastY / devicePixelRatio) * devicePixelRatio
    const dx = px - lastX
    const dy = py - lastY
    const v = Math.min(1, Math.hypot(dx, dy) / (20 * devicePixelRatio))
    lastX = px
    lastY = py
    lastMove = now()
    active = true
    c.style.opacity = '1'
    spawn(px, py, 6 + (v * 10) | 0, 0.6, 0.4, 1.6, 380, 760, 1.2 * devicePixelRatio, 3.2 * devicePixelRatio)
  }
  const onClick = e => {
    const px = (e.clientX || lastX / devicePixelRatio) * devicePixelRatio
    const py = (e.clientY || lastY / devicePixelRatio) * devicePixelRatio
    spawn(px, py, 38, 1.2, 1.2, 3.2, 520, 980, 1.6 * devicePixelRatio, 4.2 * devicePixelRatio)
  }
  const onResize = () => {
    w = c.width = window.innerWidth * devicePixelRatio
    h = c.height = window.innerHeight * devicePixelRatio
    c.style.width = window.innerWidth + 'px'
    c.style.height = window.innerHeight + 'px'
  }
  const step = t => {
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      p.age += 16
      if (p.age >= p.life) { parts.splice(i,1); continue }
      p.vy += 0.006 * devicePixelRatio
      p.vx *= 0.992
      p.vy *= 0.992
      p.x += p.vx
      p.y += p.vy
      const k = 1 - p.age / p.life
      ctx.globalAlpha = Math.max(0, k * .9)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (0.6 + k * 0.8), 0, Math.PI * 2)
      ctx.fill()
    }
    if (active && now() - lastMove > 900) {
      active = false
      c.style.opacity = '0'
    }
    rafId = requestAnimationFrame(step)
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mousedown', onClick, { passive: true })
  window.addEventListener('resize', onResize)
  rafId = requestAnimationFrame(step)
  window.__vcMouseFX = {
    cleanup: () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('resize', onResize)
      try { c.remove() } catch {}
      try { s.remove() } catch {}
      delete window.__vcMouseFX
    }
  }
})()
