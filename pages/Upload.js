import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { FileUploader, Alert, View, Heading, Card, Text, Flex, Badge } from '@aws-amplify/ui-react';
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
    <View maxWidth="900px" margin="0 auto">
      <Card 
        padding="3rem" 
        backgroundColor="white" 
        borderRadius="1rem" 
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        border="1px solid #e5e7eb"
      >
        <Flex direction="column" alignItems="center" gap="2rem">
          <View textAlign="center">
            <Heading 
              level={1} 
              color="#1f2937" 
              fontSize="2.5rem" 
              fontWeight="700"
              marginBottom="0.5rem"
            >
              📄 Receipt Upload & AI Text Extraction
            </Heading>
            <Text 
              fontSize="1.25rem" 
              color="#6b7280" 
              fontWeight="400"
              lineHeight="1.6"
            >
              Upload receipt images and extract text using Amazon Textract AI
            </Text>
          </View>

          <View width="100%" maxWidth="600px">
            <FileUploader
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
              onFileUpload={handleUpload}
              style={{
                border: '3px dashed #87ceeb',
                borderRadius: '1rem',
                padding: '3rem',
                backgroundColor: '#f0f8ff',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </View>

          <Card 
            backgroundColor="#e6f3ff" 
            padding="1.5rem" 
            borderRadius="0.75rem"
            border="1px solid #b3d9ff"
            width="100%"
          >
            <Heading level={4} color="#2980b9" marginBottom="1rem" fontSize="1.125rem">
              💡 Tips:
            </Heading>
            <Flex direction="column" gap="0.5rem">
              <Flex alignItems="center" gap="0.5rem">
                <Badge variation="info" style={{borderRadius: '0.375rem'}}>Formats</Badge>
                <Text color="#374151">JPEG, PNG, GIF</Text>
              </Flex>
              <Flex alignItems="center" gap="0.5rem">
                <Badge variation="success" style={{borderRadius: '0.375rem'}}>Size</Badge>
                <Text color="#374151">Maximum file size: 10MB</Text>
              </Flex>
              <Flex alignItems="center" gap="0.5rem">
                <Badge variation="warning" style={{borderRadius: '0.375rem'}}>Quality</Badge>
                <Text color="#374151">For best results, ensure receipt is clear and well-lit</Text>
              </Flex>
              <Flex alignItems="center" gap="0.5rem">
                <Badge style={{backgroundColor: '#8b5cf6', color: 'white', borderRadius: '0.375rem'}}>Cost</Badge>
                <Text color="#374151">Processing uses Amazon Textract (~$0.0015 per page)</Text>
              </Flex>
            </Flex>
          </Card>

          {status && (
            <Alert 
              variation={status.includes('successful') ? 'success' : status.includes('failed') ? 'error' : 'info'}
              borderRadius="0.75rem"
              padding="1rem"
              fontSize="1.125rem"
              fontWeight="500"
              width="100%"
              textAlign="center"
            >
              {status}
            </Alert>
          )}
        </Flex>
      </Card>
    </View>
  );
}