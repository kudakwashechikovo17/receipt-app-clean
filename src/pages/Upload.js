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
      
      console.log('Processing receipt with Textract:', uploadedReceipt.s3Key);
      
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
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>📄 Receipt Manager</h1>
          <p style={{ margin: '1rem 0 0', fontSize: '1.2rem', opacity: 0.9 }}>AI-Powered Text Extraction with Amazon Textract</p>
        </div>

        <div style={{ padding: '3rem 2rem' }}>
          {/* Upload Zone */}
          <div style={{
            border: file ? '3px solid #4facfe' : '3px dashed #e0e6ed',
            borderRadius: '15px',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: file ? '#f8fbff' : '#fafbfc',
            transition: 'all 0.3s ease',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>☁️</div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                padding: '1rem',
                border: '2px solid #e0e6ed',
                borderRadius: '10px',
                fontSize: '1rem',
                marginBottom: '1rem',
                width: '100%',
                maxWidth: '400px'
              }}
            />
            {file && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#e8f5e8',
                borderRadius: '10px',
                border: '1px solid #4caf50'
              }}>
                <p style={{ margin: 0, color: '#2e7d32', fontWeight: '600' }}>
                  ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              style={{
                background: isUploading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: !file || isUploading ? 'not-allowed' : 'pointer',
                marginRight: '1rem',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {isUploading ? '⏳ Uploading...' : '📤 Upload Receipt'}
            </button>
            
            {uploadedReceipt && (
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                style={{
                  background: isExtracting ? '#ccc' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isExtracting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isExtracting ? '🤖 Processing...' : '🤖 Extract with AI'}
              </button>
            )}
          </div>
          
          {/* Status Alert */}
          {status && (
            <div style={{
              padding: '1.5rem',
              borderRadius: '15px',
              backgroundColor: status.includes('✅') ? '#e8f5e8' : status.includes('❌') ? '#ffebee' : '#e3f2fd',
              border: `2px solid ${status.includes('✅') ? '#4caf50' : status.includes('❌') ? '#f44336' : '#2196f3'}`,
              marginBottom: '2rem',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              {status}
            </div>
          )}
          
          {/* Tips Section */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            padding: '2rem',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '1rem', fontSize: '1.3rem' }}>💡 Pro Tips</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📁</span>
                <span>JPEG, PNG, GIF supported</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📏</span>
                <span>Max 10MB file size</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>💡</span>
                <span>Clear, well-lit images work best</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>💰</span>
                <span>~$0.0015 per page processed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}