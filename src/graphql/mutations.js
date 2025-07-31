/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createReceipt = /* GraphQL */ `
  mutation CreateReceipt(
    $input: CreateReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    createReceipt(input: $input, condition: $condition) {
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
export const updateReceipt = /* GraphQL */ `
  mutation UpdateReceipt(
    $input: UpdateReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    updateReceipt(input: $input, condition: $condition) {
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
export const deleteReceipt = /* GraphQL */ `
  mutation DeleteReceipt(
    $input: DeleteReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    deleteReceipt(input: $input, condition: $condition) {
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
