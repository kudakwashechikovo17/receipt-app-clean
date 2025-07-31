import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { listReceipts } from '../graphql/queries';
import { deleteReceipt } from '../graphql/mutations';

const client = generateClient({ authMode: 'userPool' });

export default function Dashboard({ user }) {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');

  const loadReceipts = async () => {
    try {
      const currentUser = await getCurrentUser();
      const result = await client.graphql({
        query: listReceipts,
        variables: { filter: { userId: { eq: currentUser.userId || currentUser.sub || currentUser.username } } }
      });
      console.log('Receipts loaded:', result.data.listReceipts.items);
      setReceipts(result.data.listReceipts.items);
      filterAndSortReceipts(result.data.listReceipts.items, searchTerm, statusFilter, sortBy);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const handleDelete = async (receiptId) => {
    try {
      await client.graphql({
        query: deleteReceipt,
        variables: { input: { id: receiptId } }
      });
      loadReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const filterAndSortReceipts = (receiptList, search, status, sort) => {
    let filtered = receiptList.filter(receipt => {
      const matchesSearch = receipt.fileName.toLowerCase().includes(search.toLowerCase()) ||
                           (receipt.extractedText && receipt.extractedText.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === 'ALL' || receipt.status === status;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch(sort) {
        case 'name': return a.fileName.localeCompare(b.fileName);
        case 'status': return a.status.localeCompare(b.status);
        case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredReceipts(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterAndSortReceipts(receipts, term, statusFilter, sortBy);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterAndSortReceipts(receipts, searchTerm, status, sortBy);
  };

  const handleSort = (sort) => {
    setSortBy(sort);
    filterAndSortReceipts(receipts, searchTerm, statusFilter, sort);
  };

  useEffect(() => {
    loadReceipts();
    const interval = setInterval(loadReceipts, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Receipt Management System</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search receipts..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ padding: '0.5rem', minWidth: '200px' }}
        />
        
        <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
        </select>
        
        <select value={sortBy} onChange={(e) => handleSort(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
          <option value="confidence">Sort by Confidence</option>
        </select>
        
        <button onClick={loadReceipts} style={{ padding: '0.5rem 1rem' }}>Refresh</button>
      </div>
      
      <p><strong>Total Receipts:</strong> {filteredReceipts.length}</p>
      
      {filteredReceipts.map(receipt => (
        <div key={receipt.id} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{receipt.fileName}</h3>
            <button 
              onClick={() => handleDelete(receipt.id)}
              style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
          <p><strong>Status:</strong> {receipt.status}</p>
          {receipt.confidence && <p><strong>Confidence:</strong> {receipt.confidence.toFixed(1)}%</p>}
          {receipt.extractedText && (
            <div>
              <h4>Extracted Text:</h4>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem' }}>
                {receipt.extractedText}
              </pre>
            </div>
          )}
        </div>
      ))}
      
      {filteredReceipts.length === 0 && receipts.length > 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>No receipts match your search criteria.</p>
      )}
      
      {receipts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>No receipts uploaded yet. Go to Upload page to add receipts.</p>
      )}
    </div>
  );
}