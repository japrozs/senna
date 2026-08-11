/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment RegularError on FieldError {\n  field\n  message\n}": typeof types.RegularErrorFragmentDoc,
    "fragment RegularUserResponse on UserResponse {\n  errors {\n    ...RegularError\n  }\n  user {\n    ...RegularUser\n  }\n}": typeof types.RegularUserResponseFragmentDoc,
    "fragment RegularUser on User {\n  id\n  name\n  email\n  createdAt\n  updatedAt\n  __typename\n}": typeof types.RegularUserFragmentDoc,
    "mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    ...RegularUserResponse\n  }\n}": typeof types.LoginDocument,
    "mutation Register($options: UserInput!) {\n  register(options: $options) {\n    ...RegularUserResponse\n  }\n}": typeof types.RegisterDocument,
    "query Me {\n  me {\n    ...RegularUser\n  }\n}": typeof types.MeDocument,
    "query SearchDocuments($query: String!) {\n  search(query: $query) {\n    id\n    externalId\n    provider\n    title\n    url\n    mimeType\n    modifiedAt\n  }\n}": typeof types.SearchDocumentsDocument,
};
const documents: Documents = {
    "fragment RegularError on FieldError {\n  field\n  message\n}": types.RegularErrorFragmentDoc,
    "fragment RegularUserResponse on UserResponse {\n  errors {\n    ...RegularError\n  }\n  user {\n    ...RegularUser\n  }\n}": types.RegularUserResponseFragmentDoc,
    "fragment RegularUser on User {\n  id\n  name\n  email\n  createdAt\n  updatedAt\n  __typename\n}": types.RegularUserFragmentDoc,
    "mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    ...RegularUserResponse\n  }\n}": types.LoginDocument,
    "mutation Register($options: UserInput!) {\n  register(options: $options) {\n    ...RegularUserResponse\n  }\n}": types.RegisterDocument,
    "query Me {\n  me {\n    ...RegularUser\n  }\n}": types.MeDocument,
    "query SearchDocuments($query: String!) {\n  search(query: $query) {\n    id\n    externalId\n    provider\n    title\n    url\n    mimeType\n    modifiedAt\n  }\n}": types.SearchDocumentsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment RegularError on FieldError {\n  field\n  message\n}"): (typeof documents)["fragment RegularError on FieldError {\n  field\n  message\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment RegularUserResponse on UserResponse {\n  errors {\n    ...RegularError\n  }\n  user {\n    ...RegularUser\n  }\n}"): (typeof documents)["fragment RegularUserResponse on UserResponse {\n  errors {\n    ...RegularError\n  }\n  user {\n    ...RegularUser\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment RegularUser on User {\n  id\n  name\n  email\n  createdAt\n  updatedAt\n  __typename\n}"): (typeof documents)["fragment RegularUser on User {\n  id\n  name\n  email\n  createdAt\n  updatedAt\n  __typename\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    ...RegularUserResponse\n  }\n}"): (typeof documents)["mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    ...RegularUserResponse\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Register($options: UserInput!) {\n  register(options: $options) {\n    ...RegularUserResponse\n  }\n}"): (typeof documents)["mutation Register($options: UserInput!) {\n  register(options: $options) {\n    ...RegularUserResponse\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    ...RegularUser\n  }\n}"): (typeof documents)["query Me {\n  me {\n    ...RegularUser\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchDocuments($query: String!) {\n  search(query: $query) {\n    id\n    externalId\n    provider\n    title\n    url\n    mimeType\n    modifiedAt\n  }\n}"): (typeof documents)["query SearchDocuments($query: String!) {\n  search(query: $query) {\n    id\n    externalId\n    provider\n    title\n    url\n    mimeType\n    modifiedAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;