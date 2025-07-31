const AWS = require('aws-sdk');
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { receiptId, s3Key } = JSON.parse(event.body);
        
        const textractParams = {
            Document: {
                S3Object: {
                    Bucket: 'fidelity8590b7c71d4f4d8e8734806c975c3f345f5b5-dev',
                    Name: s3Key
                }
            }
        };
        
        const textractResult = await textract.detectDocumentText(textractParams).promise();
        
        let extractedText = '';
        let totalConfidence = 0;
        let blockCount = 0;
        
        textractResult.Blocks.forEach(block => {
            if (block.BlockType === 'LINE') {
                extractedText += block.Text + '\n';
                totalConfidence += block.Confidence;
                blockCount++;
            }
        });
        
        const avgConfidence = blockCount > 0 ? totalConfidence / blockCount : 0;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Text extracted successfully',
                extractedText: extractedText.trim(),
                confidence: avgConfidence,
                receiptId: receiptId
            })
        };
        
    } catch (error) {
        console.error('Textract processing failed:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};