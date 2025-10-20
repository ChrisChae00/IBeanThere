'use client';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeDemoPage() {
  const { currentTheme } = useTheme();

  const colorSwatches = [
    { name: 'Primary', color: currentTheme.colors.primary },
    { name: 'Secondary', color: currentTheme.colors.secondary },
    { name: 'Accent', color: currentTheme.colors.accent },
    { name: 'Background', color: currentTheme.colors.background },
    { name: 'Surface', color: currentTheme.colors.surface },
    { name: 'Text', color: currentTheme.colors.text },
    { name: 'Text Secondary', color: currentTheme.colors.textSecondary },
    { name: 'Border', color: currentTheme.colors.border },
    { name: 'Success', color: currentTheme.colors.success },
    { name: 'Warning', color: currentTheme.colors.warning },
    { name: 'Error', color: currentTheme.colors.error },
  ];

  return (
    <div className="theme-demo-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Theme Demo - {currentTheme.displayName}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Experience the visual feel of different coffee-themed color palettes. 
          Use the theme selector in the top-right corner to switch between themes.
        </p>
      </div>

      {/* Color Palette Section */}
      <div className="demo-section">
        <h2>Color Palette</h2>
        <p>Current theme color scheme:</p>
        <div className="color-palette">
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className="color-swatch">
              <div 
                className="color-box"
                style={{ backgroundColor: swatch.color }}
              />
              <div className="color-name">{swatch.name}</div>
              <div className="color-code">{swatch.color}</div>
            </div>
          ))}
        </div>
      </div>

      {/* UI Components Section */}
      <div className="demo-section">
        <h2>UI Components</h2>
        <p>See how different UI elements look with the current theme:</p>
        
        <div style={{ margin: '1rem 0' }}>
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
        </div>

        <div className="card">
          <h3>Sample Card</h3>
          <p>This is a sample card component showing how text and backgrounds work together in this theme.</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Secondary text color for less important information.
          </p>
        </div>

        <div style={{ margin: '1rem 0' }}>
          <div className="status-message status-success">
            Success message: Everything looks great!
          </div>
          <div className="status-message status-warning">
            Warning message: Please check your input.
          </div>
          <div className="status-message status-error">
            Error message: Something went wrong.
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="demo-section">
        <h2>Typography</h2>
        <p>Text hierarchy and readability:</p>
        
        <h1 style={{ color: 'var(--color-primary)', margin: '1rem 0' }}>
          Heading 1 - Primary Color
        </h1>
        <h2 style={{ color: 'var(--color-text)', margin: '1rem 0' }}>
          Heading 2 - Text Color
        </h2>
        <h3 style={{ color: 'var(--color-text)', margin: '1rem 0' }}>
          Heading 3 - Text Color
        </h3>
        <p style={{ color: 'var(--color-text)', margin: '1rem 0' }}>
          This is a paragraph with regular text color. It should be easy to read against the background.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', margin: '1rem 0' }}>
          This is secondary text color, used for less important information or captions.
        </p>
      </div>

      {/* Theme Information */}
      <div className="demo-section">
        <h2>Theme Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Theme Name:</strong> {currentTheme.name}
          </div>
          <div>
            <strong>Display Name:</strong> {currentTheme.displayName}
          </div>
          <div>
            <strong>Primary Color:</strong> {currentTheme.colors.primary}
          </div>
          <div>
            <strong>Background:</strong> {currentTheme.colors.background}
          </div>
        </div>
      </div>
    </div>
  );
}
