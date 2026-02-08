import React from 'react';

const About = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem 1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Header Section */}
        <header style={{
          textAlign: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #eaeaea'
        }}>
          <h1 style={{
            color: '#2c3e50',
            margin: '0 0 1rem 0',
            fontSize: '2.2rem'
          }}>
            About Yatrasetu
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Your trusted partner in train travel and tourism services across India
          </p>
        </header>

        {/* Services Section */}
        <section style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          borderLeft: '4px solid #3498db'
        }}>
          <h2 style={{
            color: '#2c3e50',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Our Services
          </h2>
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { icon: '🚆', text: 'Train Ticket Booking' },
              { icon: '✈️', text: 'Flight Bookings' },
              { icon: '🏨', text: 'Hotel Reservations' },
              { icon: '🌍', text: 'Tour Packages' }
            ].map((service, index) => (
              <li key={index} style={{
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {service.icon} {service.text}
              </li>
            ))}
          </ul>
        </section>

        {/* Features Section */}
        <section style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          borderLeft: '4px solid #2ecc71'
        }}>
          <h2 style={{
            color: '#2c3e50',
            marginTop: 0,
            marginBottom: '1.5rem'
          }}>
            Why Choose Us?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { icon: '🔒', title: 'Secure Booking', text: 'Your transactions are 100% secure with bank-grade encryption.' },
              { icon: '⏱️', title: '24/7 Support', text: 'Round-the-clock customer service for all your travel needs.' },
              { icon: '🎫', title: 'Easy Cancellation', text: 'Simple and hassle-free cancellation process.' }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '1.25rem',
                backgroundColor: 'white',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  color: '#2c3e50',
                  marginTop: 0,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{feature.icon}</span> {feature.title}
                </h3>
                <p style={{
                  color: '#555',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          borderLeft: '4px solid #e74c3c',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#2c3e50',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Need Help?
          </h2>
          <p style={{
            color: '#555',
            marginBottom: '1.5rem',
            fontSize: '1.1rem'
          }}>
            Our customer care team is available 24/7 to assist you with any queries or concerns.
          </p>
          <button style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Contact Support
          </button>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '3rem',
          padding: '1.5rem',
          textAlign: 'center',
          borderTop: '1px solid #eaeaea',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <p>© {new Date().getFullYear()} Yatrasetu - Indian Railway Catering and Tourism Corporation</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
            A Government of India Enterprise
          </p>
        </footer>
      </div>
    </div>
  );
};

export default About;
