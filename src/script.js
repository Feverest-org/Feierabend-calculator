/**
 * Configuration Manager
 * Handles configuration loading, saving, and validation
 */
class ConfigManager {
    constructor() {
        this.defaultConfig = {
            targetHours: 8,
            breakDuration: 30,
            theme: 'system',
            language: 'de'
        };
        this.config = { ...this.defaultConfig };
        this.loadConfig();
    }

    /**
     * Load configuration from localStorage
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('flexibleTimeCalculatorConfig');
            if (savedConfig) {
                this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.warn('Failed to load configuration, using defaults:', error);
            this.config = { ...this.defaultConfig };
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveConfig() {
        try {
            localStorage.setItem('flexibleTimeCalculatorConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save configuration:', error);
        }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
    }

    /**
     * Reset configuration to defaults
     */
    resetConfig() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
    }
}

/**
 * Theme Manager
 * Handles theme switching and persistence
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'system';
        this.loadTheme();
        this.applyTheme();
        this.setupMediaQuery();
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
                this.currentTheme = savedTheme;
            }
        } catch (error) {
            console.warn('Failed to load theme, using default:', error);
        }
    }

    /**
     * Save theme to localStorage
     */
    saveTheme() {
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        if (['system', 'light', 'dark'].includes(theme)) {
            this.currentTheme = theme;
            this.saveTheme();
            this.applyTheme();
        }
    }

    /**
     * Apply theme to document
     */
    applyTheme() {
        const root = document.documentElement;
        
        // Remove all theme classes first
        root.classList.remove('theme-light', 'theme-dark', 'theme-system');
        
        if (this.currentTheme === 'system') {
            // For system theme, check OS preference
            root.removeAttribute('data-theme');
            root.classList.add('theme-system');
            
            // Check system preference
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDarkScheme) {
                root.setAttribute('data-theme', 'dark');
            } else {
                root.setAttribute('data-theme', 'light');
            }
        } else {
            // For explicit theme choice
            root.setAttribute('data-theme', this.currentTheme);
            root.classList.add(`theme-${this.currentTheme}`);
        }
        
        // Update localStorage
        localStorage.setItem('theme', this.currentTheme);
        
        console.log(`Theme applied: ${this.currentTheme}`);
    }

    /**
     * Setup media query listener for system theme changes
     */
    setupMediaQuery() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(() => {
            if (this.currentTheme === 'system') {
                this.applyTheme();
            }
        });
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.currentTheme;
    }
}

/**
 * Flexible Time Calculator
 * Main application class
 */
class FlexibleTimeCalculator {
    constructor() {
        // Initialize managers
        this.configManager = new ConfigManager();
        this.themeManager = new ThemeManager();
        
        // Get DOM elements
        this.initializeElements();
        
        // Fill end time with current time
        this.setCurrentTimeAsEndTime();
        
        // Bind events
        this.bindEvents();
        
        // Load initial configuration
        this.loadConfiguration();
        
        // Perform initial calculation
        this.calculateTime();
        
        // Set up auto-update for current time in end time field
        this.setupEndTimeUpdater();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Form elements
        this.startTimeInput = document.getElementById('start-time');
        this.endTimeInput = document.getElementById('end-time');
        this.overtimeBalanceInput = document.getElementById('overtime-balance');
        
        // Result elements
        this.workingHoursDisplay = document.getElementById('working-hours');
        this.targetDisplay = document.getElementById('target-display');
        this.timeBalanceDisplay = document.getElementById('time-balance');
        this.totalOvertimeDisplay = document.getElementById('total-overtime');
        this.suggestedEndTimeDisplay = document.getElementById('suggested-end-time');
        
        // Modal elements
        this.configBtn = document.getElementById('config-btn');
        this.configModal = document.getElementById('config-modal');
        this.modalClose = document.getElementById('modal-close');
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.configForm = document.getElementById('config-form');
        this.configReset = document.getElementById('config-reset');
        
        // Configuration inputs
        this.targetHoursInputs = document.querySelectorAll('input[name="targetHours"]');
        this.breakDurationInputs = document.querySelectorAll('input[name="breakDuration"]');
        this.customHoursInput = document.getElementById('config-custom-hours');
        this.customBreakInput = document.getElementById('config-custom-break');
        
        // Theme inputs
        this.themeHiddenInput = document.getElementById('theme-hidden');
        this.themeSegmentBtns = document.querySelectorAll('.theme-segmented .segment-btn');
        
        // Language inputs
        this.languageHiddenInput = document.getElementById('language-hidden');
        this.languageSegmentBtns = document.querySelectorAll('.language-segmented .segment-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Real-time calculation when inputs change
        this.startTimeInput.addEventListener('input', () => this.handleInputChange());
        this.endTimeInput.addEventListener('input', () => {
            // Mark end time as manually edited
            this.endTimeInput.setAttribute('data-manual-input', 'true');
            this.handleInputChange();
        });
        this.overtimeBalanceInput.addEventListener('input', () => this.handleInputChange());
        
        // Configuration modal events
        this.configBtn.addEventListener('click', () => this.openConfigModal());
        this.modalClose.addEventListener('click', () => this.closeConfigModal());
        this.modalOverlay.addEventListener('click', () => this.closeConfigModal());
        this.configReset.addEventListener('click', () => this.resetConfiguration());
        
        // Real-time configuration changes
        this.configForm.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                // Auto-save when radio buttons change (without closing modal)
                this.saveCurrentConfig();
            }
        });
        
        // Custom input handling
        this.customHoursInput.addEventListener('input', () => this.handleCustomHoursInput());
        this.customBreakInput.addEventListener('input', () => this.handleCustomBreakInput());
        
        // Theme handling - segmented control
        this.themeSegmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const themeValue = btn.getAttribute('data-theme');
                if (themeValue) {
                    this.themeHiddenInput.value = themeValue;
                    this.themeManager.setTheme(themeValue);
                    this.updateActiveThemeButton(themeValue);
                }
            });
        });
        
        // Language handling - segmented control
        this.languageSegmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const langValue = btn.getAttribute('data-lang');
                if (langValue) {
                    this.languageHiddenInput.value = langValue;
                    this.updateLanguage(langValue);
                    this.updateActiveLanguageButton(langValue);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.configModal.classList.contains('hidden')) {
                this.closeConfigModal();
            }
        });
    }

    /**
     * Handle input changes for real-time calculation
     */
    handleInputChange() {
        this.calculateTime();
    }

    /**
     * Handle custom hours input
     */
    handleCustomHoursInput() {
        const customHours = parseFloat(this.customHoursInput.value);
        if (!isNaN(customHours) && customHours > 0) {
            // Auto-select the custom radio button
            const customRadio = document.getElementById('config-target-custom');
            if (customRadio) {
                customRadio.checked = true;
                this.saveCurrentConfig();
            }
        }
    }

    /**
     * Handle custom break input
     */
    handleCustomBreakInput() {
        const customBreak = parseInt(this.customBreakInput.value);
        if (!isNaN(customBreak) && customBreak >= 0) {
            // Auto-select the custom radio button
            const customRadio = document.getElementById('config-break-custom');
            if (customRadio) {
                customRadio.checked = true;
                this.saveCurrentConfig();
            }
        }
    }

    /**
     * Open configuration modal
     */
    openConfigModal() {
        this.configModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close configuration modal
     */
    closeConfigModal() {
        this.configModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Load configuration into UI
     */
    loadConfiguration() {
        const config = this.configManager.getConfig();
        
        // Load target hours
        if (config.targetHours) {
            const targetInput = document.querySelector(`input[name="targetHours"][value="${config.targetHours}"]`);
            if (targetInput) {
                targetInput.checked = true;
            } else {
                // Custom target hours
                const customTargetInput = document.getElementById('config-target-custom');
                if (customTargetInput) {
                    customTargetInput.checked = true;
                    this.customHoursInput.value = config.targetHours;
                }
            }
        }
        
        // Load break duration
        if (config.breakDuration !== undefined) {
            const breakInput = document.querySelector(`input[name="breakDuration"][value="${config.breakDuration}"]`);
            if (breakInput) {
                breakInput.checked = true;
            } else {
                // Custom break duration
                const customBreakInput = document.getElementById('config-break-custom');
                if (customBreakInput) {
                    customBreakInput.checked = true;
                    this.customBreakInput.value = config.breakDuration;
                }
            }
        }
        
        // Load theme
        const theme = this.themeManager.getTheme();
        this.themeHiddenInput.value = theme;
        this.updateActiveThemeButton(theme);
        
        // Load language
        const language = config.language || 'de';
        this.languageHiddenInput.value = language;
        this.updateActiveLanguageButton(language);
        
        // Update custom inputs state
        this.updateCustomInputsState();
        
        // Show target hours immediately
        this.targetDisplay.textContent = this.formatHours(config.targetHours);
    }

    /**
     * Save current configuration
     */
    saveCurrentConfig() {
        const config = {};
        
        // Get target hours
        const targetHoursInput = document.querySelector('input[name="targetHours"]:checked');
        if (targetHoursInput) {
            if (targetHoursInput.value === 'custom') {
                const customHours = parseFloat(this.customHoursInput.value);
                config.targetHours = !isNaN(customHours) && customHours > 0 ? customHours : 8;
            } else {
                config.targetHours = parseFloat(targetHoursInput.value);
            }
        }
        
        // Get break duration
        const breakDurationInput = document.querySelector('input[name="breakDuration"]:checked');
        if (breakDurationInput) {
            if (breakDurationInput.value === 'custom') {
                const customBreak = parseInt(this.customBreakInput.value);
                config.breakDuration = !isNaN(customBreak) && customBreak >= 0 ? customBreak : 30;
            } else {
                config.breakDuration = parseInt(breakDurationInput.value);
            }
        }
        
        // Save configuration
        this.configManager.updateConfig(config);
        
        // Update custom inputs state
        this.updateCustomInputsState();
        
        // Recalculate with new settings
        this.calculateTime();
    }

    /**
     * Update custom inputs enabled/disabled state
     */
    updateCustomInputsState() {
        // Target hours custom input
        const customTargetChecked = document.getElementById('config-target-custom')?.checked;
        this.customHoursInput.disabled = !customTargetChecked;
        
        // Break duration custom input
        const customBreakChecked = document.getElementById('config-break-custom')?.checked;
        this.customBreakInput.disabled = !customBreakChecked;
    }

    /**
     * Reset configuration to defaults
     */
    resetConfiguration() {
        this.configManager.resetConfig();
        this.themeManager.setTheme('system');
        
        // Reset language to default (German)
        this.languageHiddenInput.value = 'de';
        
        // Update UI
        this.updateActiveThemeButton('system');
        this.updateActiveLanguageButton('de');
        
        this.loadConfiguration();
        this.calculateTime();
    }
    
    /**
     * Update active theme button
     */
    updateActiveThemeButton(theme) {
        this.themeSegmentBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            }
        });
    }
    
    /**
     * Update active language button
     */
    updateActiveLanguageButton(language) {
        this.languageSegmentBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === language) {
                btn.classList.add('active');
            }
        });
    }
    
    /**
     * Update language
     */
    updateLanguage(language) {
        // Aktualisieren und speichern Sie die Spracheinstellung
        const config = this.configManager.getConfig();
        config.language = language;
        this.configManager.updateConfig(config);
        
        // Hier könnte in Zukunft die Übersetzungslogik implementiert werden
        console.log(`Language changed to: ${language}`);
    }

    /**
     * Calculate working time and overtime
     */
    calculateTime() {
        const startTime = this.startTimeInput.value;
        const endTime = this.endTimeInput.value;
        const currentOvertimeBalance = parseFloat(this.overtimeBalanceInput.value) || 0;
        
        // Get current configuration
        const config = this.configManager.getConfig();
        
        // Always show target hours from configuration
        this.targetDisplay.textContent = this.formatHours(config.targetHours);
        
        // Calculate suggested end time if start time is provided
        if (startTime) {
            const start = this.parseTime(startTime);
            if (start) {
                const targetMinutes = config.targetHours * 60;
                const suggestedEndTime = new Date(start.getTime() + (targetMinutes + config.breakDuration) * 60 * 1000);
                this.suggestedEndTimeDisplay.textContent = this.formatTime(suggestedEndTime);
            } else {
                this.suggestedEndTimeDisplay.textContent = '--:--';
            }
        } else {
            this.suggestedEndTimeDisplay.textContent = '--:--';
        }
        
        // If both start and end time are provided, calculate everything
        if (!startTime || !endTime) {
            this.clearPartialResults();
            return;
        }
        
        // Parse times
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        if (!start || !end) {
            this.clearPartialResults();
            return;
        }
        
        // Handle overnight shifts
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }
        
        // Calculate working hours (excluding break)
        const totalMinutes = (end - start) / (1000 * 60);
        const workingMinutes = totalMinutes - config.breakDuration;
        const workingHours = workingMinutes / 60;
        
        // Calculate balance for today
        const targetHours = config.targetHours;
        const todayBalance = workingHours - targetHours;
        
        // Calculate new total overtime balance
        const newTotalBalance = currentOvertimeBalance + todayBalance;
        
        // Calculate suggested end time to reach target
        const targetMinutes = targetHours * 60;
        const suggestedEndTime = new Date(start.getTime() + (targetMinutes + config.breakDuration) * 60 * 1000);
        
        // Update display
        this.updateResults({
            workingHours,
            targetHours,
            todayBalance,
            newTotalBalance,
            suggestedEndTime
        });
    }

    /**
     * Parse time string to Date object
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            return null;
        }
        
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    /**
     * Format hours to HH:MM
     */
    formatHours(hours) {
        const totalMinutes = Math.round(Math.abs(hours) * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const sign = hours < 0 ? '-' : '';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    /**
     * Format time to HH:MM
     */
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    /**
     * Set current time as end time
     */
    setCurrentTimeAsEndTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.endTimeInput.value = `${hours}:${minutes}`;
    }
    
    /**
     * Setup automatic end time updater
     */
    setupEndTimeUpdater() {
        // Update end time every minute if the user hasn't manually changed it
        setInterval(() => {
            // Only update if no manual input was done (tracked by data attribute)
            if (this.endTimeInput.getAttribute('data-manual-input') !== 'true') {
                this.setCurrentTimeAsEndTime();
                this.calculateTime();
            }
        }, 60000); // Update every minute
    }

    /**
     * Update results display
     */
    updateResults(results) {
        const { workingHours, targetHours, todayBalance, newTotalBalance, suggestedEndTime } = results;
        
        // Working hours
        this.workingHoursDisplay.textContent = this.formatHours(workingHours);
        
        // Target hours
        this.targetDisplay.textContent = this.formatHours(targetHours);
        
        // Today's balance
        this.timeBalanceDisplay.textContent = this.formatHours(todayBalance);
        this.timeBalanceDisplay.className = 'result-value balance-value';
        const balanceItem = this.timeBalanceDisplay.closest('.balance-item');
        balanceItem.classList.remove('positive', 'negative');
        if (todayBalance > 0) {
            this.timeBalanceDisplay.classList.add('positive');
            balanceItem.classList.add('positive');
        } else if (todayBalance < 0) {
            this.timeBalanceDisplay.classList.add('negative');
            balanceItem.classList.add('negative');
        }
        
        // Total overtime balance
        this.totalOvertimeDisplay.textContent = this.formatHours(newTotalBalance);
        this.totalOvertimeDisplay.className = 'result-value overtime-value';
        const overtimeItem = this.totalOvertimeDisplay.closest('.overtime-item');
        overtimeItem.classList.remove('positive', 'negative');
        if (newTotalBalance > 0) {
            this.totalOvertimeDisplay.classList.add('positive');
            overtimeItem.classList.add('positive');
        } else if (newTotalBalance < 0) {
            this.totalOvertimeDisplay.classList.add('negative');
            overtimeItem.classList.add('negative');
        }
        
        // Suggested end time
        this.suggestedEndTimeDisplay.textContent = this.formatTime(suggestedEndTime);
    }

    /**
     * Clear all results
     */
    clearResults() {
        this.workingHoursDisplay.textContent = '--:--';
        this.targetDisplay.textContent = '--:--';
        this.timeBalanceDisplay.textContent = '--:--';
        this.totalOvertimeDisplay.textContent = '--:--';
        this.suggestedEndTimeDisplay.textContent = '--:--';
        
        // Reset classes
        this.timeBalanceDisplay.className = 'result-value balance-value';
        this.totalOvertimeDisplay.className = 'result-value overtime-value';
    }

    /**
     * Clear only working results (keep target hours visible)
     */
    clearWorkingResults() {
        this.workingHoursDisplay.textContent = '--:--';
        this.timeBalanceDisplay.textContent = '--:--';
        this.totalOvertimeDisplay.textContent = '--:--';
        this.suggestedEndTimeDisplay.textContent = '--:--';
        
        // Reset classes
        this.timeBalanceDisplay.className = 'result-value balance-value';
        this.totalOvertimeDisplay.className = 'result-value overtime-value';
    }

    /**
     * Clear only results that require both start and end time
     * (keep target hours and suggested end time visible)
     */
    clearPartialResults() {
        this.workingHoursDisplay.textContent = '--:--';
        this.timeBalanceDisplay.textContent = '--:--';
        this.totalOvertimeDisplay.textContent = '--:--';
        
        // Reset classes
        this.timeBalanceDisplay.className = 'result-value balance-value';
        this.totalOvertimeDisplay.className = 'result-value overtime-value';
    }

    // Methods for updating current balance have been removed as we now use auto-filled end time instead
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlexibleTimeCalculator();
});
