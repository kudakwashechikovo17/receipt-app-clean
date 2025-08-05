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
      console.log('Dashboard loaded receipts:', result.data.listReceipts.items.length);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            📄 Receipt Dashboard
          </h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem', margin: 0 }}>Manage your AI-processed receipts</p>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="🔍 Search receipts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
            />
            
            <select 
              value={statusFilter} 
              onChange={(e) => handleStatusFilter(e.target.value)}
              style={{
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="ALL">📁 All Status</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="PROCESSED">✅ Processed</option>
              <option value="FAILED">❌ Failed</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => handleSort(e.target.value)}
              style={{
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="date">📅 Sort by Date</option>
              <option value="name">📝 Sort by Name</option>
              <option value="status">📊 Sort by Status</option>
              <option value="confidence">🎯 Sort by Confidence</option>
            </select>
            
            <button 
              onClick={loadReceipts}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
                transition: 'transform 0.2s ease'
              }}
            >
              ↻ Refresh
            </button>
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#495057', fontSize: '1.1rem' }}>
              📈 Total Receipts: {filteredReceipts.length}
            </strong>
          </div>
        </div>

        {/* Receipts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {filteredReceipts.map(receipt => (
            <div key={receipt.id} style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '2rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}>
              {/* Receipt Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    📄 {receipt.fileName}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    backgroundColor: receipt.status === 'PROCESSED' ? '#e8f5e8' : receipt.status === 'PENDING' ? '#fff3cd' : '#ffebee',
                    color: receipt.status === 'PROCESSED' ? '#2e7d32' : receipt.status === 'PENDING' ? '#856404' : '#c62828'
                  }}>
                    {receipt.status === 'PROCESSED' ? '✅' : receipt.status === 'PENDING' ? '⏳' : '❌'} {receipt.status}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(receipt.id)}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
              
              {/* Confidence Score */}
              {receipt.confidence && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>🎯 AI Confidence:</span>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: receipt.confidence > 90 ? '#28a745' : receipt.confidence > 70 ? '#ffc107' : '#dc3545'
                    }}>
                      {receipt.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    height: '6px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${receipt.confidence}%`,
                      height: '100%',
                      backgroundColor: receipt.confidence > 90 ? '#28a745' : receipt.confidence > 70 ? '#ffc107' : '#dc3545',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
              
              {/* Extracted Text */}
              {receipt.extractedText && (
                <div>
                  <h4 style={{
                    color: '#495057',
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    🤖 Extracted Text:
                  </h4>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    color: '#495057'
                  }}>
                    {receipt.extractedText}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Empty States */}
        {filteredReceipts.length === 0 && receipts.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>No receipts match your search</h3>
            <p style={{ color: '#adb5bd', margin: 0 }}>Try adjusting your filters or search terms</p>
          </div>
        )}
        
        {receipts.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>No receipts yet</h3>
            <p style={{ color: '#adb5bd', margin: 0 }}>Upload your first receipt to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}