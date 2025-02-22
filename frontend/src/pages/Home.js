import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to Travel Seattle Insights</h1>
      <p>Discover the best of Seattle with our travel guides, hotel recommendations, and curated tours.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/attractions">
          <button style={{ margin: '5px' }}>Explore Attractions</button>
        </Link>
        <Link to="/hotels">
          <button style={{ margin: '5px' }}>Find Hotels</button>
        </Link>
        <Link to="/tours">
          <button style={{ margin: '5px' }}>Book Tours</button>
        </Link>
        <Link to="/contact">
          <button style={{ margin: '5px' }}>Contact Us</button>
        </Link>
        <button onClick={() => alert('Learn more about Seattle!')} style={{ margin: '5px' }}>
          Learn More
        </button>
      </div>
      <h2>Why Visit Seattle?</h2>
      <p>From the iconic Space Needle to the vibrant Pike Place Market, Seattle offers a blend of urban charm and natural beauty.</p>
    </div>
  );
}

export default Home;