/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: unknown; output: unknown; }
};

export type Document = {
  __typename?: 'Document';
  content: Scalars['String']['output'];
  externalId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  modifiedAt: Scalars['DateTimeISO']['output'];
  provider: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: UserResponse;
  connectGoogle: Scalars['String']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  login: UserResponse;
  logout: Scalars['Boolean']['output'];
  register: UserResponse;
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  options: UserInput;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  search: Array<Document>;
};


export type QuerySearchArgs = {
  query: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type UserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type RegularErrorFragment = { field: string, message: string };

export type RegularUserResponseFragment = { errors: Array<{ field: string, message: string }> | null, user: { __typename: 'User', id: string, name: string, email: string, createdAt: string, updatedAt: string } | null };

export type RegularUserFragment = { __typename: 'User', id: string, name: string, email: string, createdAt: string, updatedAt: string };

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LoginMutation = { login: { errors: Array<{ field: string, message: string }> | null, user: { __typename: 'User', id: string, name: string, email: string, createdAt: string, updatedAt: string } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { __typename: 'User', id: string, name: string, email: string, createdAt: string, updatedAt: string } | null };
