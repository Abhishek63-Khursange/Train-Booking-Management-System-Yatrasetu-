import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (    <footer className="footer" style={{ 
      backgroundColor: '#1a1a1a', 
      color: '#ffffff',
      padding: '1rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
          {/* Company Info */}
          <div className="col" style={{ flex: '1', minWidth: '250px' }}>            
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Indian Railways</h3>
            <p style={{ color: '#a3a3a3', lineHeight: '1.4', fontSize: '0.85rem' }}>
              Indian Railways, a cornerstone of India's transportation network since 1853, connects millions across the nation daily. We're committed to providing safe, comfortable, and efficient rail travel experiences for all our passengers.
            </p>
            <p style={{ color: '#a3a3a3', lineHeight: '1.4', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              24/7 Helpline: 139
              <br />
              Customer Care: 1800-111-139
            </p>
          </div>

          {/* Social Media Links */}
          <div className="col" style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1rem' }}>Connect With Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="https://facebook.com/indianrailways" target="_blank" rel="noopener noreferrer" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(120%)';
                  e.currentTarget.querySelector('span').style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(100%)';
                  e.currentTarget.querySelector('span').style.color = '#a3a3a3';
                }}>
                <i className="fab fa-facebook fa-lg" style={{ color: '#1877F2', transition: 'filter 0.3s' }}></i>
                <span style={{ color: '#a3a3a3', transition: 'color 0.3s' }}>Facebook</span>
              </a>
              <a href="https://instagram.com/indianrailways" target="_blank" rel="noopener noreferrer" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(120%)';
                  e.currentTarget.querySelector('span').style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(100%)';
                  e.currentTarget.querySelector('span').style.color = '#a3a3a3';
                }}>
                <i className="fab fa-instagram fa-lg" style={{ color: '#E4405F', transition: 'filter 0.3s' }}></i>
                <span style={{ color: '#a3a3a3', transition: 'color 0.3s' }}>Instagram</span>
              </a>
              <a href="https://twitter.com/indianrailways" target="_blank" rel="noopener noreferrer" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(120%)';
                  e.currentTarget.querySelector('span').style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(100%)';
                  e.currentTarget.querySelector('span').style.color = '#a3a3a3';
                }}>
                <i className="fab fa-twitter fa-lg" style={{ color: '#1DA1F2', transition: 'filter 0.3s' }}></i>
                <span style={{ color: '#a3a3a3', transition: 'color 0.3s' }}>Twitter</span>
              </a>
              <a href="https://youtube.com/indianrailways" target="_blank" rel="noopener noreferrer" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(120%)';
                  e.currentTarget.querySelector('span').style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(100%)';
                  e.currentTarget.querySelector('span').style.color = '#a3a3a3';
                }}>
                <i className="fab fa-youtube fa-lg" style={{ color: '#FF0000', transition: 'filter 0.3s' }}></i>
                <span style={{ color: '#a3a3a3', transition: 'color 0.3s' }}>YouTube</span>
              </a>
              <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(120%)';
                  e.currentTarget.querySelector('span').style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('i').style.filter = 'brightness(100%)';
                  e.currentTarget.querySelector('span').style.color = '#a3a3a3';
                }}>
                <i className="fab fa-whatsapp fa-lg" style={{ color: '#25D366', transition: 'filter 0.3s' }}></i>
                <span style={{ color: '#a3a3a3', transition: 'color 0.3s' }}>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Important Links */}          
          <div className="col" style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1rem' }}>Important Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link 
                to="/about" 
                style={{ color: '#a3a3a3', textDecoration: 'none', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                style={{ color: '#a3a3a3', textDecoration: 'none', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
              >
                Contact Us
              </Link>
              <Link 
                to="/terms" 
                style={{ color: '#a3a3a3', textDecoration: 'none', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
              >
                Terms Of Service
              </Link>
              <Link 
                to="/privacy" 
                style={{ color: '#a3a3a3', textDecoration: 'none', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>        
        
        {/* Bottom Bar */}        
        <div 
          style={{ 
            borderTop: '1px solid #333', 
            marginTop: '0.8rem', 
            paddingTop: '0.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ color: '#a3a3a3', fontSize: '0.85rem' }}>
            Copyright © {new Date().getFullYear()} Indian Railways
          </div>
        </div>
      </div>
    </footer>
  );
}
