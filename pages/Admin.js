import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@aws-amplify/ui-react';
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>File</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {receipts.map(receipt => (
            <TableRow key={receipt.id}>
              <TableCell>{receipt.userId}</TableCell>
              <TableCell>{receipt.fileName}</TableCell>
              <TableCell>{receipt.status}</TableCell>
              <TableCell>{receipt.vendor || '-'}</TableCell>
              <TableCell>{receipt.total || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}