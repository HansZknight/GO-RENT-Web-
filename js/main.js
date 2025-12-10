/*
 * ═══════════════════════════════════════════════════════════════
 * GO-RENT - Main JavaScript
 * Version: 1.0.0
 * Author: Hans / Sirhan Muzaffar
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const CONFIG = {
  preloaderDelay: 2500,
  scrollOffset: 80,
  animationThreshold: 0.1,
  toastDuration: 4000,
  counterDuration: 2000,
  typingSpeed: 50,
  debounceDelay: 100
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */
const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format number with dots
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  // Get element by selector
  $(selector) {
    return document.querySelector(selector);
  },

  // Get all elements by selector
  $$(selector) {
    return document.querySelectorAll(selector);
  },

  // Check if element is in viewport
  isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight - offset) &&
      rect.bottom >= offset
    );
  },

  // Smooth scroll to element
  scrollTo(target, offset = CONFIG.scrollOffset) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  },

  // Get current date formatted
  getCurrentDate() {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Generate unique ID
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  },

  // Local storage helpers
  storage: {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   PRELOADER
   ═══════════════════════════════════════════════════════════════ */
const Preloader = {
  element: null,

  init() {
    this.element = Utils.$('#preloader');
    if (!this.element) return;

    window.addEventListener('load', () => {
      this.hide();
    });

    // Fallback - hide after max time
    setTimeout(() => {
      this.hide();
    }, CONFIG.preloaderDelay + 1000);
  },

  hide() {
    setTimeout(() => {
      if (this.element) {
        this.element.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Remove from DOM after animation
        setTimeout(() => {
          this.element.remove();
        }, 800);
      }
    }, CONFIG.preloaderDelay);
  },

  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
const Navigation = {
  navbar: null,
  navLinks: null,
  navToggle: null,
  links: null,
  isOpen: false,
  lastScrollY: 0,

  init() {
    this.navbar = Utils.$('#navbar');
    this.navLinks = Utils.$('#navLinks');
    this.navToggle = Utils.$('#navToggle');
    this.links = Utils.$$('.nav-link');

    if (!this.navbar) return;

    this.bindEvents();
    this.handleScroll();
    this.setActiveLink();
  },

  bindEvents() {
    // Toggle mobile menu
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu on link click
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          this.closeMenu();
          Utils.scrollTo(href);
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.navLinks.contains(e.target) && !this.navToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Handle scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
      this.setActiveLink();
    }, 100));

    // Handle resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 1023 && this.isOpen) {
        this.closeMenu();
      }
    }, 150));

    // Close menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
  },

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.navLinks.classList.toggle('active', this.isOpen);
    this.navToggle.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  },

  closeMenu() {
    this.isOpen = false;
    this.navLinks.classList.remove('active');
    this.navToggle.classList.remove('active');
    document.body.style.overflow = '';
  },

  handleScroll() {
    const scrollY = window.scrollY;
    
    // Add/remove scrolled class
    if (scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }

    // Hide/show on scroll direction (optional)
    // if (scrollY > this.lastScrollY && scrollY > 200) {
    //   this.navbar.style.transform = 'translateY(-100%)';
    // } else {
    //   this.navbar.style.transform = 'translateY(0)';
    // }
    
    this.lastScrollY = scrollY;
  },

  setActiveLink() {
    const sections = Utils.$$('section[id]');
    const scrollY = window.scrollY + CONFIG.scrollOffset + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        this.links.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
};


/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgress = {
  element: null,

  init() {
    this.element = Utils.$('#scrollProgress');
    if (!this.element) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      this.update();
    }, 10));
  },

  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    this.element.style.width = `${scrollPercent}%`;
  }
};


/* ═══════════════════════════════════════════════════════════════
   SCROLL TO TOP BUTTON
   ═══════════════════════════════════════════════════════════════ */
const ScrollToTop = {
  button: null,

  init() {
    this.button = Utils.$('#scrollTop');
    if (!this.button) return;

    this.bindEvents();
  },

  bindEvents() {
    // Show/hide button on scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 500) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, 100));

    // Scroll to top on click
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};


/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
const Toast = {
  container: null,

  init() {
    this.container = Utils.$('#toastContainer');
    if (!this.container) {
      this.createContainer();
    }
  },

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toastContainer';
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = CONFIG.toastDuration) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    this.container.appendChild(toast);

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.hide(toast);
    });

    // Auto hide
    setTimeout(() => {
      this.hide(toast);
    }, duration);

    return toast;
  },

  hide(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  },

  success(message) {
    return this.show(message, 'success');
  },

  error(message) {
    return this.show(message, 'error');
  },

  warning(message) {
    return this.show(message, 'warning');
  },

  info(message) {
    return this.show(message, 'info');
  }
};


/* ═══════════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ═══════════════════════════════════════════════════════════════ */
const Counter = {
  elements: null,
  observed: new Set(),

  init() {
    this.elements = Utils.$$('[data-count]');
    if (!this.elements.length) return;

    this.setupObserver();
  },

  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.observed.has(entry.target)) {
          this.observed.add(entry.target);
          this.animate(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.elements.forEach(el => observer.observe(el));
  },

  animate(element) {
    const target = parseInt(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = CONFIG.counterDuration;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, stepDuration);
  }
};


/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
const ScrollReveal = {
  elements: null,

  init() {
    this.elements = Utils.$$('[data-aos]');
    if (!this.elements.length) return;

    this.setupObserver();
  },

  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.aosDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
        }
      });
    }, { 
      threshold: CONFIG.animationThreshold,
      rootMargin: '0px 0px -50px 0px'
    });

    this.elements.forEach(el => {
      // Add initial class based on animation type
      const animation = el.dataset.aos;
      el.classList.add(animation);
      observer.observe(el);
    });
  }
};


/* ═══════════════════════════════════════════════════════════════
   DEMO TERMINAL INTERACTIONS
   ═══════════════════════════════════════════════════════════════ */
const DemoTerminal = {
  menuItems: null,
  tabs: null,
  tabContents: null,
  historyList: null,
  historyCount: null,
  transactions: [],

  init() {
    this.menuItems = Utils.$$('.menu-item');
    this.tabs = Utils.$$('.terminal-tabs .tab');
    this.tabContents = Utils.$$('.tab-content');
    this.historyList = Utils.$('#historyList');
    this.historyCount = Utils.$('#historyCount');

    if (!this.menuItems.length) return;

    this.bindEvents();
    this.loadTransactions();
  },

  bindEvents() {
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // Menu input handling
    const menuInput = Utils.$('#menuInput');
    if (menuInput) {
      menuInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const value = parseInt(menuInput.value);
          if (value >= 1 && value <= 5) {
            this.selectMenuItem(value);
          }
          menuInput.value = '';
        }
      });
    }
  },

  switchTab(tabId) {
    // Update tabs
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update content
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    });
  },

  selectMenuItem(menuNumber) {
    // Visual feedback
    this.menuItems.forEach((item, index) => {
      item.classList.toggle('selected', index + 1 === menuNumber);
    });

    // Handle menu actions
    switch (menuNumber) {
      case 1:
        Toast.info('Menu Sewa Mobil dipilih');
        Utils.scrollTo('#calculator');
        break;
      case 2:
        Toast.info('Menu Sewa Motor dipilih');
        Utils.scrollTo('#calculator');
        break;
      case 3:
        this.switchTab('stock');
        Toast.info('Menampilkan stok kendaraan');
        break;
      case 4:
        this.switchTab('history');
        Toast.info('Menampilkan riwayat transaksi');
        break;
      case 5:
        Toast.warning('Terima kasih telah menggunakan GO-RENT!');
        break;
    }

    // Reset selection after delay
    setTimeout(() => {
      this.menuItems.forEach(item => item.classList.remove('selected'));
    }, 2000);
  },

  loadTransactions() {
    this.transactions = Utils.storage.get('gorent_transactions') || [];
    this.updateHistoryDisplay();
  },

  addTransaction(transaction) {
    this.transactions.unshift({
      id: Utils.generateId(),
      ...transaction,
      date: new Date().toISOString()
    });

    // Keep only last 100 transactions
    if (this.transactions.length > 100) {
      this.transactions = this.transactions.slice(0, 100);
    }

    Utils.storage.set('gorent_transactions', this.transactions);
    this.updateHistoryDisplay();
  },

  updateHistoryDisplay() {
    if (this.historyCount) {
      this.historyCount.textContent = `${this.transactions.length} RECORDS`;
    }

    if (this.historyList) {
      if (this.transactions.length === 0) {
        this.historyList.innerHTML = `
          <div class="history-empty">
            <span class="empty-icon">📭</span>
            <span class="empty-text">Belum ada transaksi</span>
          </div>
        `;
      } else {
        this.historyList.innerHTML = this.transactions.slice(0, 10).map(t => `
          <div class="history-item">
            <div class="history-info">
              <strong>${t.customerName}</strong> - ${t.vehicleName}
            </div>
            <div class="history-detail">
              ${t.days} hari • ${Utils.formatCurrency(t.total)}
            </div>
            <div class="history-date">
              ${new Date(t.date).toLocaleDateString('id-ID')}
            </div>
          </div>
        `).join('');
      }
    }
  },

  updateStock(vehicle, change) {
    const stockElement = Utils.$(`#stock${vehicle}`);
    if (stockElement) {
      const [current, total] = stockElement.textContent.split('/').map(Number);
      const newCurrent = Math.max(0, Math.min(total, current + change));
      stockElement.textContent = `${newCurrent}/${total}`;

      // Update progress bar
      const stockItem = stockElement.closest('.stock-item');
      if (stockItem) {
        const fill = stockItem.querySelector('.stock-fill');
        fill.style.setProperty('--stock', `${(newCurrent / total) * 100}%`);
      }
    }
  }
};

// Global function for menu clicks
window.handleMenuClick = function(menuNumber) {
  DemoTerminal.selectMenuItem(menuNumber);
};


/* ═══════════════════════════════════════════════════════════════
   FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */
const FAQ = {
  items: null,

  init() {
    this.items = Utils.$$('.faq-item');
    if (!this.items.length) return;

    // Close all by default
    // this.items.forEach(item => item.classList.remove('active'));
  }
};

// Global function for FAQ toggle
window.toggleFaq = function(button) {
  const faqItem = button.closest('.faq-item');
  const isActive = faqItem.classList.contains('active');

  // Close all other items
  Utils.$$('.faq-item').forEach(item => {
    item.classList.remove('active');
  });

  // Toggle current item
  if (!isActive) {
    faqItem.classList.add('active');
  }
};


/* ═══════════════════════════════════════════════════════════════
   CODE COPY FUNCTIONALITY
   ═══════════════════════════════════════════════════════════════ */
const CodeCopy = {
  init() {
    // Already handled via onclick
  }
};

// Global function for code copy
window.copyCode = function(button, type) {
  let code = '';

  if (type === 'install') {
    code = `# Clone repository
git clone https://github.com/HansZknight/GO-RENT.git

# Navigate to directory
cd GO-RENT

# Compile Java file
javac TBPDDPUAS.java

# Run the application
java TBPDDPUAS`;
  } else if (type === 'java') {
    code = `import java.util.Scanner;

public class TBPDDPUAS {
  // Data kendaraan
  static String[] mobil = {"Avanza", "Innova"};
  static int[] hargaMobil = {350000, 500000};
  static int[] stokMobil = {5, 3};

  public static void main(String[] args) {
    Scanner input = new Scanner(System.in);
    showMenu();
  }
}`;
  }

  navigator.clipboard.writeText(code).then(() => {
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Copied!</span>';
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('copied');
    }, 2000);

    Toast.success('Code copied to clipboard!');
  }).catch(() => {
    Toast.error('Failed to copy code');
  });
};


/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════════ */
const KeyboardShortcuts = {
  modal: null,
  hint: null,
  isModalOpen: false,

  init() {
    this.modal = Utils.$('#shortcutsModal');
    this.hint = Utils.$('#keyboardHint');

    this.bindEvents();
    this.showHint();
  },

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.matches('input, textarea, select')) return;

      switch (e.key.toLowerCase()) {
        case '?':
          this.toggleModal();
          break;
        case 'escape':
          this.closeModal();
          break;
        case 'h':
          Utils.scrollTo('#home');
          break;
        case 'f':
          Utils.scrollTo('#features');
          break;
        case 'd':
          Utils.scrollTo('#demo');
          break;
        case 'c':
          Utils.scrollTo('#calculator');
          break;
        case 'g':
          window.open('https://github.com/HansZknight/GO-RENT-Sewa-Kendaraan-Sederhana-', '_blank');
          break;
        case 'arrowup':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
      }
    });

    // Close modal on overlay click
    if (this.modal) {
      this.modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
        this.closeModal();
      });
    }
  },

  showHint() {
    if (this.hint && window.innerWidth > 768) {
      setTimeout(() => {
        this.hint.classList.add('visible');

        // Hide after 5 seconds
        setTimeout(() => {
          this.hint.classList.remove('visible');
        }, 5000);
      }, 3000);
    }
  },

  toggleModal() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  },

  openModal() {
    if (this.modal) {
      this.modal.classList.add('active');
      this.isModalOpen = true;
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.isModalOpen = false;
      document.body.style.overflow = '';
    }
  }
};

// Global function
window.closeShortcutsModal = function() {
  KeyboardShortcuts.closeModal();
};


/* ═══════════════════════════════════════════════════════════════
   DOWNLOAD HTML FUNCTIONALITY
   ═══════════════════════════════════════════════════════════════ */
const Download = {
  button: null,

  init() {
    this.button = Utils.$('#downloadBtn');
    if (!this.button) return;

    this.button.addEventListener('click', () => {
      this.downloadHTML();
    });
  },

  downloadHTML() {
    try {
      const html = document.documentElement.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GO-RENT_Website.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      Toast.success('HTML file downloaded successfully!');
    } catch (error) {
      Toast.error('Failed to download file');
      console.error('Download error:', error);
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD GLOW EFFECT
   ═══════════════════════════════════════════════════════════════ */
const CardGlow = {
  cards: null,

  init() {
    this.cards = Utils.$$('.feature-card');
    if (!this.cards.length) return;

    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }
};


/* ═══════════════════════════════════════════════════════════════
   TERMINAL TYPING EFFECT
   ═══════════════════════════════════════════════════════════════ */
const TerminalTyping = {
  init() {
    const typingElements = Utils.$$('.typing');
    
    typingElements.forEach(el => {
      const text = el.dataset.text;
      if (text) {
        el.textContent = '';
        this.typeText(el, text);
      }
    });
  },

  typeText(element, text, index = 0) {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      setTimeout(() => {
        this.typeText(element, text, index + 1);
      }, CONFIG.typingSpeed);
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
   ═══════════════════════════════════════════════════════════════ */
const SmoothScroll = {
  init() {
    Utils.$$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        Utils.scrollTo(href);
      });
    });
  }
};


/* ═══════════════════════════════════════════════════════════════
   BUTTON RIPPLE EFFECT
   ═══════════════════════════════════════════════════════════════ */
const RippleEffect = {
  init() {
    Utils.$$('.btn').forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRipple(e, button);
      });
    });
  },

  createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
};


/* ═══════════════════════════════════════════════════════════════
   LAZY LOADING IMAGES (if needed)
   ═══════════════════════════════════════════════════════════════ */
const LazyLoad = {
  init() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading support
      Utils.$$('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else {
      // Fallback with Intersection Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });

      Utils.$$('img[data-src]').forEach(img => observer.observe(img));
    }
  }
};


/* ═══════════════════════════════════════════════════════════════
   CONSOLE EASTER EGG
   ═══════════════════════════════════════════════════════════════ */
const ConsoleEasterEgg = {
  init() {
    const styles = [
      'color: #00f0ff',
      'font-size: 14px',
      'font-family: monospace',
      'font-weight: bold'
    ].join(';');

    console.log('%c╔═══════════════════════════════════════╗', styles);
    console.log('%c║           🚗 GO-RENT v1.0 🏍️           ║', styles);
    console.log('%c║   Rental Kendaraan Modern - Java CLI  ║', styles);
    console.log('%c╠═══════════════════════════════════════╣', styles);
    console.log('%c║  Made with ❤️  by Hans / HansZknight   ║', styles);
    console.log('%c║  GitHub: github.com/HansZknight       ║', styles);
    console.log('%c╚═══════════════════════════════════════╝', styles);
    console.log('%c\n👋 Hi there, curious developer!', 'color: #ff00f7; font-size: 12px;');
    console.log('%c📧 Contact: sirhanmuzaffar.id01@gmail.com', 'color: #00ff88; font-size: 11px;');
  }
};


/* ═══════════════════════════════════════════════════════════════
   INITIALIZE ALL MODULES
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Core modules
  Preloader.init();
  Navigation.init();
  ScrollProgress.init();
  ScrollToTop.init();
  Toast.init();
  
  // Animation modules
  Counter.init();
  ScrollReveal.init();
  CardGlow.init();
  RippleEffect.init();
  
  // Interactive modules
  DemoTerminal.init();
  FAQ.init();
  CodeCopy.init();
  KeyboardShortcuts.init();
  Download.init();
  
  // Utility modules
  SmoothScroll.init();
  LazyLoad.init();
  TerminalTyping.init();
  
  // Fun stuff
  ConsoleEasterEgg.init();
});


/* ═══════════════════════════════════════════════════════════════
   EXPORT FOR GLOBAL ACCESS (if needed)
   ═══════════════════════════════════════════════════════════════ */
window.GoRent = {
  Utils,
  Toast,
  DemoTerminal,
  Navigation
};