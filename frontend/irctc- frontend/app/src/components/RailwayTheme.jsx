import React from 'react';

const RailwayTheme = () => {
  const theme = {
    colors: {
      primary: '#1a237e',      // Indian Railway Blue
      secondary: '#ff6b35',     // Indian Railway Orange
      success: '#28a745',      // Green
      warning: '#ffc107',      // Yellow
      danger: '#dc3545',       // Red
      light: '#f8f9fa',       // Light background
      dark: '#343a40',        // Dark background
      info: '#17a2b8',        // Info blue
      railway: '#8b4513',      // Railway brown
      gold: '#ffd700'          // Gold accent
    },
    fonts: {
      primary: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      heading: '"Arial Black", Gadget, sans-serif',
      mono: '"Courier New", Courier, monospace'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 6px rgba(0,0,0,0.15)',
      lg: '0 10px 15px rgba(0,0,0,0.2)'
    },
    gradients: {
      railway: 'linear-gradient(135deg, #1a237e 0%, #2c3e50 50%, #1a237e 100%)',
      sunset: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      ocean: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'
    }
  };

  // Inject theme styles into document
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --railway-primary: ${theme.colors.primary};
        --railway-secondary: ${theme.colors.secondary};
        --railway-success: ${theme.colors.success};
        --railway-warning: ${theme.colors.warning};
        --railway-danger: ${theme.colors.danger};
        --railway-light: ${theme.colors.light};
        --railway-dark: ${theme.colors.dark};
        --railway-info: ${theme.colors.info};
        --railway-brown: ${theme.colors.railway};
        --railway-gold: ${theme.colors.gold};
        
        --railway-font-primary: ${theme.fonts.primary};
        --railway-font-heading: ${theme.fonts.heading};
        --railway-font-mono: ${theme.fonts.mono};
        
        --railway-spacing-xs: ${theme.spacing.xs};
        --railway-spacing-sm: ${theme.spacing.sm};
        --railway-spacing-md: ${theme.spacing.md};
        --railway-spacing-lg: ${theme.spacing.lg};
        --railway-spacing-xl: ${theme.spacing.xl};
        
        --railway-radius-sm: ${theme.borderRadius.sm};
        --railway-radius-md: ${theme.borderRadius.md};
        --railway-radius-lg: ${theme.borderRadius.lg};
        --railway-radius-full: ${theme.borderRadius.full};
        
        --railway-shadow-sm: ${theme.shadows.sm};
        --railway-shadow-md: ${theme.shadows.md};
        --railway-shadow-lg: ${theme.shadows.lg};
        
        --railway-gradient-primary: ${theme.gradients.railway};
        --railway-gradient-secondary: ${theme.gradients.sunset};
        --railway-gradient-info: ${theme.gradients.ocean};
      }
      
      body {
        font-family: var(--railway-font-primary);
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        position: relative;
      }
      
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f5f7fa" width="100" height="100"/><path fill="%23e8eef5" d="M0 50 Q 25 30 50 50 T 100 50" opacity="0.3"/><path fill="%23e8eef5" d="M0 50 Q 25 70 50 50 T 100 50" opacity="0.3"/></svg>');
        background-size: 100px 100px;
        opacity: 0.05;
        z-index: -1;
      }
      
      .navbar {
        background: var(--railway-gradient-primary) !important;
        box-shadow: var(--railway-shadow-md);
        border-bottom: 3px solid var(--railway-secondary);
      }
      
      .navbar-brand {
        font-family: var(--railway-font-heading);
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .card {
        background: white;
        border: none;
        border-radius: var(--railway-radius-lg);
        box-shadow: var(--railway-shadow-md);
        border-left: 4px solid var(--railway-primary);
        transition: all 0.3s ease;
      }
      
      .card:hover {
        transform: translateY(-2px);
        box-shadow: var(--railway-shadow-lg);
        border-left-color: var(--railway-secondary);
      }
      
      .btn-primary {
        background: var(--railway-gradient-primary);
        border: none;
        border-radius: var(--railway-radius-md);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .btn-primary:hover::before {
        left: 100%;
      }
      
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: var(--railway-shadow-md);
      }
      
      .alert {
        border: none;
        border-radius: var(--railway-radius-md);
        border-left: 4px solid var(--railway-primary);
      }
      
      .alert-success {
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        border-left-color: var(--railway-success);
        color: #155724;
      }
      
      .alert-danger {
        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        border-left-color: var(--railway-danger);
        color: #721c24;
      }
      
      .alert-warning {
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border-left-color: var(--railway-warning);
        color: #856404;
      }
      
      .booking-card-hover {
        position: relative;
        overflow: hidden;
      }
      
      .booking-card-hover::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ffffff" width="100" height="100"/><path fill="%23e8eef5" d="M0 20 L 100 20 L 100 25 L 0 25 Z" opacity="0.1"/><path fill="%23e8eef5" d="M0 40 L 100 40 L 100 45 L 0 45 Z" opacity="0.1"/><path fill="%23e8eef5" d="M0 60 L 100 60 L 100 65 L 0 65 Z" opacity="0.1"/><path fill="%23e8eef5" d="M0 80 L 100 80 L 100 85 L 0 85 Z" opacity="0.1"/></svg>');
        background-size: 50px 50px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .booking-card-hover:hover::after {
        opacity: 1;
      }
      
      .hero-section {
        background: var(--railway-gradient-primary);
        color: white;
        padding: 4rem 0;
        position: relative;
        overflow: hidden;
      }
      
      .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%231a237e" width="200" height="200"/><path fill="%23ffffff" opacity="0.05" d="M0 100 Q 50 80 100 100 T 200 100"/><path fill="%23ffffff" opacity="0.05" d="M0 100 Q 50 120 100 100 T 200 100"/><circle fill="%23ff6b35" opacity="0.1" cx="50" cy="50" r="30"/></svg>');
        background-size: 200px 200px;
        opacity: 0.1;
      }
      
      .train-icon {
        color: var(--railway-primary);
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(26,35,126,0.3));
      }
      
      .seat-available {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        border: 2px solid var(--railway-success);
        color: white;
        transition: all 0.3s ease;
      }
      
      .seat-booked {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        border: 2px solid var(--railway-danger);
        color: white;
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .seat-selected {
        background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
        border: 2px solid var(--railway-warning);
        color: var(--railway-dark);
        animation: seatPulse 1.5s infinite;
      }
      
      @keyframes seatPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .loading-spinner {
        border: 3px solid var(--railway-light);
        border-top: 3px solid var(--railway-primary);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .stats-card {
        background: white;
        border-radius: var(--railway-radius-lg);
        padding: 1.5rem;
        text-align: center;
        box-shadow: var(--railway-shadow-md);
        border-top: 4px solid var(--railway-primary);
        transition: all 0.3s ease;
      }
      
      .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--railway-shadow-lg);
      }
      
      .stats-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--railway-primary);
        margin-bottom: 0.5rem;
      }
      
      .page-header {
        background: var(--railway-gradient-primary);
        color: white;
        padding: 2rem 0;
        margin-bottom: 2rem;
        text-align: center;
        position: relative;
      }
      
      .page-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a237e" width="100" height="100"/><path fill="%23ffffff" opacity="0.1" d="M0 0 L 100 0 L 100 100 L 0 100 Z"/></svg>');
        background-size: 100px 100px;
        opacity: 0.1;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};

export default RailwayTheme;
