# Separated Components

This directory contains examples of React JSX components that have been separated into pure HTML, CSS, and JavaScript files.

## Structure

Each component is divided into three distinct files:
- `.html` - Contains the markup structure
- `.css` - Contains all styling
- `.js` - Contains the logic and dynamic behavior

## Example Component

The `Home` component demonstrates this separation:
- [Home.html](./Home.html) - Markup structure
- [Home.css](./Home.css) - Styling
- [Home.js](./Home.js) - Logic and dynamic content

## Running the Example

To view the separated components in a browser:

1. Start the server:
   ```bash
   npm run serve-separated
   ```

2. Open your browser to:
   ```
   http://localhost:3000
   ```

## How It Works

1. The server serves the HTML file when you visit the root path
2. The HTML file links to the CSS and JavaScript files
3. The CSS provides all styling for the component
4. The JavaScript handles dynamic content population and interactivity

## Benefits

This separation approach provides:
- Clear separation of concerns
- Better maintainability
- Improved performance
- Enhanced collaboration possibilities
- Better accessibility

## Integration Guide

For detailed instructions on how to separate your own components, see the [SEPARATION_GUIDE.md](./SEPARATION_GUIDE.md).