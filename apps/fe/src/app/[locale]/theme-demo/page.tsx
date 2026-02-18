'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes/palettes';
import './theme-demo.css';

export default function ThemeDemoPage() {
  const { currentTheme } = useTheme();

  const colorSwatches = [
    { name: 'Primary', color: currentTheme.colors.primary },
    { name: 'Secondary', color: currentTheme.colors.secondary },
    { name: 'Accent', color: currentTheme.colors.accent },
    { name: 'Background', color: currentTheme.colors.background },
    { name: 'Surface', color: currentTheme.colors.surface },
    { name: 'Border', color: currentTheme.colors.border },
    { name: 'Card Background', color: currentTheme.colors.cardBackground },

    { name: 'Text', color: currentTheme.colors.text },
    { name: 'Text Secondary', color: currentTheme.colors.textSecondary },
    { name: 'Primary Text', color: currentTheme.colors.primaryText },
    { name: 'Text Hero', color: currentTheme.colors.textHero },
    { name: 'Card Text', color: currentTheme.colors.cardText },
    { name: 'Card Text Secondary', color: currentTheme.colors.cardTextSecondary },
    
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
        
        {/* Row 1: Primary Colors */}
        <div className="color-palette">
          {colorSwatches.slice(0, 3).map((swatch) => (
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

        {/* Row 2: Background Colors */}
        <div className="color-palette">
          {colorSwatches.slice(3, 7).map((swatch) => (
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

        {/* Row 3: Text Colors */}
        <div className="color-palette">
          {colorSwatches.slice(7, 13).map((swatch) => (
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

      {/* All Available Palettes Section */}
      <div className="demo-section">
        <h2>All Available Palettes</h2>
        <p>Browse all available coffee-themed color palettes:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          {Object.values(themes).map((theme) => (
            <div key={theme.name} className="palette-card">
              <h3 style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>
                {theme.displayName}
              </h3>
              <div className="palette-preview">
                <div className="palette-colors">
                  <div 
                    className="palette-color-large"
                    style={{ backgroundColor: theme.colors.primary }}
                    title={`Primary: ${theme.colors.primary}`}
                  />
                  <div className="palette-color-row">
                    <div 
                      className="palette-color-small"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title={`Secondary: ${theme.colors.secondary}`}
                    />
                    <div 
                      className="palette-color-small"
                      style={{ backgroundColor: theme.colors.accent }}
                      title={`Accent: ${theme.colors.accent}`}
                    />
                    <div 
                      className="palette-color-small"
                      style={{ backgroundColor: theme.colors.background }}
                      title={`Background: ${theme.colors.background}`}
                    />
                    <div 
                      className="palette-color-small"
                      style={{ backgroundColor: theme.colors.surface }}
                      title={`Surface: ${theme.colors.surface}`}
                    />
                  </div>
                </div>
                <div className="palette-info">
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                    <div><strong>Primary:</strong> {theme.colors.primary}</div>
                    <div><strong>Background:</strong> {theme.colors.background}</div>
                    <div><strong>Text:</strong> {theme.colors.text}</div>
                  </div>
                </div>
              </div>
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
          <p style={{ color: 'var(--color-textSecondary)' }}>
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
        <p style={{ color: 'var(--color-textSecondary)', margin: '1rem 0' }}>
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
