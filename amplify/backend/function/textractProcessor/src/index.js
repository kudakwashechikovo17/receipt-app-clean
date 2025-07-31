const AWS = require('aws-sdk');
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    for (const record of event.Records) {
        if (record.eventName === 'INSERT') {
            const receipt = record.dynamodb.NewImage;
            
            if (receipt.status.S === 'PENDING') {
                try {
                    const textractParams = {
                        Document: {
                            S3Object: {
                                Bucket: process.env.STORAGE_BUCKET,
                                Name: receipt.s3Key.S
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
                    
                    await dynamodb.update({
                        TableName: process.env.API_FIDELITY_RECEIPTTABLE_NAME,
                        Key: { id: receipt.id.S },
                        UpdateExpression: 'SET extractedText = :text, confidence = :conf, #status = :status',
                        ExpressionAttributeNames: { '#status': 'status' },
                        ExpressionAttributeValues: {
                            ':text': extractedText.trim(),
                            ':conf': avgConfidence,
                            ':status': 'PROCESSED'
                        }
                    }).promise();
                    
                } catch (error) {
                    console.error('Textract processing failed:', error);
                    
                    await dynamodb.update({
                        TableName: process.env.API_FIDELITY_RECEIPTTABLE_NAME,
                        Key: { id: receipt.id.S },
                        UpdateExpression: 'SET #status = :status',
                        ExpressionAttributeNames: { '#status': 'status' },
                        ExpressionAttributeValues: { ':status': 'FAILED' }
                    }).promise();
                }
            }
        }
    }
    
    return { statusCode: 200 };
};