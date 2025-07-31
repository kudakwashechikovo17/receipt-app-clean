/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateReceipt = /* GraphQL */ `
  subscription OnCreateReceipt(
    $filter: ModelSubscriptionReceiptFilterInput
    $userId: String
  ) {
    onCreateReceipt(filter: $filter, userId: $userId) {
      id
      userId
      fileName
      s3Key
      status
      vendor
      total
      receiptDate
      extractedText
      confidence
      lineItems {
        description
        price
        quantity
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateReceipt = /* GraphQL */ `
  subscription OnUpdateReceipt(
    $filter: ModelSubscriptionReceiptFilterInput
    $userId: String
  ) {
    onUpdateReceipt(filter: $filter, userId: $userId) {
      id
      userId
      fileName
      s3Key
      status
      vendor
      total
      receiptDate
      extractedText
      confidence
      lineItems {
        description
        price
        quantity
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteReceipt = /* GraphQL */ `
  subscription OnDeleteReceipt(
    $filter: ModelSubscriptionReceiptFilterInput
    $userId: String
  ) {
    onDeleteReceipt(filter: $filter, userId: $userId) {
      id
      userId
      fileName
      s3Key
      status
      vendor
      total
      receiptDate
      extractedText
      confidence
      lineItems {
        description
        price
        quantity
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
