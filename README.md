# Feierabend Calculator 🌅

A modern, responsive web application for calculating working hours and flexible time balance. Perfect for employees working with flexible schedules (Gleitzeit) who need to track their working hours and overtime balance.

## Features ✨

- **Time Calculation**: Calculate working hours with automatic break time deduction
- **Flexible Time Balance**: Track overtime or undertime against configurable target hours
- **Smart Suggestions**: Real-time calculation of when to leave to meet target hours
- **Automatic End Time**: Current time automatically fills in the end time field if not manually set
- **Theme Options**: Choose between light, dark, or system theme
- **Language Support**: Available in German and English
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Local Storage**: Your preferences and settings are saved locally in your browser

## Live Demo 🌐

Visit [feierabend.feverest.de](https://feierabend.feverest.de) to try the calculator online.

## How to Use 📖

1. **Enter Start Time**: When you started working
2. **End Time**: Either leave empty to use current time (updates automatically) or enter manually
3. **Current Overtime Balance**: Your existing overtime balance in decimal hours (optional)
4. **Configure Settings**: Click the gear icon to configure:
   - **Working Hours**: Set your target working hours (4, 6, 7, 7.5, 8, or custom)
   - **Break Duration**: Choose your break time (0, 15, 30, 45, 60 minutes, or custom)
   - **Theme**: Select system, light, or dark theme
   - **Language**: Choose German or English

### Results Display

- **Working Hours**: Calculated working time (total time minus breaks)
- **Target Hours**: Your required working hours for the day
- **Today's Estimated Balance**: Today's overtime (+) or undertime (-) in hours and minutes
- **New Estimated Balance**: Updated total balance including previous overtime
- **Smart Suggestion**: When to leave to reach your target hours

## Technical Details 🛠️

### Technologies Used

- **HTML5**: Semantic markup with modern form elements
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, classes, and modern APIs
- **Local Storage**: Browser-based data persistence
- **Font Awesome**: For icons in the user interface
- **Google Fonts**: Inter font family for clean typography

### Code Architecture

- **Object-Oriented Design**: Main functionality encapsulated in classes:
  - `FlexibleTimeCalculator`: Core application logic
  - `ConfigManager`: Handles user preferences and settings
  - `ThemeManager`: Manages theme switching and persistence
- **Responsive CSS**: Mobile-first design with progressive enhancement
- **CSS Variables**: Theming support with CSS custom properties
- **Accessibility**: Semantic HTML and proper form labeling

### Browser Compatibility

- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- ES6+ support required
- Local Storage support required

## File Structure 📁

```
Feierabend-calculator/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md          # Project documentation
```

## Customization 🎨

### Color Scheme

The application uses CSS custom properties (variables) for easy theming. Main colors can be changed in the `:root` section of `styles.css`:

```css
:root {
    --primary-color: #3b82f6;    /* Blue */
    --success-color: #10b981;    /* Green */
    --danger-color: #ef4444;     /* Red */
    --background-color: #f8fafc; /* Light gray */
}
```

### Target Hours Options

Default target hours can be modified in the HTML select element:

```html
<select id="target-hours" name="targetHours" class="input">
    <option value="8">8 hours</option>
    <option value="7.5">7.5 hours</option>
    <!-- Add more options as needed -->
</select>
```

### Break Duration

Default break duration is set to 30 minutes but can be customized:

```html
<input type="number" id="break-duration" name="breakDuration" 
       class="input" min="0" max="480" value="30" required>
```

## Development 💻

### Local Development

1. Clone or download the repository
2. Navigate to the `src` directory
3. Open `index.html` in a web browser
4. No build process required - it's vanilla HTML/CSS/JS

## License & Attribution 📝

### Fonts and Icons

- **Inter Font**: [Open Font License (OFL)](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL) - Free to use, modify, and distribute
- **Font Awesome Icons**: [Font Awesome Free License](https://fontawesome.com/license/free) - Free to use for personal and commercial projects

## Deployment 🚀

The application is deployed and accessible at [feierabend.feverest.de](https://feierabend.feverest.de).

## About 🧠

Developed by [Surice](https://github.com/Surice) - A simple, efficient tool to help manage flexible working hours and maintain work-life balance.

### Testing

The application includes input validation and error handling:

- Start time must be before end time
- Break duration must be between 0 and 480 minutes
- All required fields must be filled

### Adding Features

The modular structure makes it easy to extend:

- Add new calculation methods to the `FlexibleTimeCalculator` class
- Create additional utility functions in `TimeUtils`
- Extend the CSS for new UI components

## Deployment 🚀

### Static Hosting

This application can be deployed to any static hosting service:

- **GitHub Pages**: Push to a repository and enable Pages
- **Netlify**: Drag and drop the files to Netlify
- **Vercel**: Connect your Git repository
- **AWS S3**: Upload files to an S3 bucket with static hosting

### Local Server

For development, you can use any local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

## Privacy & Data 🔒

- **No Server Communication**: All calculations happen in your browser
- **Local Storage Only**: Data is saved locally and never transmitted
- **No Tracking**: No analytics or tracking scripts included
- **GDPR Compliant**: No personal data collection

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

- Follow ES6+ JavaScript standards
- Use semantic HTML5 elements
- Maintain responsive design principles
- Add comments for complex logic
- Test on multiple browsers and devices

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Support 💡

If you encounter any issues or have suggestions for improvements:

1. Check the browser console for error messages
2. Ensure your browser supports modern JavaScript features
3. Try clearing your browser's local storage if you encounter data issues

## Roadmap 🗺️

Future enhancements could include:

- [ ] Export data to CSV/PDF
- [ ] Weekly/monthly reports
- [ ] Multiple target hour profiles
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Data backup/restore
- [ ] Integration with calendar apps
- [ ] Team/company time tracking features

---

**Built with ❤️ using modern web technologies**
