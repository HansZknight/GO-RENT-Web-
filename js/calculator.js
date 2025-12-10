/*
 * ═══════════════════════════════════════════════════════════════
 * GO-RENT - Rental Calculator
 * Version: 1.0.0
 * Author: Hans / Sirhan Muzaffar
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   CALCULATOR CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const CalculatorConfig = {
  // Vehicle data
  vehicles: {
    // Mobil
    avanza: {
      name: 'Toyota Avanza',
      type: 'car',
      pricePerDay: 350000,
      stock: 5,
      icon: '🚗',
      description: 'MPV 7 seater, cocok untuk keluarga'
    },
    innova: {
      name: 'Toyota Innova',
      type: 'car',
      pricePerDay: 500000,
      stock: 3,
      icon: '🚙',
      description: 'MPV Premium 7 seater, nyaman untuk perjalanan jauh'
    },
    // Motor
    beat: {
      name: 'Honda Beat',
      type: 'motorcycle',
      pricePerDay: 75000,
      stock: 10,
      icon: '🏍️',
      description: 'Motor matic hemat BBM'
    },
    vario: {
      name: 'Honda Vario',
      type: 'motorcycle',
      pricePerDay: 100000,
      stock: 8,
      icon: '🏍️',
      description: 'Motor matic premium dengan bagasi luas'
    }
  },

  // Discount tiers
  discounts: [
    { minDays: 7, percentage: 15, name: 'Gold Discount' },
    { minDays: 3, percentage: 10, name: 'Bronze Discount' }
  ],

  // Validation rules
  validation: {
    minDays: 1,
    maxDays: 30,
    minUnits: 1,
    maxUnits: 5,
    nameMinLength: 2,
    nameMaxLength: 50
  },

  // Currency settings
  currency: {
    locale: 'id-ID',
    currency: 'IDR'
  }
};


/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */
const CalcUtils = {
  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat(CalculatorConfig.currency.locale, {
      style: 'currency',
      currency: CalculatorConfig.currency.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format number with dots
  formatNumber(num) {
    return new Intl.NumberFormat(CalculatorConfig.currency.locale).format(num);
  },

  // Get current date formatted
  formatDate(date = new Date()) {
    return new Intl.DateTimeFormat(CalculatorConfig.currency.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Generate transaction ID
  generateTransactionId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GR-${timestamp}-${random}`;
  },

  // Validate name
  validateName(name) {
    const { nameMinLength, nameMaxLength } = CalculatorConfig.validation;
    if (!name || name.trim().length < nameMinLength) {
      return { valid: false, message: `Nama minimal ${nameMinLength} karakter` };
    }
    if (name.trim().length > nameMaxLength) {
      return { valid: false, message: `Nama maksimal ${nameMaxLength} karakter` };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return { valid: false, message: 'Nama hanya boleh huruf dan spasi' };
    }
    return { valid: true };
  },

  // Validate days
  validateDays(days) {
    const { minDays, maxDays } = CalculatorConfig.validation;
    const numDays = parseInt(days);
    if (isNaN(numDays) || numDays < minDays) {
      return { valid: false, message: `Minimal sewa ${minDays} hari` };
    }
    if (numDays > maxDays) {
      return { valid: false, message: `Maksimal sewa ${maxDays} hari` };
    }
    return { valid: true };
  },

  // Validate units
  validateUnits(units, vehicleId) {
    const { minUnits, maxUnits } = CalculatorConfig.validation;
    const numUnits = parseInt(units);
    const vehicle = CalculatorConfig.vehicles[vehicleId];
    
    if (isNaN(numUnits) || numUnits < minUnits) {
      return { valid: false, message: `Minimal ${minUnits} unit` };
    }
    if (numUnits > maxUnits) {
      return { valid: false, message: `Maksimal ${maxUnits} unit` };
    }
    if (vehicle && numUnits > vehicle.stock) {
      return { valid: false, message: `Stok tersedia hanya ${vehicle.stock} unit` };
    }
    return { valid: true };
  }
};


/* ═══════════════════════════════════════════════════════════════
   RENTAL CALCULATOR CLASS
   ═══════════════════════════════════════════════════════════════ */
class RentalCalculator {
  constructor() {
    // Form elements
    this.form = {
      vehicleType: null,
      rentalDays: null,
      customerName: null,
      unitCount: null
    };

    // Result elements
    this.result = {
      container: null,
      vehicle: null,
      price: null,
      days: null,
      units: null,
      subtotal: null,
      discountRow: null,
      discountBadge: null,
      discount: null,
      total: null
    };

    // Current calculation
    this.currentCalculation = null;

    // Transaction history
    this.transactions = [];

    // Initialize
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadTransactions();
  }

  cacheElements() {
    // Form elements
    this.form.vehicleType = document.getElementById('vehicleType');
    this.form.rentalDays = document.getElementById('rentalDays');
    this.form.customerName = document.getElementById('customerName');
    this.form.unitCount = document.getElementById('unitCount');

    // Result elements
    this.result.container = document.getElementById('calcResult');
    this.result.vehicle = document.getElementById('resultVehicle');
    this.result.price = document.getElementById('resultPrice');
    this.result.days = document.getElementById('resultDays');
    this.result.units = document.getElementById('resultUnits');
    this.result.subtotal = document.getElementById('resultSubtotal');
    this.result.discountRow = document.getElementById('discountRow');
    this.result.discountBadge = document.getElementById('discountBadge');
    this.result.discount = document.getElementById('resultDiscount');
    this.result.total = document.getElementById('resultTotal');
  }

  bindEvents() {
    // Real-time calculation on input change
    if (this.form.vehicleType) {
      this.form.vehicleType.addEventListener('change', () => this.onInputChange());
    }
    if (this.form.rentalDays) {
      this.form.rentalDays.addEventListener('input', () => this.onInputChange());
    }
    if (this.form.unitCount) {
      this.form.unitCount.addEventListener('input', () => this.onInputChange());
    }
    if (this.form.customerName) {
      this.form.customerName.addEventListener('input', () => this.validateCustomerName());
    }

    // Enter key to calculate
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.closest('.calculator-card')) {
        e.preventDefault();
        this.calculate();
      }
    });
  }

  onInputChange() {
    // Live preview (optional)
    // this.calculate();
  }

  validateCustomerName() {
    const name = this.form.customerName?.value;
    const validation = CalcUtils.validateName(name);
    
    if (!validation.valid && name.length > 0) {
      this.form.customerName.classList.add('error');
    } else {
      this.form.customerName.classList.remove('error');
    }
    
    return validation;
  }

  getFormData() {
    return {
      vehicleId: this.form.vehicleType?.value || '',
      days: parseInt(this.form.rentalDays?.value) || 1,
      customerName: this.form.customerName?.value?.trim() || '',
      units: parseInt(this.form.unitCount?.value) || 1
    };
  }

  validateForm() {
    const data = this.getFormData();
    const errors = [];

    // Validate vehicle selection
    if (!data.vehicleId) {
      errors.push('Pilih kendaraan terlebih dahulu');
    }

    // Validate customer name
    const nameValidation = CalcUtils.validateName(data.customerName);
    if (!nameValidation.valid) {
      errors.push(nameValidation.message);
    }

    // Validate days
    const daysValidation = CalcUtils.validateDays(data.days);
    if (!daysValidation.valid) {
      errors.push(daysValidation.message);
    }

    // Validate units
    if (data.vehicleId) {
      const unitsValidation = CalcUtils.validateUnits(data.units, data.vehicleId);
      if (!unitsValidation.valid) {
        errors.push(unitsValidation.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getDiscount(days) {
    const { discounts } = CalculatorConfig;
    
    // Sort discounts by minDays descending to get highest applicable discount
    const sortedDiscounts = [...discounts].sort((a, b) => b.minDays - a.minDays);
    
    for (const discount of sortedDiscounts) {
      if (days >= discount.minDays) {
        return discount;
      }
    }
    
    return null;
  }

  calculate() {
    // Validate form
    const validation = this.validateForm();
    if (!validation.valid) {
      validation.errors.forEach(error => {
        if (window.Toast) {
          window.Toast.warning(error);
        } else {
          alert(error);
        }
      });
      return null;
    }

    // Get form data
    const data = this.getFormData();
    const vehicle = CalculatorConfig.vehicles[data.vehicleId];

    if (!vehicle) {
      if (window.Toast) {
        window.Toast.error('Kendaraan tidak ditemukan');
      }
      return null;
    }

    // Calculate prices
    const pricePerDay = vehicle.pricePerDay;
    const subtotal = pricePerDay * data.days * data.units;
    
    // Get applicable discount
    const discount = this.getDiscount(data.days);
    const discountAmount = discount ? Math.round(subtotal * (discount.percentage / 100)) : 0;
    const total = subtotal - discountAmount;

    // Store calculation
    this.currentCalculation = {
      transactionId: CalcUtils.generateTransactionId(),
      customerName: data.customerName,
      vehicleId: data.vehicleId,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      vehicleIcon: vehicle.icon,
      pricePerDay,
      days: data.days,
      units: data.units,
      subtotal,
      discount: discount ? {
        name: discount.name,
        percentage: discount.percentage,
        amount: discountAmount
      } : null,
      total,
      timestamp: new Date().toISOString()
    };

    // Display result
    this.displayResult();

    // Show success message
    if (window.Toast) {
      window.Toast.success('Perhitungan berhasil!');
    }

    return this.currentCalculation;
  }

  displayResult() {
    if (!this.currentCalculation || !this.result.container) return;

    const calc = this.currentCalculation;

    // Update result values
    if (this.result.vehicle) {
      this.result.vehicle.textContent = `${calc.vehicleIcon} ${calc.vehicleName}`;
    }
    if (this.result.price) {
      this.result.price.textContent = CalcUtils.formatCurrency(calc.pricePerDay);
    }
    if (this.result.days) {
      this.result.days.textContent = `${calc.days} hari`;
    }
    if (this.result.units) {
      this.result.units.textContent = `${calc.units} unit`;
    }
    if (this.result.subtotal) {
      this.result.subtotal.textContent = CalcUtils.formatCurrency(calc.subtotal);
    }

    // Handle discount display
    if (calc.discount) {
      if (this.result.discountRow) {
        this.result.discountRow.style.display = 'flex';
      }
      if (this.result.discountBadge) {
        this.result.discountBadge.textContent = `${calc.discount.percentage}%`;
      }
      if (this.result.discount) {
        this.result.discount.textContent = `-${CalcUtils.formatCurrency(calc.discount.amount)}`;
      }
    } else {
      if (this.result.discountRow) {
        this.result.discountRow.style.display = 'none';
      }
    }

    // Update total
    if (this.result.total) {
      this.result.total.textContent = CalcUtils.formatCurrency(calc.total);
    }

    // Show result container with animation
    this.result.container.style.display = 'block';
    this.result.container.classList.add('fade-in-up');
    
    // Scroll to result
    setTimeout(() => {
      this.result.container.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);

    // Animate total value
    this.animateValue(this.result.total, 0, calc.total, 1000);
  }

  animateValue(element, start, end, duration) {
    if (!element) return;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.round(start + (end - start) * easeOut);
      element.textContent = CalcUtils.formatCurrency(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  reset() {
    // Reset form values
    if (this.form.vehicleType) this.form.vehicleType.value = '';
    if (this.form.rentalDays) this.form.rentalDays.value = '1';
    if (this.form.customerName) this.form.customerName.value = '';
    if (this.form.unitCount) this.form.unitCount.value = '1';

    // Hide result
    if (this.result.container) {
      this.result.container.style.display = 'none';
      this.result.container.classList.remove('fade-in-up');
    }

    // Clear current calculation
    this.currentCalculation = null;

    // Show message
    if (window.Toast) {
      window.Toast.info('Form telah direset');
    }
  }

  saveTransaction() {
    if (!this.currentCalculation) {
      if (window.Toast) {
        window.Toast.warning('Tidak ada perhitungan untuk disimpan');
      }
      return false;
    }

    // Add to transactions
    this.transactions.unshift({ ...this.currentCalculation });

    // Keep only last 100 transactions
    if (this.transactions.length > 100) {
      this.transactions = this.transactions.slice(0, 100);
    }

    // Save to localStorage
    try {
      localStorage.setItem('gorent_transactions', JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }

    // Update demo terminal history if available
    if (window.DemoTerminal) {
      window.DemoTerminal.addTransaction(this.currentCalculation);
    }

    // Update stock display
    this.updateStockDisplay(this.currentCalculation.vehicleId, -this.currentCalculation.units);

    // Show success message
    if (window.Toast) {
      window.Toast.success(`Transaksi ${this.currentCalculation.transactionId} tersimpan!`);
    }

    // Reset form after saving
    this.reset();

    return true;
  }

  loadTransactions() {
    try {
      const saved = localStorage.getItem('gorent_transactions');
      if (saved) {
        this.transactions = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
      this.transactions = [];
    }
  }

  updateStockDisplay(vehicleId, change) {
    const stockElement = document.getElementById(`stock${vehicleId.charAt(0).toUpperCase() + vehicleId.slice(1)}`);
    if (stockElement) {
      const [current, total] = stockElement.textContent.split('/').map(Number);
      const newStock = Math.max(0, Math.min(total, current + change));
      stockElement.textContent = `${newStock}/${total}`;
    }
  }

  generateReceipt() {
    if (!this.currentCalculation) return null;

    const calc = this.currentCalculation;
    const date = CalcUtils.formatDate(new Date(calc.timestamp));

    return `
╔══════════════════════════════════════════════════════════╗
║                      🚗 GO-RENT 🏍️                        ║
║              STRUK PEMBAYARAN / RECEIPT                  ║
╠══════════════════════════════════════════════════════════╣
║  No. Transaksi : ${calc.transactionId.padEnd(36)}║
║  Tanggal       : ${date.substring(0, 36).padEnd(36)}║
╠══════════════════════════════════════════════════════════╣
║  Nama Pelanggan: ${calc.customerName.substring(0, 36).padEnd(36)}║
╠══════════════════════════════════════════════════════════╣
║  DETAIL SEWA                                             ║
║  ──────────────────────────────────────────────────────  ║
║  Kendaraan     : ${calc.vehicleName.padEnd(36)}║
║  Harga/Hari    : ${CalcUtils.formatCurrency(calc.pricePerDay).padEnd(36)}║
║  Durasi        : ${(calc.days + ' hari').padEnd(36)}║
║  Jumlah Unit   : ${(calc.units + ' unit').padEnd(36)}║
╠══════════════════════════════════════════════════════════╣
║  RINCIAN BIAYA                                           ║
║  ──────────────────────────────────────────────────────  ║
║  Subtotal      : ${CalcUtils.formatCurrency(calc.subtotal).padEnd(36)}║
${calc.discount ? `║  Diskon (${calc.discount.percentage}%)  : -${CalcUtils.formatCurrency(calc.discount.amount).padEnd(35)}║\n` : ''}║  ──────────────────────────────────────────────────────  ║
║  TOTAL BAYAR   : ${CalcUtils.formatCurrency(calc.total).padEnd(36)}║
╠══════════════════════════════════════════════════════════╣
║           Terima kasih telah menggunakan GO-RENT!        ║
║              Selamat berkendara dengan aman! 🚗          ║
╚══════════════════════════════════════════════════════════╝
    `.trim();
  }

  printReceipt() {
    if (!this.currentCalculation) {
      if (window.Toast) {
        window.Toast.warning('Tidak ada data untuk dicetak');
      }
      return;
    }

    const receipt = this.generateReceipt();
    
    // Create print window
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${this.currentCalculation.transactionId}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              background: #fff;
              color: #000;
            }
            pre {
              font-size: 12px;
              line-height: 1.4;
              white-space: pre;
              margin: 0;
            }
            @media print {
              body { padding: 0; }
              pre { font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <pre>${receipt}</pre>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(receipt).then(() => {
        if (window.Toast) {
          window.Toast.success('Receipt copied to clipboard!');
        }
      }).catch(() => {
        // Show in console as last resort
        console.log(receipt);
        if (window.Toast) {
          window.Toast.info('Receipt printed to console');
        }
      });
    }
  }

  exportTransactions(format = 'json') {
    if (this.transactions.length === 0) {
      if (window.Toast) {
        window.Toast.warning('Tidak ada transaksi untuk diexport');
      }
      return;
    }

    let content, filename, type;

    switch (format) {
      case 'csv':
        content = this.transactionsToCSV();
        filename = `gorent_transactions_${Date.now()}.csv`;
        type = 'text/csv';
        break;
      
      case 'json':
      default:
        content = JSON.stringify(this.transactions, null, 2);
        filename = `gorent_transactions_${Date.now()}.json`;
        type = 'application/json';
        break;
    }

    // Create download
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.Toast) {
      window.Toast.success(`Exported ${this.transactions.length} transactions`);
    }
  }

  transactionsToCSV() {
    const headers = [
      'Transaction ID',
      'Date',
      'Customer Name',
      'Vehicle',
      'Type',
      'Price/Day',
      'Days',
      'Units',
      'Subtotal',
      'Discount %',
      'Discount Amount',
      'Total'
    ];

    const rows = this.transactions.map(t => [
      t.transactionId,
      new Date(t.timestamp).toISOString(),
      t.customerName,
      t.vehicleName,
      t.vehicleType,
      t.pricePerDay,
      t.days,
      t.units,
      t.subtotal,
      t.discount?.percentage || 0,
      t.discount?.amount || 0,
      t.total
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  getStatistics() {
    if (this.transactions.length === 0) {
      return null;
    }

    const stats = {
      totalTransactions: this.transactions.length,
      totalRevenue: 0,
      totalDiscount: 0,
      averageRentalDays: 0,
      vehicleBreakdown: {},
      monthlyRevenue: {}
    };

    let totalDays = 0;

    this.transactions.forEach(t => {
      stats.totalRevenue += t.total;
      stats.totalDiscount += t.discount?.amount || 0;
      totalDays += t.days;

      // Vehicle breakdown
      if (!stats.vehicleBreakdown[t.vehicleName]) {
        stats.vehicleBreakdown[t.vehicleName] = { count: 0, revenue: 0 };
      }
      stats.vehicleBreakdown[t.vehicleName].count++;
      stats.vehicleBreakdown[t.vehicleName].revenue += t.total;

      // Monthly revenue
      const month = new Date(t.timestamp).toISOString().substring(0, 7);
      if (!stats.monthlyRevenue[month]) {
        stats.monthlyRevenue[month] = 0;
      }
      stats.monthlyRevenue[month] += t.total;
    });

    stats.averageRentalDays = Math.round(totalDays / this.transactions.length);

    return stats;
  }
}


/* ═══════════════════════════════════════════════════════════════
   PRICE DISPLAY COMPONENT
   ═══════════════════════════════════════════════════════════════ */
class PriceDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    const { vehicles } = CalculatorConfig;
    
    let html = '<div class="price-grid">';
    
    Object.entries(vehicles).forEach(([id, vehicle]) => {
      html += `
        <div class="price-item" data-vehicle="${id}">
          <div class="price-icon">${vehicle.icon}</div>
          <div class="price-info">
            <div class="price-name">${vehicle.name}</div>
            <div class="price-desc">${vehicle.description}</div>
          </div>
          <div class="price-value">${CalcUtils.formatCurrency(vehicle.pricePerDay)}<span>/hari</span></div>
          <div class="price-stock">Stok: ${vehicle.stock} unit</div>
        </div>
      `;
    });
    
    html += '</div>';
    
    this.container.innerHTML = html;
  }
}


/* ═══════════════════════════════════════════════════════════════
   QUICK CALCULATOR (Compact Version)
   ═══════════════════════════════════════════════════════════════ */
class QuickCalculator {
  constructor(buttonSelector = '[data-quick-calc]') {
    this.buttons = document.querySelectorAll(buttonSelector);
    this.init();
  }

  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const vehicleId = button.dataset.vehicle;
        const days = parseInt(button.dataset.days) || 1;
        this.quickCalc(vehicleId, days);
      });
    });
  }

  quickCalc(vehicleId, days) {
    const vehicle = CalculatorConfig.vehicles[vehicleId];
    if (!vehicle) return null;

    const subtotal = vehicle.pricePerDay * days;
    const discount = this.getDiscount(days);
    const discountAmount = discount ? Math.round(subtotal * (discount.percentage / 100)) : 0;
    const total = subtotal - discountAmount;

    // Show tooltip or modal with result
    this.showResult({
      vehicle: vehicle.name,
      days,
      subtotal,
      discount: discount?.percentage || 0,
      discountAmount,
      total
    });

    return total;
  }

  getDiscount(days) {
    const { discounts } = CalculatorConfig;
    const sorted = [...discounts].sort((a, b) => b.minDays - a.minDays);
    
    for (const d of sorted) {
      if (days >= d.minDays) return d;
    }
    return null;
  }

  showResult(result) {
    if (window.Toast) {
      window.Toast.info(
        `${result.vehicle} - ${result.days} hari: ${CalcUtils.formatCurrency(result.total)}` +
        (result.discount > 0 ? ` (Diskon ${result.discount}%)` : '')
      );
    }
  }
}


/* ═══════════════════════════════════════════════════════════════
   DISCOUNT CALCULATOR
   ═══════════════════════════════════════════════════════════════ */
class DiscountCalculator {
  static calculate(subtotal, days) {
    const { discounts } = CalculatorConfig;
    
    // Sort by minDays descending
    const sorted = [...discounts].sort((a, b) => b.minDays - a.minDays);
    
    for (const discount of sorted) {
      if (days >= discount.minDays) {
        return {
          applicable: true,
          name: discount.name,
          percentage: discount.percentage,
          amount: Math.round(subtotal * (discount.percentage / 100)),
          minDays: discount.minDays
        };
      }
    }
    
    return {
      applicable: false,
      name: null,
      percentage: 0,
      amount: 0,
      minDays: null
    };
  }

  static getNextTier(days) {
    const { discounts } = CalculatorConfig;
    
    // Sort by minDays ascending
    const sorted = [...discounts].sort((a, b) => a.minDays - b.minDays);
    
    for (const discount of sorted) {
      if (days < discount.minDays) {
        return {
          available: true,
          daysNeeded: discount.minDays - days,
          discount: discount
        };
      }
    }
    
    return {
      available: false,
      daysNeeded: 0,
      discount: null
    };
  }

  static showDiscountHint(days, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const nextTier = this.getNextTier(days);
    
    if (nextTier.available) {
      element.innerHTML = `
        <div class="discount-hint">
          💡 Tambah ${nextTier.daysNeeded} hari lagi untuk dapat 
          <strong>${nextTier.discount.percentage}% diskon!</strong>
        </div>
      `;
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  }
}


/* ═══════════════════════════════════════════════════════════════
   FORM VALIDATION COMPONENT
   ═══════════════════════════════════════════════════════════════ */
class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.errors = {};
    this.init();
  }

  init() {
    if (!this.form) return;

    // Add validation on blur
    const inputs = this.form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  validateField(input) {
    const name = input.name || input.id;
    let error = null;

    switch (name) {
      case 'customerName':
        const nameResult = CalcUtils.validateName(input.value);
        if (!nameResult.valid) error = nameResult.message;
        break;
      
      case 'rentalDays':
        const daysResult = CalcUtils.validateDays(input.value);
        if (!daysResult.valid) error = daysResult.message;
        break;
      
      case 'vehicleType':
        if (!input.value) error = 'Pilih kendaraan';
        break;
      
      case 'unitCount':
        const vehicleId = this.form.querySelector('#vehicleType')?.value;
        if (vehicleId) {
          const unitsResult = CalcUtils.validateUnits(input.value, vehicleId);
          if (!unitsResult.valid) error = unitsResult.message;
        }
        break;
    }

    if (error) {
      this.showError(input, error);
      this.errors[name] = error;
    } else {
      this.clearError(input);
      delete this.errors[name];
    }

    return !error;
  }

  showError(input, message) {
    input.classList.add('error');
    
    // Find or create error message element
    let errorEl = input.parentElement.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearError(input) {
    input.classList.remove('error');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.remove();
  }

  validateAll() {
    const inputs = this.form.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}


/* ═══════════════════════════════════════════════════════════════
   GLOBAL FUNCTIONS (Called from HTML)
   ═══════════════════════════════════════════════════════════════ */

// Calculator instance
let calculator = null;

// Initialize calculator
function initCalculator() {
  calculator = new RentalCalculator();
  return calculator;
}

// Calculate rental
function calculateRental() {
  if (!calculator) {
    calculator = new RentalCalculator();
  }
  return calculator.calculate();
}

// Reset calculator
function resetCalculator() {
  if (calculator) {
    calculator.reset();
  }
}

// Print receipt
function printReceipt() {
  if (calculator) {
    calculator.printReceipt();
  }
}

// Save transaction
function saveTransaction() {
  if (calculator) {
    return calculator.saveTransaction();
  }
  return false;
}

// Adjust days
function adjustDays(change) {
  const input = document.getElementById('rentalDays');
  if (input) {
    const { minDays, maxDays } = CalculatorConfig.validation;
    let value = parseInt(input.value) || 1;
    value = Math.max(minDays, Math.min(maxDays, value + change));
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
}

// Adjust units
function adjustUnits(change) {
  const input = document.getElementById('unitCount');
  if (input) {
    const { minUnits, maxUnits } = CalculatorConfig.validation;
    let value = parseInt(input.value) || 1;
    value = Math.max(minUnits, Math.min(maxUnits, value + change));
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
}


/* ═══════════════════════════════════════════════════════════════
   AUTO INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main calculator
  calculator = new RentalCalculator();

  // Initialize quick calculator
  new QuickCalculator('[data-quick-calc]');

  // Log initialization
  console.log('🧮 GO-RENT Calculator initialized');
});


/* ═══════════════════════════════════════════════════════════════
   EXPORT FOR GLOBAL ACCESS
   ═══════════════════════════════════════════════════════════════ */
window.RentalCalculator = RentalCalculator;
window.CalculatorConfig = CalculatorConfig;
window.CalcUtils = CalcUtils;
window.DiscountCalculator = DiscountCalculator;
window.FormValidator = FormValidator;
window.calculator = calculator;

// Global functions
window.calculateRental = calculateRental;
window.resetCalculator = resetCalculator;
window.printReceipt = printReceipt;
window.saveTransaction = saveTransaction;
window.adjustDays = adjustDays;
window.adjustUnits = adjustUnits;