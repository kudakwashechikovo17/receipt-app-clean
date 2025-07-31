import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Button, Alert } from '@aws-amplify/ui-react';
import { createReceipt, updateReceipt } from '../graphql/mutations';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const client = generateClient({ authMode: 'userPool' });

export default function Upload({ user }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file first.');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setStatus('Please upload a valid image file (JPEG, PNG, GIF).');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setStatus('File size must be less than 10MB.');
      return;
    }
    
    setIsUploading(true);
    setStatus('Uploading receipt...');
    try {
      // Get current user for proper authentication
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      const key = `receipts/${currentUser.username}/${Date.now()}-${file.name}`;
      
      // Upload file to S3
      const result = await uploadData({
        key: key,
        data: file,
        options: {
          accessLevel: 'guest'
        }
      }).result;
      
      // Create receipt record in database - use the sub (user ID) for authorization
      const createResult = await client.graphql({
        query: createReceipt,
        variables: {
          input: {
            userId: currentUser.userId || currentUser.sub || currentUser.username,
            fileName: file.name,
            s3Key: key,
            status: 'PENDING'
          }
        }
      });
      
      setStatus('✅ Upload successful! Click "Extract Text" to process.');
      setUploadedReceipt({ id: createResult.data.createReceipt.id, s3Key: key });
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      if (error.name === 'NotAuthorizedException') {
        setStatus('❌ Upload failed: Please sign in again');
      } else if (error.message?.includes('Access Denied')) {
        setStatus('❌ Upload failed: Storage permission denied');
      } else {
        setStatus(`❌ Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleExtract = async () => {
    if (!uploadedReceipt) return;
    setIsExtracting(true);
    setStatus('🤖 Processing with Amazon Textract AI...');
    try {
      // Get AWS credentials from Amplify
      const session = await fetchAuthSession();
      
      // Configure Textract client
      const textract = new TextractClient({
        credentials: {
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken
        },
        region: 'us-east-1'
      });
      
      console.log('Processing receipt:', uploadedReceipt.s3Key);
      
      const command = new DetectDocumentTextCommand({
        Document: {
          S3Object: {
            Bucket: 'fidelity8590b7c71d4f4d8e8734806c975c3f345f5b5-dev',
            Name: `public/${uploadedReceipt.s3Key}`
          }
        }
      });
      
      const result = await textract.send(command);
      
      let extractedText = '';
      let totalConfidence = 0;
      let blockCount = 0;
      
      result.Blocks.forEach(block => {
        if (block.BlockType === 'LINE') {
          extractedText += block.Text + '\n';
          totalConfidence += block.Confidence;
          blockCount++;
        }
      });
      
      const avgConfidence = blockCount > 0 ? totalConfidence / blockCount : 0;
      
      await client.graphql({
        query: updateReceipt,
        variables: {
          input: {
            id: uploadedReceipt.id,
            extractedText: extractedText.trim(),
            confidence: avgConfidence,
            status: 'PROCESSED'
          }
        }
      });
      
      setStatus(`✅ Text extraction completed! Confidence: ${avgConfidence.toFixed(1)}%. Check Dashboard.`);
      setUploadedReceipt(null);
    } catch (error) {
      console.error('Extract error:', error);
      if (error.message?.includes('unsupported document format')) {
        setStatus('❌ Extraction failed: Unsupported file format. Upload a clear image.');
      } else {
        setStatus(`❌ Extraction failed: ${error.message}`);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>📄 Receipt Upload & AI Text Extraction</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Upload receipt images and extract text using Amazon Textract AI</p>
      
      <div style={{ border: '2px dashed #ccc', padding: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '1rem' }}
        />
        {file && (
          <div style={{ marginTop: '1rem', color: '#666' }}>
            <p>📎 Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          style={{ marginRight: '1rem' }}
        >
          {isUploading ? '⏳ Uploading...' : '📤 Upload Receipt'}
        </Button>
        
        {uploadedReceipt && (
          <Button 
            onClick={handleExtract} 
            disabled={isExtracting}
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            {isExtracting ? '🤖 Processing...' : '🤖 Extract Text with AI'}
          </Button>
        )}
      </div>
      
      {status && <Alert style={{ padding: '1rem' }}>{status}</Alert>}
      
      <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#666' }}>
        <h3>💡 Tips:</h3>
        <ul>
          <li>Supported formats: JPEG, PNG, GIF</li>
          <li>Maximum file size: 10MB</li>
          <li>For best results, ensure receipt is clear and well-lit</li>
          <li>Processing uses Amazon Textract (~$0.0015 per page)</li>
        </ul>
      </div>
    </div>
  );
}