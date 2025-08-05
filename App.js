import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Button, Flex, View, Heading } from '@aws-amplify/ui-react';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const theme = {
  name: 'modern-theme',
  tokens: {
    colors: {
      brand: {
        primary: { 10: '#87ceeb', 80: '#5dade2', 90: '#3498db' },
        secondary: { 10: '#a8d8ea', 80: '#7fb3d3' }
      },
      background: { primary: '#f0f8ff', secondary: '#ffffff' }
    },
    radii: { medium: '0.5rem', large: '0.75rem' },
    space: { medium: '1rem', large: '2rem' }
  }
};

function App() {
  return (
    <Authenticator theme={theme}>
      {({ signOut, user }) => (
        <View backgroundColor="background.primary" minHeight="100vh">
          <BrowserRouter>
            <Nav signOut={signOut} user={user} />
            <View padding="large">
              <Routes>
                <Route path="/" element={<Upload user={user} />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </View>
          </BrowserRouter>
        </View>
      )}
    </Authenticator>
  );
}

function Nav({ signOut, user }) {
  const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    fetchUserAttributes().then(attrs => {
      setGroups(attrs['cognito:groups'] || []);
    });
  }, []);

  return (
    <View backgroundColor="background.secondary" padding="medium" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderBottom="1px solid #e5e7eb">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex gap="medium" alignItems="center">
          <Heading level={4} color="brand.primary.10">Receipt App</Heading>
          <Flex gap="small">
            <Link to="/" style={{color: '#5dade2', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'all 0.2s'}}>Upload</Link>
            <Link to="/dashboard" style={{color: '#5dade2', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'all 0.2s'}}>Dashboard</Link>
            {groups.includes('admin') && <Link to="/admin" style={{color: '#5dade2', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'all 0.2s'}}>Admin</Link>}
          </Flex>
        </Flex>
        <Button variation="primary" onClick={signOut}>Sign Out</Button>
      </Flex>
    </View>
  );
}

export default App;