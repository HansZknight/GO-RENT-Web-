/*
 * ═══════════════════════════════════════════════════════════════
 * GO-RENT - Particle Effects System
 * Version: 1.0.0
 * Author: Hans / Sirhan Muzaffar
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   PARTICLE SYSTEM CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const ParticleConfig = {
  // Canvas settings
  canvas: {
    id: 'particlesCanvas',
    backgroundColor: 'transparent'
  },

  // Particle settings
  particles: {
    count: 80,
    minSize: 1,
    maxSize: 3,
    minSpeed: 0.1,
    maxSpeed: 0.5,
    colors: [
      'rgba(0, 240, 255, 0.8)',   // Cyan
      'rgba(255, 0, 247, 0.8)',   // Pink
      'rgba(139, 92, 246, 0.8)',  // Purple
      'rgba(0, 255, 136, 0.8)',   // Green
      'rgba(251, 191, 36, 0.6)'   // Yellow
    ],
    shape: 'circle', // circle, square, triangle, star
    glow: true,
    glowIntensity: 10
  },

  // Connection lines
  connections: {
    enabled: true,
    distance: 150,
    lineWidth: 0.5,
    opacity: 0.15,
    color: '0, 240, 255' // RGB format
  },

  // Mouse interaction
  mouse: {
    enabled: true,
    radius: 150,
    attraction: 0.02,
    repulsion: true,
    repulsionStrength: 0.5
  },

  // Animation
  animation: {
    enabled: true,
    fps: 60,
    pauseOnBlur: true
  },

  // Responsive
  responsive: {
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024
    },
    particleMultiplier: {
      mobile: 0.4,
      tablet: 0.6,
      desktop: 1
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   PARTICLE CLASS
   ═══════════════════════════════════════════════════════════════ */
class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.reset();
  }

  reset() {
    const { particles } = this.config;

    // Position
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;

    // Size
    this.size = Math.random() * (particles.maxSize - particles.minSize) + particles.minSize;
    this.baseSize = this.size;

    // Velocity
    const speed = Math.random() * (particles.maxSpeed - particles.minSpeed) + particles.minSpeed;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Color
    this.color = particles.colors[Math.floor(Math.random() * particles.colors.length)];

    // Opacity
    this.opacity = Math.random() * 0.5 + 0.3;
    this.baseOpacity = this.opacity;

    // Pulse animation
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulsePhase = Math.random() * Math.PI * 2;

    // Life (for respawning effects)
    this.life = 1;
    this.decay = Math.random() * 0.0005 + 0.0001;
  }

  update(mouse, deltaTime) {
    // Apply velocity
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Pulse effect
    this.pulsePhase += this.pulseSpeed * deltaTime;
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
    this.size = this.baseSize * pulse;
    this.opacity = this.baseOpacity * (0.7 + pulse * 0.3);

    // Mouse interaction
    if (this.config.mouse.enabled && mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.mouse.radius) {
        const force = (this.config.mouse.radius - distance) / this.config.mouse.radius;
        
        if (this.config.mouse.repulsion) {
          // Repulsion
          this.vx -= (dx / distance) * force * this.config.mouse.repulsionStrength;
          this.vy -= (dy / distance) * force * this.config.mouse.repulsionStrength;
        } else {
          // Attraction
          this.vx += (dx / distance) * force * this.config.mouse.attraction;
          this.vy += (dy / distance) * force * this.config.mouse.attraction;
        }

        // Grow when near mouse
        this.size = this.baseSize * (1 + force * 0.5);
        this.opacity = Math.min(1, this.baseOpacity * (1 + force));
      }
    }

    // Apply friction
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Boundary check with wrapping
    if (this.x < -this.size) this.x = this.canvas.width + this.size;
    if (this.x > this.canvas.width + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = this.canvas.height + this.size;
    if (this.y > this.canvas.height + this.size) this.y = -this.size;

    // Life decay (optional)
    // this.life -= this.decay * deltaTime;
    // if (this.life <= 0) this.reset();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Glow effect
    if (this.config.particles.glow) {
      ctx.shadowBlur = this.config.particles.glowIntensity;
      ctx.shadowColor = this.color;
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();

    switch (this.config.particles.shape) {
      case 'square':
        ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        break;

      case 'triangle':
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.closePath();
        break;

      case 'star':
        this.drawStar(ctx, this.x, this.y, 5, this.size, this.size / 2);
        break;

      case 'circle':
      default:
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        break;
    }

    ctx.fill();
    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rotation = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rotation) * outerRadius;
      y = cy + Math.sin(rotation) * outerRadius;
      ctx.lineTo(x, y);
      rotation += step;

      x = cx + Math.cos(rotation) * innerRadius;
      y = cy + Math.sin(rotation) * innerRadius;
      ctx.lineTo(x, y);
      rotation += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}


/* ═══════════════════════════════════════════════════════════════
   PARTICLE SYSTEM CLASS
   ═══════════════════════════════════════════════════════════════ */
class ParticleSystem {
  constructor(config = ParticleConfig) {
    this.config = config;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.isRunning = false;
    this.lastTime = 0;
    this.deltaTime = 0;

    this.init();
  }

  init() {
    // Get canvas
    this.canvas = document.getElementById(this.config.canvas.id);
    if (!this.canvas) {
      console.warn('Particle canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resize();

    // Create particles
    this.createParticles();

    // Bind events
    this.bindEvents();

    // Start animation
    this.start();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);

    // Store actual dimensions
    this.width = rect.width;
    this.height = rect.height;
  }

  getParticleCount() {
    const { responsive, particles } = this.config;
    let multiplier = 1;

    if (window.innerWidth <= responsive.breakpoints.mobile) {
      multiplier = responsive.particleMultiplier.mobile;
    } else if (window.innerWidth <= responsive.breakpoints.tablet) {
      multiplier = responsive.particleMultiplier.tablet;
    } else {
      multiplier = responsive.particleMultiplier.desktop;
    }

    return Math.floor(particles.count * multiplier);
  }

  createParticles() {
    this.particles = [];
    const count = this.getParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        { width: this.width, height: this.height },
        this.config
      ));
    }
  }

  bindEvents() {
    // Mouse move
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    // Mouse leave
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
      }
    });

    window.addEventListener('touchend', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Resize
    window.addEventListener('resize', this.debounce(() => {
      this.resize();
      this.createParticles();
    }, 250));

    // Visibility change
    if (this.config.animation.pauseOnBlur) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  update(timestamp) {
    // Calculate delta time
    this.deltaTime = (timestamp - this.lastTime) / (1000 / 60);
    this.lastTime = timestamp;

    // Clamp delta time to prevent large jumps
    this.deltaTime = Math.min(this.deltaTime, 3);

    // Update particles
    for (const particle of this.particles) {
      particle.update(this.mouse, this.deltaTime);
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connections
    if (this.config.connections.enabled) {
      this.drawConnections();
    }

    // Draw particles
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }

  drawConnections() {
    const { connections } = this.config;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connections.distance) {
          const opacity = (1 - distance / connections.distance) * connections.opacity;

          this.ctx.save();
          this.ctx.globalAlpha = opacity;
          this.ctx.strokeStyle = `rgba(${connections.color}, ${opacity})`;
          this.ctx.lineWidth = connections.lineWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }

    // Draw connections to mouse
    if (this.mouse.x !== null && this.config.mouse.enabled) {
      for (const particle of this.particles) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.mouse.radius) {
          const opacity = (1 - distance / this.config.mouse.radius) * 0.3;

          this.ctx.save();
          this.ctx.globalAlpha = opacity;
          this.ctx.strokeStyle = `rgba(255, 0, 247, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  animate(timestamp) {
    if (!this.isRunning) return;

    this.update(timestamp);
    this.draw();

    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate(this.lastTime);
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
    this.particles = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  // Public methods for interaction
  addParticle(x, y) {
    const particle = new Particle(
      { width: this.width, height: this.height },
      this.config
    );
    particle.x = x;
    particle.y = y;
    this.particles.push(particle);

    // Remove oldest particle if exceeding limit
    if (this.particles.length > this.config.particles.count * 1.5) {
      this.particles.shift();
    }
  }

  explode(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = new Particle(
        { width: this.width, height: this.height },
        this.config
      );
      particle.x = x;
      particle.y = y;

      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 3 + 2;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 1;
      particle.decay = 0.02;

      this.particles.push(particle);
    }
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.createParticles();
  }
}


/* ═══════════════════════════════════════════════════════════════
   FLOATING PARTICLES (Simpler Alternative)
   ═══════════════════════════════════════════════════════════════ */
class FloatingParticles {
  constructor(canvasId = 'particlesCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.isRunning = false;

    this.colors = [
      '#00f0ff',
      '#ff00f7',
      '#8b5cf6',
      '#00ff88'
    ];

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.start();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  update() {
    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      // Boundary wrap
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Mouse repulsion
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    }

    // Draw connections
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 120)})`;
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }
}


/* ═══════════════════════════════════════════════════════════════
   GEOMETRIC PARTICLES (Alternative Style)
   ═══════════════════════════════════════════════════════════════ */
class GeometricParticles {
  constructor(canvasId = 'particlesCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.shapes = [];
    this.isRunning = false;
    this.time = 0;

    this.init();
  }

  init() {
    this.resize();
    this.createShapes();
    this.bindEvents();
    this.start();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createShapes() {
    const count = 30;
    this.shapes = [];

    const shapeTypes = ['circle', 'square', 'triangle', 'hexagon'];

    for (let i = 0; i < count; i++) {
      this.shapes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.1 + 0.05,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: `hsl(${180 + Math.random() * 60}, 100%, 50%)`
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createShapes();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  drawShape(shape) {
    this.ctx.save();
    this.ctx.translate(shape.x, shape.y);
    this.ctx.rotate(shape.rotation);
    this.ctx.globalAlpha = shape.opacity;
    this.ctx.strokeStyle = shape.color;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();

    switch (shape.type) {
      case 'circle':
        this.ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
        break;

      case 'square':
        const half = shape.size / 2;
        this.ctx.rect(-half, -half, shape.size, shape.size);
        break;

      case 'triangle':
        const h = shape.size * Math.sqrt(3) / 2;
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(-shape.size / 2, h / 2);
        this.ctx.lineTo(shape.size / 2, h / 2);
        this.ctx.closePath();
        break;

      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * shape.size / 2;
          const y = Math.sin(angle) * shape.size / 2;
          if (i === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.closePath();
        break;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  update() {
    this.time += 0.01;

    for (const shape of this.shapes) {
      shape.x += shape.speedX;
      shape.y += shape.speedY;
      shape.rotation += shape.rotationSpeed;

      // Float effect
      shape.y += Math.sin(this.time + shape.x * 0.01) * 0.2;

      // Boundary wrap
      if (shape.x < -shape.size) shape.x = this.canvas.width + shape.size;
      if (shape.x > this.canvas.width + shape.size) shape.x = -shape.size;
      if (shape.y < -shape.size) shape.y = this.canvas.height + shape.size;
      if (shape.y > this.canvas.height + shape.size) shape.y = -shape.size;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const shape of this.shapes) {
      this.drawShape(shape);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }
}


/* ═══════════════════════════════════════════════════════════════
   CONSTELLATION PARTICLES (Star-like)
   ═══════════════════════════════════════════════════════════════ */
class ConstellationParticles {
  constructor(canvasId = 'particlesCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.isRunning = false;
    this.lastShootingStar = 0;

    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.bindEvents();
    this.start();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars() {
    const count = Math.floor(window.innerWidth / 8);
    this.stars = [];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  createShootingStar() {
    const now = Date.now();
    if (now - this.lastShootingStar < 3000) return;

    this.lastShootingStar = now;

    this.shootingStars.push({
      x: Math.random() * this.canvas.width,
      y: 0,
      length: Math.random() * 80 + 50,
      speed: Math.random() * 10 + 8,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: 1
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createStars();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  update() {
    // Update star twinkle
    for (const star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
    }

    // Random shooting star
    if (Math.random() < 0.005) {
      this.createShootingStar();
    }

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.02;

      if (ss.opacity <= 0 || ss.x > this.canvas.width || ss.y > this.canvas.height) {
        this.shootingStars.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars
    for (const star of this.stars) {
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
      this.ctx.fill();

      // Glow
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 240, 255, ${star.opacity * twinkle * 0.1})`;
      this.ctx.fill();
    }

    // Draw connections between nearby stars
    for (let i = 0; i < this.stars.length; i++) {
      for (let j = i + 1; j < this.stars.length; j++) {
        const s1 = this.stars[i];
        const s2 = this.stars[j];
        const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);

        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(s1.x, s1.y);
          this.ctx.lineTo(s2.x, s2.y);
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.05 * (1 - dist / 100)})`;
          this.ctx.stroke();
        }
      }
    }

    // Draw shooting stars
    for (const ss of this.shootingStars) {
      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const gradient = this.ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(ss.x, ss.y);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }
}


/* ═══════════════════════════════════════════════════════════════
   AUTO INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
let particleSystem = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // Initialize default particle system
    // You can switch between different particle types:
    
    // Option 1: Full-featured particle system
    // particleSystem = new ParticleSystem(ParticleConfig);
    
    // Option 2: Simple floating particles (recommended for performance)
    particleSystem = new FloatingParticles('particlesCanvas');
    
    // Option 3: Geometric shapes
    // particleSystem = new GeometricParticles('particlesCanvas');
    
    // Option 4: Star constellation
    // particleSystem = new ConstellationParticles('particlesCanvas');
  }
});


/* ═══════════════════════════════════════════════════════════════
   EXPORT FOR GLOBAL ACCESS
   ═══════════════════════════════════════════════════════════════ */
window.ParticleSystem = ParticleSystem;
window.FloatingParticles = FloatingParticles;
window.GeometricParticles = GeometricParticles;
window.ConstellationParticles = ConstellationParticles;
window.particleSystem = particleSystem;