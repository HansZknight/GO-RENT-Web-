/*
 * ═══════════════════════════════════════════════════════════════
 * GO-RENT - Custom Cursor Effects
 * Version: 1.0.0
 * Author: Hans / Sirhan Muzaffar
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   CURSOR CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const CursorConfig = {
  // Enable/disable cursor
  enabled: true,

  // Outer cursor (ring)
  outer: {
    size: 40,
    borderWidth: 2,
    borderColor: '#00f0ff',
    backgroundColor: 'transparent',
    transitionDuration: 0.15,
    mixBlendMode: 'difference'
  },

  // Inner cursor (dot)
  inner: {
    size: 8,
    backgroundColor: '#ff00f7',
    transitionDuration: 0.05
  },

  // Cursor trail
  trail: {
    enabled: true,
    count: 8,
    size: 6,
    color: '#00f0ff',
    fadeSpeed: 0.1,
    spacing: 3
  },

  // Hover effects
  hover: {
    scale: 1.5,
    borderColor: '#ff00f7',
    backgroundColor: 'rgba(255, 0, 247, 0.1)',
    innerScale: 2,
    innerColor: '#00f0ff'
  },

  // Click effects
  click: {
    scale: 0.8,
    borderColor: '#00ff88',
    duration: 150
  },

  // Text cursor
  text: {
    width: 3,
    height: 30,
    borderRadius: 2,
    backgroundColor: '#00f0ff'
  },

  // Magnetic effect
  magnetic: {
    enabled: true,
    distance: 100,
    strength: 0.3
  },

  // Interactive elements selectors
  interactiveElements: [
    'a',
    'button',
    '.btn',
    '.nav-link',
    '.nav-cta',
    '.feature-card',
    '.tech-card',
    '.menu-item',
    '.faq-question',
    '.author-link',
    '.social-link',
    '.code-btn',
    '.terminal-btn',
    '.tab',
    '[data-cursor="pointer"]'
  ],

  // Text elements selectors
  textElements: [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="password"]',
    'input[type="number"]',
    'textarea',
    '[contenteditable="true"]',
    '[data-cursor="text"]'
  ],

  // Hidden cursor elements
  hiddenElements: [
    '[data-cursor="none"]',
    'video',
    'iframe'
  ]
};


/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR CLASS
   ═══════════════════════════════════════════════════════════════ */
class CustomCursor {
  constructor(config = CursorConfig) {
    this.config = config;
    
    // Check if should be enabled
    if (!this.shouldEnable()) {
      return;
    }

    // Elements
    this.outer = null;
    this.inner = null;
    this.trails = [];

    // State
    this.mouse = { x: 0, y: 0 };
    this.outerPos = { x: 0, y: 0 };
    this.innerPos = { x: 0, y: 0 };
    this.isVisible = false;
    this.isHovering = false;
    this.isClicking = false;
    this.isText = false;
    this.isHidden = false;
    this.currentTarget = null;

    // Animation
    this.animationId = null;
    this.isRunning = false;

    // Initialize
    this.init();
  }

  shouldEnable() {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return false;
    }

    // Disable on small screens
    if (window.innerWidth < 768) {
      return false;
    }

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    return this.config.enabled;
  }

  init() {
    this.createElements();
    this.bindEvents();
    this.start();
    this.hideDefaultCursor();
  }

  createElements() {
    // Create outer cursor (ring)
    this.outer = document.createElement('div');
    this.outer.className = 'cursor-outer';
    this.outer.id = 'cursorOuter';
    this.setOuterStyles();
    document.body.appendChild(this.outer);

    // Create inner cursor (dot)
    this.inner = document.createElement('div');
    this.inner.className = 'cursor-inner';
    this.inner.id = 'cursorInner';
    this.setInnerStyles();
    document.body.appendChild(this.inner);

    // Create trail elements
    if (this.config.trail.enabled) {
      this.createTrails();
    }
  }

  setOuterStyles() {
    const { outer } = this.config;
    Object.assign(this.outer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${outer.size}px`,
      height: `${outer.size}px`,
      border: `${outer.borderWidth}px solid ${outer.borderColor}`,
      borderRadius: '50%',
      backgroundColor: outer.backgroundColor,
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '0',
      transform: 'translate(-50%, -50%)',
      transition: `
        width 0.3s ease,
        height 0.3s ease,
        border-color 0.3s ease,
        background-color 0.3s ease,
        opacity 0.3s ease,
        border-radius 0.3s ease
      `,
      mixBlendMode: outer.mixBlendMode,
      willChange: 'transform'
    });
  }

  setInnerStyles() {
    const { inner } = this.config;
    Object.assign(this.inner.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${inner.size}px`,
      height: `${inner.size}px`,
      backgroundColor: inner.backgroundColor,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '0',
      transform: 'translate(-50%, -50%)',
      transition: `
        width 0.3s ease,
        height 0.3s ease,
        background-color 0.3s ease,
        opacity 0.3s ease,
        border-radius 0.3s ease
      `,
      willChange: 'transform'
    });
  }

  createTrails() {
    const { trail } = this.config;

    for (let i = 0; i < trail.count; i++) {
      const trailEl = document.createElement('div');
      trailEl.className = 'cursor-trail';
      
      const size = trail.size * (1 - i / trail.count);
      const opacity = 0.5 * (1 - i / trail.count);

      Object.assign(trailEl.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: trail.color,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '9998',
        opacity: '0',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform'
      });

      document.body.appendChild(trailEl);
      
      this.trails.push({
        element: trailEl,
        x: 0,
        y: 0,
        baseOpacity: opacity
      });
    }
  }

  hideDefaultCursor() {
    // Add style to hide default cursor
    const style = document.createElement('style');
    style.id = 'custom-cursor-styles';
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
      
      a, button, [role="button"], input, select, textarea,
      .btn, .nav-link, .feature-card, .tech-card {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // Mouse move
    document.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });

    // Mouse enter/leave document
    document.addEventListener('mouseenter', () => this.show());
    document.addEventListener('mouseleave', () => this.hide());

    // Mouse down/up
    document.addEventListener('mousedown', () => this.onMouseDown());
    document.addEventListener('mouseup', () => this.onMouseUp());

    // Hover effects for interactive elements
    this.bindHoverEvents();

    // Handle window resize
    window.addEventListener('resize', () => {
      if (!this.shouldEnable()) {
        this.destroy();
      }
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  bindHoverEvents() {
    const { interactiveElements, textElements, hiddenElements } = this.config;

    // Interactive elements (buttons, links, etc.)
    document.addEventListener('mouseover', (e) => {
      const target = e.target;

      // Check for hidden cursor elements
      if (this.matchesSelector(target, hiddenElements)) {
        this.setHidden(true);
        return;
      }

      // Check for text input elements
      if (this.matchesSelector(target, textElements)) {
        this.setTextMode(true);
        return;
      }

      // Check for interactive elements
      if (this.matchesSelector(target, interactiveElements)) {
        this.setHover(true, target);
        return;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;

      if (this.matchesSelector(target, hiddenElements)) {
        this.setHidden(false);
      }

      if (this.matchesSelector(target, textElements)) {
        this.setTextMode(false);
      }

      if (this.matchesSelector(target, interactiveElements)) {
        this.setHover(false, null);
      }
    });
  }

  matchesSelector(element, selectors) {
    if (!element || element === document) return false;
    
    return selectors.some(selector => {
      try {
        return element.matches(selector) || element.closest(selector);
      } catch {
        return false;
      }
    });
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    if (!this.isVisible) {
      this.show();
    }

    // Magnetic effect
    if (this.config.magnetic.enabled && this.currentTarget) {
      this.applyMagneticEffect(this.currentTarget);
    }
  }

  onMouseDown() {
    this.isClicking = true;
    this.applyClickEffect();
  }

  onMouseUp() {
    this.isClicking = false;
    this.removeClickEffect();
  }

  show() {
    this.isVisible = true;
    this.outer.style.opacity = '0.5';
    this.inner.style.opacity = '1';
  }

  hide() {
    this.isVisible = false;
    this.outer.style.opacity = '0';
    this.inner.style.opacity = '0';
    
    this.trails.forEach(trail => {
      trail.element.style.opacity = '0';
    });
  }

  setHover(isHovering, target) {
    this.isHovering = isHovering;
    this.currentTarget = target;

    const { outer, hover } = this.config;

    if (isHovering) {
      // Outer cursor
      this.outer.style.width = `${outer.size * hover.scale}px`;
      this.outer.style.height = `${outer.size * hover.scale}px`;
      this.outer.style.borderColor = hover.borderColor;
      this.outer.style.backgroundColor = hover.backgroundColor;
      this.outer.style.opacity = '1';
      this.outer.classList.add('hover');

      // Inner cursor
      this.inner.style.transform = `translate(-50%, -50%) scale(${hover.innerScale})`;
      this.inner.style.backgroundColor = hover.innerColor;
      this.inner.classList.add('hover');
    } else {
      // Reset outer
      this.outer.style.width = `${outer.size}px`;
      this.outer.style.height = `${outer.size}px`;
      this.outer.style.borderColor = outer.borderColor;
      this.outer.style.backgroundColor = outer.backgroundColor;
      this.outer.style.opacity = '0.5';
      this.outer.classList.remove('hover');

      // Reset inner
      this.inner.style.transform = 'translate(-50%, -50%) scale(1)';
      this.inner.style.backgroundColor = this.config.inner.backgroundColor;
      this.inner.classList.remove('hover');
    }
  }

  setTextMode(isText) {
    this.isText = isText;

    const { outer, inner, text } = this.config;

    if (isText) {
      // Transform outer to text cursor
      this.outer.style.width = `${text.width}px`;
      this.outer.style.height = `${text.height}px`;
      this.outer.style.borderRadius = `${text.borderRadius}px`;
      this.outer.style.border = 'none';
      this.outer.style.backgroundColor = text.backgroundColor;
      this.outer.style.opacity = '1';
      this.outer.style.mixBlendMode = 'normal';
      this.outer.classList.add('text');

      // Hide inner
      this.inner.style.opacity = '0';
      this.inner.classList.add('text');
    } else {
      // Reset outer
      this.outer.style.width = `${outer.size}px`;
      this.outer.style.height = `${outer.size}px`;
      this.outer.style.borderRadius = '50%';
      this.outer.style.border = `${outer.borderWidth}px solid ${outer.borderColor}`;
      this.outer.style.backgroundColor = outer.backgroundColor;
      this.outer.style.opacity = '0.5';
      this.outer.style.mixBlendMode = outer.mixBlendMode;
      this.outer.classList.remove('text');

      // Show inner
      this.inner.style.opacity = '1';
      this.inner.classList.remove('text');
    }
  }

  setHidden(isHidden) {
    this.isHidden = isHidden;

    if (isHidden) {
      this.outer.style.opacity = '0';
      this.inner.style.opacity = '0';
    } else {
      this.outer.style.opacity = '0.5';
      this.inner.style.opacity = '1';
    }
  }

  applyClickEffect() {
    const { click } = this.config;

    this.outer.style.transform = `translate(-50%, -50%) scale(${click.scale})`;
    this.outer.style.borderColor = click.borderColor;
    this.outer.classList.add('click');

    this.inner.style.transform = 'translate(-50%, -50%) scale(0.5)';
    this.inner.classList.add('click');

    // Create click ripple
    this.createClickRipple();
  }

  removeClickEffect() {
    const scale = this.isHovering ? this.config.hover.scale : 1;
    const borderColor = this.isHovering ? this.config.hover.borderColor : this.config.outer.borderColor;

    this.outer.style.transform = 'translate(-50%, -50%) scale(1)';
    this.outer.style.borderColor = borderColor;
    this.outer.classList.remove('click');

    const innerScale = this.isHovering ? this.config.hover.innerScale : 1;
    this.inner.style.transform = `translate(-50%, -50%) scale(${innerScale})`;
    this.inner.classList.remove('click');
  }

  createClickRipple() {
    const ripple = document.createElement('div');
    
    Object.assign(ripple.style, {
      position: 'fixed',
      top: `${this.mouse.y}px`,
      left: `${this.mouse.x}px`,
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      border: '2px solid #00ff88',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9997',
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: '1',
      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
    });

    document.body.appendChild(ripple);

    // Trigger animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(5)';
      ripple.style.opacity = '0';
    });

    // Remove after animation
    setTimeout(() => {
      ripple.remove();
    }, 500);
  }

  applyMagneticEffect(target) {
    if (!target) return;

    const { magnetic } = this.config;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = this.mouse.x - centerX;
    const dy = this.mouse.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < magnetic.distance) {
      const force = (magnetic.distance - distance) / magnetic.distance;
      const magnetX = centerX + dx * (1 - force * magnetic.strength);
      const magnetY = centerY + dy * (1 - force * magnetic.strength);

      // Apply slight offset to cursor towards center
      this.mouse.x = this.mouse.x + (magnetX - this.mouse.x) * 0.2;
      this.mouse.y = this.mouse.y + (magnetY - this.mouse.y) * 0.2;
    }
  }

  update() {
    // Smooth follow for outer cursor
    const outerEase = 0.15;
    this.outerPos.x += (this.mouse.x - this.outerPos.x) * outerEase;
    this.outerPos.y += (this.mouse.y - this.outerPos.y) * outerEase;

    // Faster follow for inner cursor
    const innerEase = 0.25;
    this.innerPos.x += (this.mouse.x - this.innerPos.x) * innerEase;
    this.innerPos.y += (this.mouse.y - this.innerPos.y) * innerEase;

    // Apply positions
    this.outer.style.left = `${this.outerPos.x}px`;
    this.outer.style.top = `${this.outerPos.y}px`;

    this.inner.style.left = `${this.innerPos.x}px`;
    this.inner.style.top = `${this.innerPos.y}px`;

    // Update trails
    if (this.config.trail.enabled) {
      this.updateTrails();
    }
  }

  updateTrails() {
    let prevX = this.innerPos.x;
    let prevY = this.innerPos.y;

    this.trails.forEach((trail, index) => {
      const ease = 0.3 - (index * 0.02);
      
      trail.x += (prevX - trail.x) * ease;
      trail.y += (prevY - trail.y) * ease;

      trail.element.style.left = `${trail.x}px`;
      trail.element.style.top = `${trail.y}px`;

      // Show trail only when moving
      const distance = Math.hypot(this.mouse.x - this.innerPos.x, this.mouse.y - this.innerPos.y);
      const opacity = distance > 2 ? trail.baseOpacity : 0;
      trail.element.style.opacity = this.isVisible && !this.isHidden ? opacity : 0;

      prevX = trail.x;
      prevY = trail.y;
    });
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();

    // Remove elements
    if (this.outer) this.outer.remove();
    if (this.inner) this.inner.remove();
    this.trails.forEach(trail => trail.element.remove());

    // Remove custom cursor styles
    const style = document.getElementById('custom-cursor-styles');
    if (style) style.remove();

    // Show default cursor
    document.body.style.cursor = 'auto';
  }

  // Public API
  setColor(outerColor, innerColor) {
    if (outerColor) {
      this.config.outer.borderColor = outerColor;
      this.outer.style.borderColor = outerColor;
    }
    if (innerColor) {
      this.config.inner.backgroundColor = innerColor;
      this.inner.style.backgroundColor = innerColor;
    }
  }

  setSize(outerSize, innerSize) {
    if (outerSize) {
      this.config.outer.size = outerSize;
      this.outer.style.width = `${outerSize}px`;
      this.outer.style.height = `${outerSize}px`;
    }
    if (innerSize) {
      this.config.inner.size = innerSize;
      this.inner.style.width = `${innerSize}px`;
      this.inner.style.height = `${innerSize}px`;
    }
  }

  addInteractiveElements(selectors) {
    if (Array.isArray(selectors)) {
      this.config.interactiveElements.push(...selectors);
    } else {
      this.config.interactiveElements.push(selectors);
    }
  }
}


/* ═══════════════════════════════════════════════════════════════
   CURSOR EFFECTS - ADDITIONAL ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
class CursorEffects {
  static createSparkle(x, y, color = '#00f0ff') {
    const sparkle = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 50 + 30;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    Object.assign(sparkle.style, {
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9996',
      boxShadow: `0 0 ${size}px ${color}`,
      transform: 'translate(-50%, -50%)'
    });

    document.body.appendChild(sparkle);

    let opacity = 1;
    let posX = x;
    let posY = y;

    const animate = () => {
      posX += vx * 0.02;
      posY += vy * 0.02 + 1; // Add gravity
      opacity -= 0.03;

      sparkle.style.left = `${posX}px`;
      sparkle.style.top = `${posY}px`;
      sparkle.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        sparkle.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  static createBurst(x, y, count = 12, color = '#ff00f7') {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createSparkle(x, y, color);
      }, i * 20);
    }
  }

  static createTrail(x, y, color = '#8b5cf6') {
    const trail = document.createElement('div');
    const size = Math.random() * 6 + 2;

    Object.assign(trail.style, {
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9995',
      opacity: '0.6',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    });

    document.body.appendChild(trail);

    requestAnimationFrame(() => {
      trail.style.opacity = '0';
      trail.style.transform = 'translate(-50%, -50%) scale(0)';
    });

    setTimeout(() => {
      trail.remove();
    }, 500);
  }

  static createRing(x, y, color = '#00f0ff') {
    const ring = document.createElement('div');

    Object.assign(ring.style, {
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      width: '20px',
      height: '20px',
      border: `2px solid ${color}`,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9996',
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
    });

    document.body.appendChild(ring);

    requestAnimationFrame(() => {
      ring.style.transform = 'translate(-50%, -50%) scale(3)';
      ring.style.opacity = '0';
    });

    setTimeout(() => {
      ring.remove();
    }, 600);
  }

  static createMagneticPull(element, cursorX, cursorY, strength = 0.3) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = cursorX - centerX;
    const dy = cursorY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = Math.max(rect.width, rect.height);

    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const moveX = dx * force * strength;
      const moveY = dy * force * strength;

      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    } else {
      element.style.transform = '';
    }
  }
}


/* ═══════════════════════════════════════════════════════════════
   CURSOR THEMES
   ═══════════════════════════════════════════════════════════════ */
const CursorThemes = {
  default: {
    outer: { borderColor: '#00f0ff', size: 40 },
    inner: { backgroundColor: '#ff00f7', size: 8 },
    hover: { borderColor: '#ff00f7', innerColor: '#00f0ff' }
  },

  neon: {
    outer: { borderColor: '#00ff88', size: 45 },
    inner: { backgroundColor: '#ff00f7', size: 10 },
    hover: { borderColor: '#fbbf24', innerColor: '#00ff88' }
  },

  minimal: {
    outer: { borderColor: '#ffffff', size: 30 },
    inner: { backgroundColor: '#ffffff', size: 5 },
    hover: { borderColor: '#00f0ff', innerColor: '#00f0ff' }
  },

  cyberpunk: {
    outer: { borderColor: '#ff00f7', size: 50 },
    inner: { backgroundColor: '#00f0ff', size: 12 },
    hover: { borderColor: '#fbbf24', innerColor: '#ff00f7' }
  },

  aurora: {
    outer: { borderColor: '#8b5cf6', size: 40 },
    inner: { backgroundColor: '#00f0ff', size: 8 },
    hover: { borderColor: '#00ff88', innerColor: '#ff00f7' }
  }
};


/* ═══════════════════════════════════════════════════════════════
   MAGNETIC ELEMENTS
   ═══════════════════════════════════════════════════════════════ */
class MagneticElements {
  constructor(selector = '[data-magnetic]') {
    this.elements = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.elements.forEach(element => {
      element.addEventListener('mousemove', (e) => this.onMouseMove(e, element));
      element.addEventListener('mouseleave', () => this.onMouseLeave(element));
    });
  }

  onMouseMove(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const strength = parseFloat(element.dataset.magneticStrength) || 0.3;

    element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    element.style.transition = 'transform 0.1s ease-out';
  }

  onMouseLeave(element) {
    element.style.transform = '';
    element.style.transition = 'transform 0.3s ease-out';
  }
}


/* ═══════════════════════════════════════════════════════════════
   TILT EFFECT FOR CARDS
   ═══════════════════════════════════════════════════════════════ */
class TiltEffect {
  constructor(selector = '[data-tilt]') {
    this.elements = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.elements.forEach(element => {
      element.addEventListener('mousemove', (e) => this.onMouseMove(e, element));
      element.addEventListener('mouseleave', () => this.onMouseLeave(element));
    });
  }

  onMouseMove(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const maxTilt = parseFloat(element.dataset.tiltMax) || 10;

    element.style.transform = `
      perspective(1000px)
      rotateX(${Math.max(-maxTilt, Math.min(maxTilt, rotateX))}deg)
      rotateY(${Math.max(-maxTilt, Math.min(maxTilt, rotateY))}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
    element.style.transition = 'transform 0.1s ease-out';
  }

  onMouseLeave(element) {
    element.style.transform = '';
    element.style.transition = 'transform 0.3s ease-out';
  }
}


/* ═══════════════════════════════════════════════════════════════
   AUTO INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
let customCursor = null;
let magneticElements = null;
let tiltEffect = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize custom cursor
  customCursor = new CustomCursor(CursorConfig);

  // Initialize magnetic elements
  magneticElements = new MagneticElements('[data-magnetic]');

  // Initialize tilt effect for cards
  // Uncomment if you want tilt effect on cards
  // tiltEffect = new TiltEffect('.feature-card, .tech-card');

  // Add click sparkle effect
  document.addEventListener('click', (e) => {
    if (customCursor && customCursor.isRunning) {
      CursorEffects.createRing(e.clientX, e.clientY);
    }
  });
});


/* ═══════════════════════════════════════════════════════════════
   EXPORT FOR GLOBAL ACCESS
   ═══════════════════════════════════════════════════════════════ */
window.CustomCursor = CustomCursor;
window.CursorEffects = CursorEffects;
window.CursorThemes = CursorThemes;
window.MagneticElements = MagneticElements;
window.TiltEffect = TiltEffect;
window.customCursor = customCursor;