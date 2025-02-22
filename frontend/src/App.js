import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  redButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  cartButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  backButton: {
    color: '#3b82f6',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '20px',
    cursor: 'pointer',
  },
  chatbox: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '300px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  chatMessages: {
    height: '300px',
    padding: '16px',
    overflowY: 'auto',
  },
  chatInput: {
    display: 'flex',
    borderTop: '1px solid #ddd',
  },
  chatInputField: {
    flex: 1,
    padding: '8px',
    border: 'none',
    outline: 'none',
  },
  message: {
    marginBottom: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    color: 'white',
    marginLeft: 'auto',
  },
  systemMessage: {
    backgroundColor: '#f3f4f6',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '15px',
  },
  loginContainer: {
    maxWidth: '400px',
    margin: '100px auto',
  },
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  cartItem: {
    borderBottom: '1px solid #ddd',
    padding: '15px 0',
  }
};

const FoodOrderingApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [lastClickedButton, setLastClickedButton] = useState('');
  const [messages, setMessages] = useState([]);
  const pageRef = useRef(null);

  const foodItems = [
    {
      id: 1,
      name: 'Pizza',
      price: 12.99,
      description: 'A delicious pizza with your choice of toppings',
      ingredients: ['Cheese', 'Tomato Sauce', 'Pepperoni', 'Mushrooms', 'Onions', 'Bell Peppers']
    },
    {
      id: 2,
      name: 'Burger',
      price: 8.99,
      description: 'Classic beef burger with custom toppings',
      ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Onions', 'Cheese', 'Pickles']
    },
    {
      id: 3,
      name: 'Salad',
      price: 7.99,
      description: 'Fresh garden salad with your choice of ingredients',
      ingredients: ['Lettuce', 'Tomatoes', 'Cucumbers', 'Carrots', 'Croutons', 'Dressing']
    }
  ];

  const processQuery = async () => {
    const canvas = await html2canvas(pageRef.current);
    const screenshot = canvas.toDataURL('image/png');
    const clickableElements = Array.from(
      pageRef.current.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    )
      .filter((el) => el.innerText && el.innerText.trim() !== '')
      .map((el) => ({ innerText: el.innerText.trim() }));

    if (clickableElements.length === 0) {
      alert('No clickable elements found on the page.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clickableComponents: clickableElements,
          query,
          thread_id: threadId,
          current_url: window.location.href,
          last_clicked_button: lastClickedButton,
          screenshot
        }),
      });

      const data = await response.json();
      const { instruction, new_thread_id, goal_achived } = data;
      
      if (new_thread_id) {
        setThreadId(new_thread_id);
      }
      if (goal_achived) {
        setMessages(prev => [...prev, { text: 'Goal achieved!', type: 'system' }]);
      } else {
        executeInstruction(instruction);
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setMessages(prev => [...prev, { text: 'Error communicating with backend.', type: 'error' }]);
    }
  };

  const executeInstruction = (innerText) => {
    const element = Array.from(
      pageRef.current.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    ).find(el => el.innerText.trim() === innerText);

    if (element) {
      element.click();
      setLastClickedButton(innerText);
      setMessages(prev => [...prev, { text: `Executed: ${innerText}`, type: 'system' }]);
    } else {
      setMessages(prev => [...prev, { text: `Element "${innerText}" not found`, type: 'error' }]);
    }
  };

  const sendQuery = () => {
    if (query.trim()) {
      setMessages(prev => [...prev, { text: query, type: 'user' }]);
      processQuery();
      setQuery('');
    }
  };

  const addToCart = (selectedIngredients) => {
    setCart([...cart, { ...selectedItem, selectedIngredients }]);
    setCurrentPage('menu');
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setMessages(prev => [...prev, { text: 'Order placed successfully!', type: 'system' }]);
    setCart([]);
    setCurrentPage('menu');
  };

  return (
    <div ref={pageRef} style={styles.container}>
      {/* Login Page */}
      {currentPage === 'login' && (
        <div style={styles.loginContainer}>
          <div style={styles.card}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage('menu');
            }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input type="text" required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" required style={styles.input} />
              </div>
              <button type="submit" style={styles.button}>Login</button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Page */}
      {currentPage === 'menu' && (
        <div style={styles.pageContainer}>
          <h2 style={styles.title}>Menu</h2>
          {cart.length > 0 && (
            <button
              style={styles.cartButton}
              onClick={() => setCurrentPage('cart')}
            >
              Cart ({cart.length})
            </button>
          )}
          <div style={styles.gridContainer}>
            {foodItems.map(item => (
              <div key={item.id} style={styles.card}>
                <h3 style={styles.subtitle}>{item.name}</h3>
                <p style={{ marginBottom: '15px' }}>${item.price}</p>
                <button
                  style={styles.button}
                  onClick={() => {
                    setSelectedItem(item);
                    setCurrentPage('details');
                  }}
                >
                  {`${item.name} - Details`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Page */}
      {currentPage === 'details' && selectedItem && (
        <div style={styles.pageContainer}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('menu')}
          >
            ← Back to Menu
          </button>
          <div style={styles.card}>
            <h2 style={styles.title}>{selectedItem.name}</h2>
            <p style={{ marginBottom: '20px' }}>{selectedItem.description}</p>
            <h3 style={styles.subtitle}>Select Your Ingredients:</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const selectedIngredients = Array.from(e.target.elements)
                .filter(el => el.type === 'checkbox' && el.checked)
                .map(el => el.value);
              addToCart(selectedIngredients);
            }}>
              <div style={{ marginBottom: '20px' }}>
                {selectedItem.ingredients.map(ingredient => (
                  <div key={ingredient} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" value={ingredient} style={{ marginRight: '8px' }} />
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
              <button type="submit" style={styles.button}>
                Add to Cart - ${selectedItem.price}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cart Page */}
      {currentPage === 'cart' && (
        <div style={styles.pageContainer}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('menu')}
          >
            ← Back to Menu
          </button>
          <div style={styles.card}>
            <h2 style={styles.title}>Your Cart</h2>
            <div>
              {cart.map((item, index) => (
                <div key={index} style={styles.cartItem}>
                  <h3 style={styles.subtitle}>{item.name} - ${item.price}</h3>
                  <p style={{ marginBottom: '10px' }}>
                    Selected ingredients: {item.selectedIngredients.join(', ')}
                  </p>
                  <button
                    style={styles.redButton}
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <h3 style={styles.subtitle}>Total: ${getCartTotal()}</h3>
              <button
                style={styles.button}
                onClick={() => setCurrentPage('payment')}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Page */}
      {currentPage === 'payment' && (
        <div style={styles.pageContainer}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('cart')}
          >
            ← Back to Cart
          </button>
          <div style={styles.card}>
            <h2 style={styles.title}>Payment Details</h2>
            <form onSubmit={handlePayment}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  required
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    required
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Delivery Address</label>
                <textarea
                  required
                  rows="3"
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={styles.button}>
                Pay Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Box */}
      <div style={styles.chatbox}>
        <div style={styles.chatMessages}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(message.type === 'user'
                  ? styles.userMessage
                  : message.type === 'error'
                  ? styles.errorMessage
                  : styles.systemMessage)
              }}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div style={styles.chatInput}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.chatInputField}
            placeholder="Type a message..."
          />
          <button
            onClick={sendQuery}
            style={styles.button}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderingApp;