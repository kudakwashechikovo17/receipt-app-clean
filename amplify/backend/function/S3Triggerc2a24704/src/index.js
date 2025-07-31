const AWS = require('aws-sdk');
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  
  try {
    // Call Textract AnalyzeExpense
    const response = await textract.analyzeExpense({
      Document: { S3Object: { Bucket: bucket, Name: key } }
    }).promise();
    
    // Extract data
    let vendor = null, total = null, receiptDate = null;
    const lineItems = [];
    
    for (const expenseDoc of response.ExpenseDocuments || []) {
      for (const field of expenseDoc.SummaryFields || []) {
        const fieldType = field.Type?.Text;
        if (fieldType === 'VENDOR_NAME') vendor = field.ValueDetection?.Text;
        else if (fieldType === 'TOTAL') total = field.ValueDetection?.Text;
        else if (fieldType === 'INVOICE_RECEIPT_DATE') receiptDate = field.ValueDetection?.Text;
      }
      
      for (const group of expenseDoc.LineItemGroups || []) {
        for (const item of group.LineItems || []) {
          const lineItem = {};
          for (const field of item.LineItemExpenseFields || []) {
            const fieldType = field.Type?.Text;
            if (fieldType === 'ITEM') lineItem.description = field.ValueDetection?.Text;
            else if (fieldType === 'PRICE') lineItem.price = field.ValueDetection?.Text;
          }
          if (lineItem.description || lineItem.price) lineItems.push(lineItem);
        }
      }
    }
    
    // Update DynamoDB
    const receiptId = key.split('/').pop().split('-')[0];
    await dynamodb.update({
      TableName: process.env.API_FIDELITY_RECEIPTTABLE_NAME,
      Key: { id: receiptId },
      UpdateExpression: 'SET #status = :status, vendor = :vendor, total = :total, receiptDate = :date, lineItems = :items',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'PROCESSED',
        ':vendor': vendor,
        ':total': total,
        ':date': receiptDate,
        ':items': lineItems
      }
    }).promise();
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: error.message };
  }
};