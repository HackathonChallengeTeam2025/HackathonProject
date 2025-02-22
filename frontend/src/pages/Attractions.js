import React from 'react';
import { Link } from 'react-router-dom';

function Attractions() {
  return (
    <div>
      <h1>Seattle Attractions</h1>
      <p>Explore the top sights in Seattle!</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Space Needle: 400 ft tall!')} style={{ margin: '5px' }}>
          Space Needle Details
        </button>
        <button onClick={() => alert('Pike Place: Famous market since 1907')} style={{ margin: '5px' }}>
          Pike Place Market Details
        </button>
        <button onClick={() => alert('Chihuly: Stunning glass art')} style={{ margin: '5px' }}>
          Chihuly Garden Details
        </button>
        <button onClick={() => alert('Ferry: Scenic ride across Puget Sound')} style={{ margin: '5px' }}>
          Ferry Ride Details
        </button>
        <Link to="/">
          <button style={{ margin: '5px' }}>Back to Home</button>
        </Link>
      </div>
      <h2>Plan Your Visit</h2>
      <p>Each attraction offers a unique experience—click above for more info!</p>
    </div>
  );
}

export default Attractions;