import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listReceipts } from '../graphql/queries';

const client = generateClient();

export default function Admin() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    client.graphql({ query: listReceipts }).then(result => {
      setReceipts(result.data.listReceipts.items);
    });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>File</th>
            <th>Status</th>
            <th>Vendor</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map(receipt => (
            <tr key={receipt.id}>
              <td>{receipt.userId}</td>
              <td>{receipt.fileName}</td>
              <td>{receipt.status}</td>
              <td>{receipt.vendor || '-'}</td>
              <td>{receipt.total || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}