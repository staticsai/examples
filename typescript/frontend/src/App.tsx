import React, { useState, useEffect } from 'react';
import { StaticsLogin } from '@staticsai/statics-react'

const API_BASE_URL = 'http://localhost:8193';

function App() {
  const [link, setLink] = useState<{ linkid: string; linktoken: string } | null>(null)

  const getLink = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/link`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setLink(data);
    } catch (error) {
      console.error('Error fetching link:', error);
    }
  }

  const handleConnected = async () => {    
    // Notify the backend that the connection is complete
    try {
      const response = await fetch(`${API_BASE_URL}/complete/${link?.linkid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to notify backend of completion');
      }

      console.log('Backend notified of connection completion');
    } catch (error) {
      console.error('Error notifying backend:', error);
    }
  }

  // Use effect to fetch link on component mount
  useEffect(() => {
    getLink();
  }, []);

  return (
    <div>
      {link && 
        <StaticsLogin
        link={{
          id: link.linkid,
          linkToken: link.linktoken
        }}
        onConnected={handleConnected}
        />
      }
    </div>
  );
}

export default App;
