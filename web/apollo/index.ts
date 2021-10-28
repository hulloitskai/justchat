import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * Implement the DateTime<FixedOffset> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: any;
};

export type BuildInfo = {
  __typename?: 'BuildInfo';
  timestamp: Scalars['DateTime'];
  version: Scalars['String'];
};

export type Event = {
  __typename?: 'Event';
  key?: Maybe<Scalars['String']>;
  message?: Maybe<Message>;
};

export type Message = {
  __typename?: 'Message';
  body: Scalars['String'];
  id: Scalars['ID'];
  senderHandle: Scalars['String'];
  timestamp: Scalars['DateTime'];
};

export type Mutation = {
  __typename?: 'Mutation';
  update: UpdatePayload;
};


export type MutationUpdateArgs = {
  input: UpdateInput;
};

export type Query = {
  __typename?: 'Query';
  buildInfo: BuildInfo;
  currentMessage?: Maybe<Message>;
  message?: Maybe<Message>;
  messages: Array<Message>;
};


export type QueryMessageArgs = {
  id: Scalars['ID'];
};


export type QueryMessagesArgs = {
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  event: Event;
};

export type UpdateInput = {
  key: Scalars['String'];
  senderHandle: Scalars['String'];
};

export type UpdatePayload = {
  __typename?: 'UpdatePayload';
  currentMessage?: Maybe<Message>;
  ok: Scalars['Boolean'];
};

export type ChatInputUpdateMutationVariables = Exact<{
  input: UpdateInput;
}>;


export type ChatInputUpdateMutation = { __typename?: 'Mutation', update: { __typename?: 'UpdatePayload', ok: boolean } };

export type ChatMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type ChatMessagesQuery = { __typename?: 'Query', messages: Array<{ __typename?: 'Message', id: string, senderHandle: string, body: string, timestamp: any }> };

export type ChatEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ChatEventSubscription = { __typename?: 'Subscription', event: { __typename?: 'Event', key?: string | null | undefined, message?: { __typename?: 'Message', id: string, senderHandle: string, body: string } | null | undefined } };

export type ChatUpdateMutationVariables = Exact<{
  input: UpdateInput;
}>;


export type ChatUpdateMutation = { __typename?: 'Mutation', payload: { __typename?: 'UpdatePayload', ok: boolean } };


export const ChatInputUpdateDocument = gql`
    mutation ChatInputUpdate($input: UpdateInput!) {
  update(input: $input) {
    ok
  }
}
    `;
export type ChatInputUpdateMutationFn = Apollo.MutationFunction<ChatInputUpdateMutation, ChatInputUpdateMutationVariables>;

/**
 * __useChatInputUpdateMutation__
 *
 * To run a mutation, you first call `useChatInputUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChatInputUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [chatInputUpdateMutation, { data, loading, error }] = useChatInputUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChatInputUpdateMutation(baseOptions?: Apollo.MutationHookOptions<ChatInputUpdateMutation, ChatInputUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChatInputUpdateMutation, ChatInputUpdateMutationVariables>(ChatInputUpdateDocument, options);
      }
export type ChatInputUpdateMutationHookResult = ReturnType<typeof useChatInputUpdateMutation>;
export type ChatInputUpdateMutationResult = Apollo.MutationResult<ChatInputUpdateMutation>;
export type ChatInputUpdateMutationOptions = Apollo.BaseMutationOptions<ChatInputUpdateMutation, ChatInputUpdateMutationVariables>;
export const ChatMessagesDocument = gql`
    query ChatMessages {
  messages(take: 10) {
    id
    senderHandle
    body
    timestamp
  }
}
    `;

/**
 * __useChatMessagesQuery__
 *
 * To run a query within a React component, call `useChatMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatMessagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useChatMessagesQuery(baseOptions?: Apollo.QueryHookOptions<ChatMessagesQuery, ChatMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ChatMessagesQuery, ChatMessagesQueryVariables>(ChatMessagesDocument, options);
      }
export function useChatMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChatMessagesQuery, ChatMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ChatMessagesQuery, ChatMessagesQueryVariables>(ChatMessagesDocument, options);
        }
export type ChatMessagesQueryHookResult = ReturnType<typeof useChatMessagesQuery>;
export type ChatMessagesLazyQueryHookResult = ReturnType<typeof useChatMessagesLazyQuery>;
export type ChatMessagesQueryResult = Apollo.QueryResult<ChatMessagesQuery, ChatMessagesQueryVariables>;
export const ChatEventDocument = gql`
    subscription ChatEvent {
  event {
    message {
      id
      senderHandle
      body
    }
    key
  }
}
    `;

/**
 * __useChatEventSubscription__
 *
 * To run a query within a React component, call `useChatEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatEventSubscription({
 *   variables: {
 *   },
 * });
 */
export function useChatEventSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ChatEventSubscription, ChatEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatEventSubscription, ChatEventSubscriptionVariables>(ChatEventDocument, options);
      }
export type ChatEventSubscriptionHookResult = ReturnType<typeof useChatEventSubscription>;
export type ChatEventSubscriptionResult = Apollo.SubscriptionResult<ChatEventSubscription>;
export const ChatUpdateDocument = gql`
    mutation ChatUpdate($input: UpdateInput!) {
  payload: update(input: $input) {
    ok
  }
}
    `;
export type ChatUpdateMutationFn = Apollo.MutationFunction<ChatUpdateMutation, ChatUpdateMutationVariables>;

/**
 * __useChatUpdateMutation__
 *
 * To run a mutation, you first call `useChatUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChatUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [chatUpdateMutation, { data, loading, error }] = useChatUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChatUpdateMutation(baseOptions?: Apollo.MutationHookOptions<ChatUpdateMutation, ChatUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChatUpdateMutation, ChatUpdateMutationVariables>(ChatUpdateDocument, options);
      }
export type ChatUpdateMutationHookResult = ReturnType<typeof useChatUpdateMutation>;
export type ChatUpdateMutationResult = Apollo.MutationResult<ChatUpdateMutation>;
export type ChatUpdateMutationOptions = Apollo.BaseMutationOptions<ChatUpdateMutation, ChatUpdateMutationVariables>;