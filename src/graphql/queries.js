/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getReceipt = /* GraphQL */ `
  query GetReceipt($id: ID!) {
    getReceipt(id: $id) {
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
export const listReceipts = /* GraphQL */ `
  query ListReceipts(
    $filter: ModelReceiptFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReceipts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const receiptsByUserId = /* GraphQL */ `
  query ReceiptsByUserId(
    $userId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReceiptFilterInput
    $limit: Int
    $nextToken: String
  ) {
    receiptsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
