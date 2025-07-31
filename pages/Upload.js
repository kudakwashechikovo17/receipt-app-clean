import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { FileUploader, Alert } from '@aws-amplify/ui-react';
import { createReceipt } from '../graphql/mutations';

const client = generateClient();

export default function Upload({ user }) {
  const [status, setStatus] = useState('');

  const handleUpload = async ({ file }) => {
    setStatus('Uploading...');
    try {
      const key = `receipts/${user.username}/${Date.now()}-${file.name}`;
      await uploadData({ key, data: file });
      
      await client.graphql({
        query: createReceipt,
        variables: {
          input: {
            userId: user.username,
            fileName: file.name,
            s3Key: key,
            status: 'PENDING'
          }
        }
      });
      
      setStatus('Upload successful!');
    } catch (error) {
      setStatus('Upload failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload Receipt</h1>
      <FileUploader
        acceptedFileTypes={['image/jpeg', 'image/png']}
        onFileUpload={handleUpload}
      />
      {status && <Alert>{status}</Alert>}
    </div>
  );
}