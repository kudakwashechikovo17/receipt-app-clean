import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Button, Flex } from '@aws-amplify/ui-react';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Nav signOut={signOut} user={user} />
          <Routes>
            <Route path="/" element={<Upload user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
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
    <Flex justifyContent="space-between" padding="1rem">
      <Flex gap="1rem">
        <Link to="/">Upload</Link>
        <Link to="/dashboard">Dashboard</Link>
        {groups.includes('admin') && <Link to="/admin">Admin</Link>}
      </Flex>
      <Button onClick={signOut}>Sign Out</Button>
    </Flex>
  );
}

export default App;