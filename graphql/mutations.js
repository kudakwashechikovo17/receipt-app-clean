export const createReceipt = `
  mutation CreateReceipt($input: CreateReceiptInput!) {
    createReceipt(input: $input) {
      id
      userId
      fileName
      s3Key
      status
    }
  }
`;

export const updateReceipt = `
  mutation UpdateReceipt($input: UpdateReceiptInput!) {
    updateReceipt(input: $input) {
      id
      status
      vendor
      total
      receiptDate
      lineItems
    }
  }
`;