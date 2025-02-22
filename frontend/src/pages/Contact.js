import React from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>Get in touch for travel inquiries or support.</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Email sent!')} style={{ margin: '5px' }}>
          Send Email
        </button>
        <button onClick={() => alert('Calling 1-800-SEATTLE')} style={{ margin: '5px' }}>
          Call Us
        </button>
        <button onClick={() => alert('Chat support opened')} style={{ margin: '5px' }}>
          Live Chat
        </button>
        <button onClick={() => alert('FAQ page opened')} style={{ margin: '5px' }}>
          View FAQ
        </button>
        <Link to="/">
          <button style={{ margin: '5px' }}>Back to Home</button>
        </Link>
      </div>
      <h2>We’re Here to Help</h2>
      <p>Reach out anytime—we’d love to assist with your Seattle trip!</p>
    </div>
  );
}

export default Contact;