/**
 * Translation Manager
 * Handles loading and applying translations
 */
class TranslationManager {
    constructor() {
        this.translations = {};
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.translationsLoaded = false;
    }

    /**
     * Load translations from a JSON file
     */
    async loadTranslations() {
        try {
            // Versuche die Übersetzungen zu laden
            console.log('Attempting to load translations from translations.json');
            const response = await fetch('translations.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load translations, status: ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log('Translations loaded successfully:', Object.keys(this.translations));
            
            // Set flag that translations are loaded
            this.translationsLoaded = true;
            
            // Load language from localStorage after translations are loaded
            this.loadLanguageFromStorage();
            
            // Return the loaded translations
            return this.translations;
        } catch (error) {
            console.error('Failed to load translations:', error);
            
            // Fallback: Eingebaute Übersetzungen verwenden
            console.log('Using built-in fallback translations');
            this.translations = this.getBuiltinTranslations();
            this.translationsLoaded = true;
            
            // Load language from localStorage even with fallback translations
            this.loadLanguageFromStorage();
            
            return this.translations;
        }
    }
    
    /**
     * Get built-in fallback translations when JSON loading fails
     * Dies ist eine Notfalllösung für den Fall, dass die Übersetzungsdatei nicht geladen werden kann
     */
    getBuiltinTranslations() {
        return {
            "en": {
                "appTitle": "Feierabend Calculator",
                "startTime": "Start Time",
                "endTime": "Estimated End Time",
                "overtimeBalance": "Current Overtime Balance (hours)",
                "overtimeHelp": "Enter your current overtime balance in decimal hours (e.g., 2.5 for 2h 30min)",
                "forceBreak": "Apply break time for today",
                "breakHint": "For working time under 6h, a break is not required by law",
                "resultsTitle": "Calculation Results",
                "workingHours": "Working Hours",
                "of": "of",
                "suggestedEndTime": "To reach target, leave at:",
                "todayBalance": "Today's Balance",
                "totalOvertime": "Total Overtime",
                "settings": "Settings",
                "resetDefaults": "Reset to Defaults",
                "workingHoursSettings": "Working Hours",
                "breakDuration": "Break Duration",
                "appTheme": "Appearance",
                "language": "Language",
            }
        };
    }
    
    /**
     * Load language setting from localStorage
     */
    loadLanguageFromStorage() {
        try {
            const savedConfig = localStorage.getItem('flexibleTimeCalculatorConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.language) {
                    this.setLanguage(config.language);
                    console.log('Language loaded from storage:', config.language);
                    return config.language;
                }
            }
            return this.currentLanguage;
        } catch (error) {
            console.warn('Failed to load language from storage:', error);
            return this.currentLanguage;
        }
    }

    /**
     * Set current language
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
        } else {
            console.warn(`Language "${language}" not available, using "${this.fallbackLanguage}" as fallback`);
            this.currentLanguage = this.fallbackLanguage;
        }
    }

    /**
     * Get translation for a key
     */
    get(key) {
        // Try current language first
        if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
            return this.translations[this.currentLanguage][key];
        }
        
        // Fall back to default language
        if (this.translations[this.fallbackLanguage] && this.translations[this.fallbackLanguage][key]) {
            return this.translations[this.fallbackLanguage][key];
        }
        
        // If all fails, return the key itself
        return key;
    }
}

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
            language: 'en' // Englisch als Standardsprache
        };
        this.config = { ...this.defaultConfig };
        this.loadConfig();
        console.log('ConfigManager initialized with language:', this.config.language);
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
        this.translationManager = new TranslationManager();
        
        // Get DOM elements (wichtig für spätere UI-Updates)
        this.initializeElements();
        
        // Bind events
        this.bindEvents();
        
        // Initialisiere die Anwendung in der richtigen Reihenfolge
        // Alle weiteren Initialisierungen erfolgen in der initializeApp-Methode
        this.initializeApp();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Form elements
        this.startTimeInput = document.getElementById('start-time');
        this.endTimeInput = document.getElementById('end-time');
        this.overtimeBalanceInput = document.getElementById('overtime-balance');
        this.forceBreakCheckbox = document.getElementById('force-break');
        this.breakOptionContainer = document.getElementById('break-option-container');
        
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
        this.startTimeInput.addEventListener('input', () => {
            // Prüfe, ob der Arbeitsbeginn nach der aktuellen Zeit liegt
            // und das Endzeit-Feld nicht manuell editiert wurde
            if (this.endTimeInput.getAttribute('data-manual-input') !== 'true') {
                this.setCurrentTimeAsEndTime();
            }
            this.handleInputChange();
        });
        this.endTimeInput.addEventListener('input', () => {
            // Mark end time as manually edited
            this.endTimeInput.setAttribute('data-manual-input', 'true');
            this.handleInputChange();
        });
        this.overtimeBalanceInput.addEventListener('input', () => this.handleInputChange());
        
        // Break checkbox handling
        if (this.forceBreakCheckbox) {
            this.forceBreakCheckbox.addEventListener('change', () => this.handleInputChange());
        }
        
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
     * Initialize the application in the correct sequence
     */
    async initializeApp() {
        try {
            console.log('Starting application initialization');
            
            // 1. Hole die aktuelle Konfiguration
            const config = this.configManager.getConfig();
            console.log('Initial config loaded:', config);
            
            // 2. Lade die Übersetzungen
            await this.translationManager.loadTranslations();
            
            // 3. Setze die Sprache explizit (auch wenn sie schon im loadTranslations gesetzt wurde)
            console.log('Setting language explicitly to:', config.language);
            this.translationManager.setLanguage(config.language);
            
            // 4. Aktualisiere den aktiven Zustand des Sprache-Buttons
            this.updateActiveLanguageButton(config.language);
            
            // 5. Lade den Rest der Konfiguration
            this.loadConfiguration();
            
            // 6. Wende Übersetzungen auf die UI an - NACH dem Laden der Konfiguration
            console.log('Applying translations with language:', this.translationManager.currentLanguage);
            this.applyTranslations();
            
            // 7. Setze aktuelle Zeit als Endzeit
            this.setCurrentTimeAsEndTime();
            
            // 8. Berechne die Zeit
            this.calculateTime();
            
            // 9. Richte Auto-Update für Endzeit ein
            this.setupEndTimeUpdater();
            
            // 10. Wende die Übersetzungen nochmal an, um sicherzustellen, dass alles übersetzt ist
            // Manchmal werden DOM-Elemente erst später verfügbar
            setTimeout(() => {
                console.log('Applying translations again after delay');
                this.applyTranslations();
            }, 100);
            
            console.log('Application initialized successfully with language:', config.language);
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
    
    /**
     * Update language
     */
    updateLanguage(language) {
        // Update and save language setting
        const config = this.configManager.getConfig();
        config.language = language;
        this.configManager.updateConfig(config);
        
        // Set language in translation manager and update UI
        this.translationManager.setLanguage(language);
        this.applyTranslations();
        
        console.log(`Language changed to: ${language}`);
    }
    
    /**
     * Apply translations to all UI elements
     */
    applyTranslations() {
        // Only apply translations if they are loaded
        if (Object.keys(this.translationManager.translations).length === 0) {
            console.warn('Cannot apply translations: Translations not loaded yet');
            return;
        }
        
        try {
            // Find all elements with data-i18n attribute and translate them
            const elementsToTranslate = document.querySelectorAll('[data-i18n]');
            console.log(`Applying translations to ${elementsToTranslate.length} elements, using language: ${this.translationManager.currentLanguage}`);
            
            if (elementsToTranslate.length === 0) {
                console.warn('No elements with data-i18n attribute found!');
            }
            
            // Dump current translations for debugging
            console.log('Available translations:', this.translationManager.translations);
            
            elementsToTranslate.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (!key) {
                    console.warn('Element has empty data-i18n attribute:', element);
                    return;
                }
                
                const translatedText = this.translationManager.get(key);
                
                // Ersetze immer den Textinhalt mit der Übersetzung
                // Das ist wichtig, um sicherzustellen, dass alle Texte in der richtigen Sprache angezeigt werden
                element.textContent = translatedText;
                
                if (key === translatedText) {
                    // Wenn der Schlüssel zurückgegeben wurde, wurde keine Übersetzung gefunden
                    console.warn(`No translation found for key "${key}" in language "${this.translationManager.currentLanguage}"`);
                } else {
                    console.log(`Translated "${key}" to "${translatedText}"`);
                }
            });
            
            // Special handling for elements that need more complex updates
            const suggestionText = document.querySelector('.suggestion-text');
            if (suggestionText) {
                const strongElement = suggestionText.querySelector('strong');
                if (strongElement) {
                    const timeValue = strongElement.textContent;
                    // Keep the suggestion-text span but ensure the strong element stays
                    const spanElement = suggestionText.querySelector('[data-i18n="suggestedEndTime"]');
                    if (spanElement) {
                        spanElement.textContent = this.translationManager.get('suggestedEndTime');
                    }
                }
            }
            
            // Update title attribute on settings button for accessibility
            const configBtn = document.querySelector('#config-btn');
            if (configBtn) {
                configBtn.setAttribute('title', this.translationManager.get('settings'));
            }
            
            // Erzeuge ein Event, um andere Komponenten zu informieren, dass Übersetzungen angewendet wurden
            document.dispatchEvent(new CustomEvent('translationsApplied', { 
                detail: { language: this.translationManager.currentLanguage }
            }));
        } catch (error) {
            console.error('Error applying translations:', error);
        }
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
                const now = new Date();
                const targetMinutes = config.targetHours * 60;
                
                // Determine if break should be included
                let breakDuration = 0;
                
                // Only include break duration if the target time is actually longer than the break
                if (config.targetHours * 60 >= config.breakDuration) {
                    if (config.targetHours >= 6) {
                        // For target >= 6 hours, include break
                        breakDuration = config.breakDuration;
                    } else if (this.forceBreakCheckbox && this.forceBreakCheckbox.checked) {
                        // For target < 6 hours, include break only if checkbox is checked
                        breakDuration = config.breakDuration;
                    }
                }
                
                let suggestedEndTime = new Date(start.getTime() + (targetMinutes + breakDuration) * 60 * 1000);
                
                // Entferne die Plausibilitätsprüfung, damit die Endzeit immer korrekt berechnet wird
                // Wir möchten immer die korrekte voraussichtliche Arbeitszeit anzeigen, auch für zukünftige Starts
                
                this.suggestedEndTimeDisplay.textContent = this.formatTime(suggestedEndTime);
                
                // Show/hide break option based on target working time
                if (config.targetHours < 6) {
                    this.breakOptionContainer.classList.remove('hidden');
                } else {
                    this.breakOptionContainer.classList.add('hidden');
                }
            } else {
                this.suggestedEndTimeDisplay.textContent = '--:--';
            }
        } else {
            this.suggestedEndTimeDisplay.textContent = '--:--';
            this.breakOptionContainer.classList.add('hidden');
        }
        
        // If both start and end time are provided, calculate everything
        if (!startTime || !endTime) {
            this.clearPartialResults();
            return;
        }
        
        // Parse times
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        const currentTime = new Date();
        
        if (!start || !end) {
            this.clearPartialResults();
            return;
        }
        
        // Check if start time is in the future
        const startIsInFuture = start > currentTime;
        
        // Special case: If start and end are exactly the same AND in the future
        // then we're just estimating the end time, not calculating actual work done
        if (startIsInFuture && start.getTime() === end.getTime()) {
            // Calculate suggested end time based on target hours and break
            const targetMinutes = config.targetHours * 60;
            let suggestedEndTime = new Date(start.getTime() + (targetMinutes + this.getEffectiveBreakDuration(config)) * 60 * 1000);
            
            this.updateResults({
                workingHours: 0,
                targetHours: config.targetHours,
                todayBalance: -config.targetHours,
                newTotalBalance: currentOvertimeBalance - config.targetHours,
                suggestedEndTime: suggestedEndTime
            });
            return;
        }
        
        // If the user has explicitly set different start and end times,
        // we calculate the hours as normal, even if they're in the future
        // This allows planning future work days
        
        // Handle overnight shifts
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }
        
        // Calculate total minutes worked
        const totalMinutes = (end - start) / (1000 * 60);
        
        // Determine if break should be applied
        const totalHours = totalMinutes / 60;
        let applyBreak = false;
        
        // Show/hide break option based on working time
        if (totalHours < 6) {
            // For less than 6 hours, break is optional
            this.breakOptionContainer.classList.remove('hidden');
            applyBreak = this.forceBreakCheckbox && this.forceBreakCheckbox.checked;
        } else {
            // For 6+ hours, break is mandatory
            this.breakOptionContainer.classList.add('hidden');
            applyBreak = true;
        }
        
        // Calculate working hours (excluding break if applicable)
        let workingMinutes = totalMinutes;
        let effectiveBreakDuration = 0;
        
        if (applyBreak) {
            // Ensure we never subtract more break time than the total worked time
            // This prevents negative working hours or unexpected day additions
            effectiveBreakDuration = Math.min(totalMinutes, config.breakDuration);
            
            // Only subtract break if it's actually being applied
            if (effectiveBreakDuration > 0) {
                workingMinutes -= effectiveBreakDuration;
            }
        }
        
        // Ensure working minutes is never negative
        workingMinutes = Math.max(0, workingMinutes);
        const workingHours = workingMinutes / 60;
        
        // Calculate balance for today
        const targetHours = config.targetHours;
        const todayBalance = workingHours - targetHours;
        
        // Calculate new total overtime balance
        const newTotalBalance = currentOvertimeBalance + todayBalance;
        
        // Calculate suggested end time to reach target
        const targetMinutes = targetHours * 60;
        
        // Get effective break duration
        const breakDuration = this.getEffectiveBreakDuration(config);
        
        // Calculate suggested end time based on target hours and break
        let suggestedEndTime = new Date(start.getTime() + (targetMinutes + breakDuration) * 60 * 1000);
        
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
     * Calculate the effective break duration based on configuration and current form state
     */
    getEffectiveBreakDuration(config) {
        let breakDuration = 0;
        
        // Only include break duration if the target time is actually longer than the break
        if (config.targetHours * 60 >= config.breakDuration) {
            if (config.targetHours >= 6) {
                // For target >= 6 hours, include break
                breakDuration = config.breakDuration;
            } else if (this.forceBreakCheckbox && this.forceBreakCheckbox.checked) {
                // For target < 6 hours, include break only if checkbox is checked
                breakDuration = config.breakDuration;
            }
        }
        
        return breakDuration;
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
        const config = this.configManager.getConfig();
        
        // Prüfe, ob Startzeit eingegeben wurde
        const startTime = this.startTimeInput.value;
        if (startTime) {
            const start = this.parseTime(startTime);
            if (start) {
                if (start > now) {
                    // Wenn Startzeit in der Zukunft liegt, setze voraussichtliche Endzeit basierend auf Zielarbeitszeit
                    const targetMinutes = config.targetHours * 60;
                    const breakDuration = this.getEffectiveBreakDuration(config);
                    
                    // Berechne voraussichtliche Endzeit (Startzeit + Zielarbeitszeit + Pause)
                    const estimatedEndTime = new Date(start.getTime() + (targetMinutes + breakDuration) * 60 * 1000);
                    const hours = estimatedEndTime.getHours().toString().padStart(2, '0');
                    const minutes = estimatedEndTime.getMinutes().toString().padStart(2, '0');
                    this.endTimeInput.value = `${hours}:${minutes}`;
                } else {
                    // Wenn Startzeit in der Vergangenheit liegt, aktuelle Zeit verwenden
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    this.endTimeInput.value = `${hours}:${minutes}`;
                }
                return;
            }
        }
        
        // Wenn keine Startzeit oder ungültige Startzeit, aktuelle Zeit verwenden
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

/**
 * Helper function to detect if running from file protocol
 */
function isRunningFromFileProtocol() {
    return window.location.protocol === 'file:';
}

/**
 * Display a warning message if running from file protocol
 */
function showFileProtocolWarning() {
    if (isRunningFromFileProtocol()) {
        console.warn(
            '%cACHTUNG: Diese Anwendung wird über das file:// Protokoll ausgeführt!',
            'color: #ff9800; font-weight: bold; font-size: 14px;'
        );
        console.warn(
            '%cFür die beste Erfahrung und um CORS-Probleme zu vermeiden, verwende bitte einen lokalen HTTP-Server:',
            'color: #ff9800;'
        );
        console.warn('%c1. Navigiere zum Projektordner in der Befehlszeile', 'color: #4caf50;');
        console.warn('%c2. Führe aus: python3 -m http.server', 'color: #4caf50;');
        console.warn('%c3. Öffne http://localhost:8000/src/ im Browser', 'color: #4caf50;');
    }
}

/**
 * Debugging helper to force a specific language
 * Kann für Tests verwendet werden
 */
function forceLanguage(lang) {
    try {
        const config = JSON.parse(localStorage.getItem('flexibleTimeCalculatorConfig')) || {};
        config.language = lang;
        localStorage.setItem('flexibleTimeCalculatorConfig', JSON.stringify(config));
        console.log(`Forced language to: ${lang}`);
        location.reload(); // Reload to apply changes
    } catch (e) {
        console.error('Failed to force language:', e);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Zeige Warnung, wenn die App über file:// ausgeführt wird
    showFileProtocolWarning();
    
    // Lade das Manifest dynamisch, um CORS-Probleme zu vermeiden
    if (navigator.serviceWorker) {
        try {
            // Erstelle ein Link-Element für das Manifest
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = 'assets/site.webmanifest';
            document.head.appendChild(manifestLink);
        } catch (e) {
            console.warn('Failed to add manifest dynamically:', e);
        }
    }
    
    // Starte die Anwendung
    const app = new FlexibleTimeCalculator();
    
    // Countdown-Button Funktionalität hinzufügen
    const countdownButton = document.getElementById('open-countdown');
    if (countdownButton) {
        countdownButton.addEventListener('click', () => {
            // Hole aktuelle Daten für den Countdown
            const endTime = document.getElementById('end-time').textContent;
            const timeBalance = document.getElementById('time-balance').textContent;
            
            // Überprüfe ob die Werte gültig sind
            if (endTime !== '--:--') {
                let url = 'countdown/countdown.html';
                
                // Wenn ein gültiges Ende vorliegt, übergebe es als Parameter
                if (endTime.match(/^\d{2}:\d{2}$/)) {
                    url += `?time=${endTime}`;
                    
                    // Prüfe, ob negative Zeit (Überstunden) vorliegt
                    if (timeBalance.startsWith('-')) {
                        url += '&negative=true';
                    }
                }
                
                // Öffne die Countdown-Seite
                window.location.href = url;
            } else {
                // Fallback: Öffne ohne Parameter
                window.location.href = 'countdown/countdown.html';
            }
        });
    }
    
    // Debug-Info in der Konsole anzeigen
    console.log('Debug-Befehle verfügbar:');
    console.log('- forceLanguage("de") - Erzwingt Deutsch als Sprache');
    console.log('- forceLanguage("en") - Erzwingt Englisch als Sprache');
});
