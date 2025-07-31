import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@aws-amplify/ui-react';
import { receiptsByUserId } from '../graphql/queries';

const client = generateClient();

export default function Dashboard({ user }) {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    client.graphql({
      query: receiptsByUserId,
      variables: { userId: user.username }
    }).then(result => {
      setReceipts(result.data.receiptsByUserId.items);
    });
  }, [user]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Receipts</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>File</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {receipts.map(receipt => (
            <TableRow key={receipt.id}>
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