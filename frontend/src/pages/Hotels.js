import React from 'react';
import { Link } from 'react-router-dom';

function Hotels() {
  return (
    <div>
      <h1>Hotels in Seattle</h1>
      <p>Find the perfect stay for your Seattle adventure.</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Booked at The Edgewater!')} style={{ margin: '5px' }}>
          Book The Edgewater
        </button>
        <button onClick={() => alert('Booked at Fairmont Olympic!')} style={{ margin: '5px' }}>
          Book Fairmont Olympic
        </button>
        <button onClick={() => alert('Details: Downtown luxury')} style={{ margin: '5px' }}>
          Hilton Details
        </button>
        <button onClick={() => alert('Details: Budget-friendly stay')} style={{ margin: '5px' }}>
          Motel 6 Details
        </button>
        <Link to="/">
          <button style={{ margin: '5px' }}>Back to Home</button>
        </Link>
      </div>
      <h2>Stay in Style</h2>
      <p>From luxury to budget, we’ve got options for every traveler.</p>
    </div>
  );
}

export default Hotels;