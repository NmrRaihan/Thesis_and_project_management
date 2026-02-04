# Component Separation Guide

This guide explains how to separate React JSX components into distinct HTML, CSS, and JavaScript files.

## Separation Strategy

### 1. File Structure
For each component, create three files:
- `ComponentName.html` - Structure and markup
- `ComponentName.css` - Styles and presentation
- `ComponentName.js` - Logic and dynamic behavior

### 2. HTML Structure
- Convert JSX to standard HTML
- Replace React-specific attributes with standard HTML equivalents
- Use semantic HTML elements where possible
- Maintain the same DOM hierarchy

### 3. CSS Conversion
- Replace Tailwind utility classes with standard CSS
- Create meaningful class names following BEM methodology
- Extract colors, spacing, and other values into CSS variables if needed
- Maintain responsive design with media queries

### 4. JavaScript Logic
- Keep data structures and constants in the JS file
- Implement DOM manipulation for dynamic content
- Use event listeners for interactivity
- Export functions that might be needed by other components

## Implementation Process

### Step 1: Analyze the JSX Component
Identify these key parts:
- Static content that can be moved directly to HTML
- Dynamic content that needs JavaScript handling
- Styling classes that need CSS conversion
- Event handlers and interactive elements

### Step 2: Create the HTML File
- Set up basic HTML structure with doctype and meta tags
- Link to the CSS and JavaScript files
- Move static JSX content to HTML, converting JSX syntax to HTML
- Add placeholders or comments for dynamic content

### Step 3: Create the CSS File
- Convert Tailwind classes to standard CSS rules
- Organize styles logically (layout, components, utilities)
- Use CSS Grid/Flexbox for layout instead of utility classes
- Implement responsive design with media queries

### Step 4: Create the JavaScript File
- Move data structures and constants from JSX to JS
- Implement functions to populate dynamic content
- Add event listeners for interactivity
- Use DOMContentLoaded event to initialize the component

### Step 5: Connect the Files
- Ensure proper linking between HTML, CSS, and JS
- Test that dynamic content populates correctly
- Verify that styles are applied properly
- Confirm that interactive elements work as expected

## Example Implementation

See the Home component files for a complete example:
- [Home.html](./Home.html)
- [Home.css](./Home.css)
- [Home.js](./Home.js)

## Benefits of Separation

1. **Clear Separation of Concerns**: Each technology handles its specific role
2. **Better Maintainability**: Changes to one layer don't affect others
3. **Improved Performance**: Smaller, focused files
4. **Enhanced Collaboration**: Different team members can work on different layers
5. **Accessibility**: Standard HTML is more accessible to tools and search engines

## Migration Process for Existing Components

1. Identify components that need separation
2. Follow the process outlined above for each component
3. Test thoroughly to ensure functionality is preserved
4. Update any routing or import references
5. Remove the original JSX file once migration is complete