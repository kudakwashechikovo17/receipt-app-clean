import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Table, TableHead, TableRow, TableCell, TableBody, View, Heading, Card, Badge, Text, Flex } from '@aws-amplify/ui-react';
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'FAILED': return 'error';
      default: return 'info';
    }
  };

  return (
    <View maxWidth="1200px" margin="0 auto">
      <Card 
        padding="3rem" 
        backgroundColor="white" 
        borderRadius="1rem" 
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        border="1px solid #e5e7eb"
      >
        <Flex direction="column" gap="2rem">
          <View textAlign="center">
            <Heading 
              level={1} 
              color="#1f2937" 
              fontSize="2.5rem" 
              fontWeight="700"
              marginBottom="0.5rem"
            >
              📊 My Receipts Dashboard
            </Heading>
            <Text 
              fontSize="1.25rem" 
              color="#6b7280" 
              fontWeight="400"
            >
              Track and manage your uploaded receipts
            </Text>
          </View>

          {receipts.length === 0 ? (
            <Card 
              backgroundColor="#f9fafb" 
              padding="3rem" 
              borderRadius="0.75rem"
              textAlign="center"
              border="2px dashed #d1d5db"
            >
              <Text fontSize="1.125rem" color="#6b7280">
                No receipts uploaded yet. Start by uploading your first receipt!
              </Text>
            </Card>
          ) : (
            <Card 
              backgroundColor="white" 
              borderRadius="0.75rem" 
              boxShadow="0 1px 3px rgba(0,0,0,0.1)"
              border="1px solid #e5e7eb"
              overflow="hidden"
            >
              <Table>
                <TableHead backgroundColor="#f8fafc">
                  <TableRow>
                    <TableCell style={{ 
                      fontWeight: '700', 
                      color: '#374151', 
                      padding: '1.5rem 1rem',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      📄 File Name
                    </TableCell>
                    <TableCell style={{ 
                      fontWeight: '700', 
                      color: '#374151', 
                      padding: '1.5rem 1rem',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      🔄 Status
                    </TableCell>
                    <TableCell style={{ 
                      fontWeight: '700', 
                      color: '#374151', 
                      padding: '1.5rem 1rem',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      🏪 Vendor
                    </TableCell>
                    <TableCell style={{ 
                      fontWeight: '700', 
                      color: '#374151', 
                      padding: '1.5rem 1rem',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      💰 Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.map((receipt, index) => (
                    <TableRow 
                      key={receipt.id} 
                      style={{ 
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                      }}
                    >
                      <TableCell style={{ 
                        padding: '1.5rem 1rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {receipt.fileName}
                      </TableCell>
                      <TableCell style={{ padding: '1.5rem 1rem' }}>
                        <Badge 
                          variation={getStatusColor(receipt.status)}
                          style={{ 
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                          }}
                        >
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ 
                        padding: '1.5rem 1rem',
                        fontSize: '1rem',
                        color: '#374151'
                      }}>
                        {receipt.vendor || (
                          <Text color="#9ca3af" fontStyle="italic">Not extracted</Text>
                        )}
                      </TableCell>
                      <TableCell style={{ 
                        padding: '1.5rem 1rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        {receipt.total || (
                          <Text color="#9ca3af" fontStyle="italic">Not extracted</Text>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Flex>
      </Card>
    </View>
  );
}