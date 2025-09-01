# Flexible Time Calculator 🕐

A modern, responsive web application for calculating working hours and flexible time balance. Perfect for employees working with flexible schedules (Gleitzeit) who need to track their working hours and overtime balance.

## Features ✨

- **Time Calculation**: Calculate total working hours minus break time
- **Flexible Time Balance**: Track overtime or undertime against target hours
- **Smart Suggestions**: Real-time calculation of when to leave to meet target hours
- **History Tracking**: Automatically save and display recent calculations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Local Storage**: Your data is saved locally in your browser

## Live Demo 🌐

Open `index.html` in your web browser to start using the calculator.

## How to Use 📖

1. **Set the Date**: Select the working day (defaults to today)
2. **Enter Start Time**: When you started working
3. **Enter End Time**: When you finished working (or plan to finish)
4. **Set Break Duration**: Total break time in minutes (default: 30 minutes)
5. **Choose Target Hours**: Your required working hours for the day
6. **Calculate**: Click the calculate button to see your results

### Results Display

- **Total Time**: Total time spent at work (including breaks)
- **Working Hours**: Actual working time (total time minus breaks)
- **Target Hours**: Your required working hours
- **Flexible Time Balance**: Overtime (+) or undertime (-) in hours and minutes
- **Smart Suggestion**: When to leave to reach your target hours

## Technical Details 🛠️

### Technologies Used

- **HTML5**: Semantic markup with modern form elements
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, classes, and modern APIs
- **Local Storage**: Browser-based data persistence

### Code Architecture

- **Object-Oriented Design**: Main functionality encapsulated in `FlexibleTimeCalculator` class
- **Utility Functions**: Reusable time calculation utilities in `TimeUtils`
- **Responsive CSS**: Mobile-first design with progressive enhancement
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
2. Open `index.html` in a web browser
3. No build process required - it's vanilla HTML/CSS/JS

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
