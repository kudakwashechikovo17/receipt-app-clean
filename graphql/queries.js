export const listReceipts = `
  query ListReceipts {
    listReceipts {
      items {
        id
        userId
        fileName
        status
        vendor
        total
        receiptDate
      }
    }
  }
`;

export const receiptsByUserId = `
  query ReceiptsByUserId($userId: String!) {
    receiptsByUserId(userId: $userId) {
      items {
        id
        fileName
        status
        vendor
        total
        receiptDate
      }
    }
  }
`;