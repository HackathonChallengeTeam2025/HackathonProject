import React from 'react';
import { Link } from 'react-router-dom';

function Tours() {
  return (
    <div>
      <h1>Seattle Tours</h1>
      <p>Join a guided tour to experience Seattle like a local.</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('City Tour booked!')} style={{ margin: '5px' }}>
          Book City Tour
        </button>
        <button onClick={() => alert('Harbor Cruise booked!')} style={{ margin: '5px' }}>
          Book Harbor Cruise
        </button>
        <button onClick={() => alert('Details: Explore Mt. Rainier')} style={{ margin: '5px' }}>
          Mountain Tour Details
        </button>
        <button onClick={() => alert('Details: Taste Seattle’s best')} style={{ margin: '5px' }}>
          Food Tour Details
        </button>
        <Link to="/">
          <button style={{ margin: '5px' }}>Back to Home</button>
        </Link>
      </div>
      <h2>Tour Highlights</h2>
      <p>Discover hidden gems and iconic landmarks with our expert guides.</p>
    </div>
  );
}

export default Tours;