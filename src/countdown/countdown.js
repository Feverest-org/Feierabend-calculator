/**
 * Feierabend Countdown
 * Zeigt einen Countdown bis zum Feierabend an und zählt anschließend Überstunden hoch
 */

class CountdownManager {
    constructor() {
        // Elemente
        this.countdownDisplay = document.getElementById('countdown-display');
        this.countdownMessage = document.getElementById('countdown-message');
        this.countdownTitle = document.querySelector('.countdown-title'); // Titel für Ausblendung bei Überstunden
        this.backBtn = document.querySelector('.back-btn'); // Geändert: Verwende Klasse statt ID
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.enableAudio = document.getElementById('enable-audio');
        this.enableNotifications = document.getElementById('enable-notifications');
        this.modalClose = document.querySelector('#settings-modal .close');
        
        // Parameter
        this.targetTime = null;
        this.intervalId = null;
        this.isOvertime = false;
        this.overtimeStartTime = null;
        this.translationManager = new TranslationManager();
        this.configManager = new ConfigManager();
        this.themeManager = new ThemeManager();
        
        // Audio für Benachrichtigung
        this.audio = new Audio('../assets/notification.mp3');
        
        // Initialisierung
        this.initialize();
    }
    
    /**
     * Initialisiere den Countdown Manager
     */
    async initialize() {
        // Lade Übersetzungen
        await this.translationManager.loadTranslations();
        
        // Parameter aus URL auslesen
        const params = new URLSearchParams(window.location.search);
        const timeParam = params.get('time'); // Format: HH:MM oder Minuten
        const negativeParam = params.get('negative') === 'true';
        
        // Stelle sicher, dass wir eine Zeit haben
        if (timeParam) {
            this.setTargetTime(timeParam, negativeParam);
        } else {
            // Fallback: 8 Stunden ab jetzt
            const config = this.configManager.getConfig();
            const targetHours = config.targetHours || 8;
            this.setTargetTime(`${targetHours}:00`, false);
        }
        
        // Lade gespeicherte Einstellungen
        this.loadSettings();
        
        // Wende Übersetzungen an
        this.applyTranslations();
        
        // Event-Listener
        this.bindEvents();
        
        // Starte den Countdown
        this.startCountdown();
    }
    
    /**
     * Lade Einstellungen aus localStorage
     */
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('countdownSettings')) || {};
            this.enableAudio.checked = settings.audio === true;
            this.enableNotifications.checked = settings.notifications === true;
            
            // Prüfe, ob Benachrichtigungen erlaubt sind
            if (this.enableNotifications.checked && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        } catch (error) {
            console.error('Failed to load countdown settings:', error);
        }
    }
    
    /**
     * Speichere Einstellungen im localStorage
     */
    saveSettings() {
        try {
            const settings = {
                audio: this.enableAudio.checked,
                notifications: this.enableNotifications.checked
            };
            localStorage.setItem('countdownSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save countdown settings:', error);
        }
    }
    
    /**
     * Wende Übersetzungen auf UI-Elemente an
     * Verwendet die gleiche Methode wie in der Hauptseite
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
            
            // Update Dokumententitel
            document.title = this.translationManager.get('countdownTitle');
            
            // Erzeuge ein Event, um andere Komponenten zu informieren, dass Übersetzungen angewendet wurden
            document.dispatchEvent(new CustomEvent('translationsApplied', { 
                detail: { language: this.translationManager.currentLanguage }
            }));
        } catch (error) {
            console.error('Error applying translations:', error);
        }
    }
    
    /**
     * Event-Listener registrieren
     */
    bindEvents() {
        // Zurück-Button (nicht mehr notwendig, da es jetzt ein Link ist)
        // Der Link funktioniert bereits ohne Event-Listener
        
        // Einstellungen-Button und Modal
        this.settingsBtn.addEventListener('click', () => {
            this.openSettingsModal();
        });
        
        this.modalClose.addEventListener('click', () => {
            this.closeSettingsModal();
        });
        
        // Klick außerhalb des Modals schließt es
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
        
        // Audio-Einstellung
        this.enableAudio.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Benachrichtigungs-Einstellung
        this.enableNotifications.addEventListener('change', () => {
            if (this.enableNotifications.checked && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            this.saveSettings();
        });
        
        // Tastaturkürzel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.settingsModal.classList.contains('show')) {
                    this.closeSettingsModal();
                } else {
                    window.location.href = '../index.html';
                }
            }
        });
    }
    
    /**
     * Öffnet das Einstellungen-Modal
     */
    openSettingsModal() {
        this.settingsModal.classList.add('show');
    }
    
    /**
     * Schließt das Einstellungen-Modal
     */
    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }
    
    /**
     * Setze die Zielzeit basierend auf dem übergebenen Parameter
     * @param {string} timeValue - Zeit als "HH:MM" oder Minuten als Zahl
     * @param {boolean} isNegative - Ob die Zeit als negative Überstunden behandelt werden soll
     */
    setTargetTime(timeValue, isNegative = false) {
        let targetDate = new Date();
        
        if (isNegative) {
            // Bei negativer Zeit direkt Überstunden anzeigen
            this.isOvertime = true;
            this.overtimeStartTime = new Date();
            
            // Überstundenzeit in Minuten berechnen
            let minutes = 0;
            
            if (timeValue.includes(':')) {
                // Format HH:MM
                const [hours, mins] = timeValue.split(':').map(Number);
                minutes = (hours * 60) + mins;
            } else {
                // Format: Minuten
                minutes = parseInt(timeValue, 10);
            }
            
            // Setze eine fiktive Zielzeit in der Vergangenheit
            targetDate = new Date(targetDate.getTime() - minutes * 60 * 1000);
        } else {
            // Format prüfen
            if (timeValue.includes(':')) {
                // Format HH:MM
                const [hours, minutes] = timeValue.split(':').map(Number);
                
                // Setze die Stunden und Minuten für heute
                targetDate.setHours(hours, minutes, 0, 0);
                
                // Wenn die Zeit in der Vergangenheit liegt, behandle sie als Überstunden
                if (targetDate < new Date()) {
                    // Aktiviere Überstunden-Modus
                    this.isOvertime = true;
                    
                    // Berechne die Differenz zwischen der aktuellen Zeit und der Zielzeit
                    const currentTime = new Date();
                    const diffMs = currentTime - targetDate;
                    
                    // Die overtimeStartTime ist so weit in der Vergangenheit, dass die 
                    // Differenz zwischen jetzt und overtimeStartTime der bereits 
                    // verstrichenen Überstundenzeit entspricht
                    this.overtimeStartTime = new Date(currentTime.getTime() - diffMs);
                    
                    console.log(`Zeit in der Vergangenheit erkannt: ${targetDate.toLocaleTimeString()}, aktuelle Zeit: ${currentTime.toLocaleTimeString()}`);
                    console.log(`Überstunden gestartet mit Differenz: ${Math.floor(diffMs / 60000)} Minuten`);
                }
            } else {
                // Format: Minuten bis Feierabend
                const minutesToEnd = parseInt(timeValue, 10);
                targetDate = new Date(targetDate.getTime() + minutesToEnd * 60 * 1000);
            }
        }
        
        this.targetTime = targetDate;
        console.log(`Target time set to: ${this.targetTime.toLocaleTimeString()}, isOvertime: ${this.isOvertime}`);
    }
    
    /**
     * Starte den Countdown
     */
    startCountdown() {
        // Falls bereits ein Interval läuft, stoppe es
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Aktualisiere sofort zum Start
        this.updateCountdown();
        
        // Aktualisiere dann jede Sekunde
        this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    }
    
    /**
     * Aktualisiere den Countdown
     */
    updateCountdown() {
        const now = new Date();
        
        // Wenn wir bereits im Überstunden-Modus sind
        if (this.isOvertime) {
            const overtimeStart = this.overtimeStartTime || this.targetTime;
            const diffMs = now - overtimeStart;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            // Formatiere die Anzeige
            this.countdownDisplay.textContent = this.formatTime(hours, minutes, seconds, true);
            this.countdownDisplay.className = 'countdown-display countdown-overtime';
            
            // Ändere den Titel zu "Überstunden" und aktualisiere den Browser-Titel
            if (this.countdownTitle) {
                this.countdownTitle.textContent = this.translationManager.get('endOfWorkTitle') || 'Überstunden';
                this.countdownTitle.setAttribute('data-i18n', 'endOfWorkTitle');
                document.title = this.translationManager.get('endOfWorkTitle') || 'Überstunden';
            }
            
            // Nachricht
            const overtime = hours > 0 ? 
                `+${hours} ${this.translationManager.get(hours === 1 ? 'hour' : 'hours')} ${minutes} ${this.translationManager.get('minutes')}` :
                `+${minutes} ${this.translationManager.get('minutes')}`;
            
            this.countdownMessage.textContent = this.translationManager.get('overtimeMessage')
            
            return;
        }
        
        // Stelle sicher, dass der richtige Titel angezeigt wird, wenn keine Überstunden gemacht werden
        if (this.countdownTitle) {
            this.countdownTitle.textContent = this.translationManager.get('timeUntilEndTitle') || 'Zeit bis zum Feierabend';
            this.countdownTitle.setAttribute('data-i18n', 'timeUntilEndTitle');
            document.title = this.translationManager.get('countdownTitle') || 'Feierabend Countdown';
        }
        
        // Normale Countdown-Berechnung
        const diffMs = this.targetTime - now;
        
        // Prüfen, ob der Countdown abgelaufen ist
        if (diffMs <= 0) {
            // Countdown ist abgelaufen, Überstunden beginnen
            this.isOvertime = true;
            this.overtimeStartTime = new Date();
            
            // Benachrichtigung
            this.showEndOfWorkNotification();
            
            // Update sofort für Überstunden-Anzeige
            this.updateCountdown();
            return;
        }
        
        // Countdown berechnen
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        // Formatiere die Anzeige
        this.countdownDisplay.textContent = this.formatTime(hours, minutes, seconds);
        
        // Ändere die Farbe je nach verbleibender Zeit
        if (diffMs < 15 * 60 * 1000) { // Weniger als 15 Minuten
            this.countdownDisplay.className = 'countdown-display countdown-danger';
            this.countdownMessage.textContent = this.translationManager.get('almostDoneMessage') || 
                'Fast geschafft! Bald ist Feierabend.';
        } else if (diffMs < 30 * 60 * 1000) { // Weniger als 30 Minuten
            this.countdownDisplay.className = 'countdown-display countdown-warning';
            this.countdownMessage.textContent = this.translationManager.get('endingSoonMessage') || 
                'Der Arbeitstag neigt sich dem Ende zu.';
        } else {
            this.countdownDisplay.className = 'countdown-display countdown-regular';
            
            // Berechne den Prozentsatz der vergangenen Zeit
            const totalTimeMs = this.targetTime - this.calculateStartTime();
            const elapsedPercent = Math.floor(((totalTimeMs - diffMs) / totalTimeMs) * 100);
            
            this.countdownMessage.textContent = `${elapsedPercent}% ${this.translationManager.get('workdayCompleteMessage') || 'des Arbeitstages absolviert'}`;
        }
    }
    
    /**
     * Berechne die geschätzte Startzeit basierend auf der Zielzeit und der Arbeitszeit
     */
    calculateStartTime() {
        const config = this.configManager.getConfig();
        const targetHours = config.targetHours || 8;
        const breakMinutes = config.breakDuration || 30;
        
        // Startzeit berechnen (Zielzeit - Arbeitsstunden - Pause)
        const totalWorkMinutes = (targetHours * 60) + breakMinutes;
        return new Date(this.targetTime.getTime() - totalWorkMinutes * 60 * 1000);
    }
    
    /**
     * Formatiere die Zeit für die Anzeige
     */
    formatTime(hours, minutes, seconds, isOvertime = false) {
        const prefix = isOvertime ? '+' : '';
        return `${prefix}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Zeige eine Benachrichtigung zum Feierabend an
     */
    showEndOfWorkNotification() {
        // Audio-Benachrichtigung
        if (this.enableAudio.checked) {
            try {
                this.audio.play();
            } catch (error) {
                console.warn('Could not play audio notification:', error);
            }
        }
        
        // Desktop-Benachrichtigung
        if (this.enableNotifications.checked && Notification.permission === 'granted') {
            try {
                const notification = new Notification(
                    this.translationManager.get('endOfWorkTitle') || 'Feierabend!',
                    {
                        body: this.translationManager.get('endOfWorkMessage') || 'Dein Arbeitstag ist jetzt beendet. Zeit nach Hause zu gehen!',
                        icon: 'assets/favicon.svg'
                    }
                );
                
                // Schließe nach 10 Sekunden automatisch
                setTimeout(() => notification.close(), 10000);
            } catch (error) {
                console.warn('Could not show notification:', error);
            }
        }
    }
    
    // Die resetCountdown-Methode wurde entfernt, da sie nicht mehr benötigt wird
}

/**
 * Translation Manager - Importiert aus der Hauptanwendung
 * Verwendet die gleiche Implementierung wie die Hauptseite
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
            console.log('Attempting to load translations from ../translations.json');
            const response = await fetch('../translations.json');
            
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
                "countdownTitle": "Feierabend Countdown",
                "timeUntilEndTitle": "Time until end of work",
                "resetCountdown": "Reset",
                "backToCalculator": "Back to Calculator",
                "enableAudio": "Enable sound at end of work",
                "enableNotifications": "Enable desktop notifications",
                "notificationSettings": "Notification Settings",
                "endOfWorkTitle": "End of work!",
                "endOfWorkMessage": "Your workday has ended. Time to go home!",
                "overtimeMessage": "You are doing overtime!",
                "almostDoneMessage": "Almost done! End of work soon.",
                "endingSoonMessage": "The workday is coming to an end.",
                "workdayCompleteMessage": "of the workday completed",
                "hours": "hours",
                "hour": "hour",
                "minutes": "minutes"
            },
            "de": {
                "appTitle": "Feierabend Calculator",
                "countdownTitle": "Feierabend Countdown",
                "timeUntilEndTitle": "Zeit bis zum Feierabend",
                "resetCountdown": "Zurücksetzen",
                "backToCalculator": "Zurück zum Rechner",
                "enableAudio": "Ton bei Feierabend aktivieren",
                "enableNotifications": "Desktop-Benachrichtigungen aktivieren",
                "notificationSettings": "Benachrichtigungen",
                "endOfWorkTitle": "Feierabend!",
                "endOfWorkMessage": "Dein Arbeitstag ist jetzt beendet. Zeit nach Hause zu gehen!",
                "overtimeMessage": "Du machst Überstunden!",
                "almostDoneMessage": "Fast geschafft! Bald ist Feierabend.",
                "endingSoonMessage": "Der Arbeitstag neigt sich dem Ende zu.",
                "workdayCompleteMessage": "des Arbeitstages absolviert",
                "hours": "Stunden",
                "hour": "Stunde",
                "minutes": "Minuten"
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
 * Configuration Manager (gekürzte Version für die Countdown-Seite)
 */
class ConfigManager {
    constructor() {
        this.defaultConfig = {
            targetHours: 8,
            breakDuration: 30,
            theme: 'system',
            language: 'en'
        };
        this.config = { ...this.defaultConfig };
        this.loadConfig();
    }

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

    getConfig() {
        return { ...this.config };
    }
}

/**
 * Theme Manager (gekürzte Version für die Countdown-Seite)
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'system';
        this.loadTheme();
        this.applyTheme();
        this.setupMediaQuery();
    }

    loadTheme() {
        try {
            const savedConfig = localStorage.getItem('flexibleTimeCalculatorConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.theme && ['system', 'light', 'dark'].includes(config.theme)) {
                    this.currentTheme = config.theme;
                }
            }
        } catch (error) {
            console.warn('Failed to load theme, using system default:', error);
        }
    }

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
    }

    setupMediaQuery() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(() => {
            if (this.currentTheme === 'system') {
                this.applyTheme();
            }
        });
    }
}

// Initialisiere die Anwendung, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Prüfe, ob die Audio-Datei vorhanden ist, sonst erstelle sie
    fetch('assets/notification.mp3')
        .catch(() => {
            console.warn('Notification sound not found. Add a notification.mp3 file to the assets folder for sound notifications.');
        });
    
    // Countdown-Manager initialisieren
    const countdownManager = new CountdownManager();
});
