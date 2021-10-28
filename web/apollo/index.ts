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
   * The `Char` scalar type represents a unicode char.
   * The input and output values are a string, and there can only be one unicode character in this string.
   */
  Char: any;
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

export type Message = {
  __typename?: 'Message';
  body: Scalars['String'];
  id: Scalars['ID'];
  sender: Scalars['String'];
  timestamp: Scalars['DateTime'];
};

export type MessageAppendEvent = {
  __typename?: 'MessageAppendEvent';
  ch: Scalars['Char'];
};

export type MessageAppendEventInput = {
  ch: Scalars['Char'];
};

export type MessageEvent = {
  __typename?: 'MessageEvent';
  append?: Maybe<MessageAppendEvent>;
  delete: Scalars['Boolean'];
  end: Scalars['Boolean'];
  start?: Maybe<MessageStartEvent>;
};

export type MessageStartEvent = {
  __typename?: 'MessageStartEvent';
  ch: Scalars['Char'];
  sender: Scalars['String'];
};

export type MessageStartEventInput = {
  ch: Scalars['Char'];
  sender: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  sendEvent: SendEventPayload;
};


export type MutationSendEventArgs = {
  input: SendEventInput;
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

export type SendEventInput = {
  append?: Maybe<MessageAppendEventInput>;
  delete?: Maybe<Scalars['Boolean']>;
  end?: Maybe<Scalars['Boolean']>;
  start?: Maybe<MessageStartEventInput>;
};

export type SendEventPayload = {
  __typename?: 'SendEventPayload';
  event: MessageEvent;
  message?: Maybe<Message>;
  ok: Scalars['Boolean'];
};

export type Subscription = {
  __typename?: 'Subscription';
  event: MessageEvent;
};

export type ChatMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type ChatMessagesQuery = { __typename?: 'Query', currentMessage?: { __typename?: 'Message', id: string, body: string, sender: string } | null | undefined, messages: Array<{ __typename?: 'Message', id: string, body: string, sender: string, timestamp: any }> };

export type ChatEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ChatEventSubscription = { __typename?: 'Subscription', event: { __typename?: 'MessageEvent', end: boolean, delete: boolean, start?: { __typename?: 'MessageStartEvent', sender: string, ch: any } | null | undefined, append?: { __typename?: 'MessageAppendEvent', ch: any } | null | undefined } };

export type ChatSendEventMutationVariables = Exact<{
  input: SendEventInput;
}>;


export type ChatSendEventMutation = { __typename?: 'Mutation', payload: { __typename?: 'SendEventPayload', ok: boolean } };


export const ChatMessagesDocument = gql`
    query ChatMessages {
  currentMessage {
    id
    body
    sender
  }
  messages(take: 10) {
    id
    body
    sender
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
    start {
      sender
      ch
    }
    end
    append {
      ch
    }
    delete
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
export const ChatSendEventDocument = gql`
    mutation ChatSendEvent($input: SendEventInput!) {
  payload: sendEvent(input: $input) {
    ok
  }
}
    `;
export type ChatSendEventMutationFn = Apollo.MutationFunction<ChatSendEventMutation, ChatSendEventMutationVariables>;

/**
 * __useChatSendEventMutation__
 *
 * To run a mutation, you first call `useChatSendEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChatSendEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [chatSendEventMutation, { data, loading, error }] = useChatSendEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChatSendEventMutation(baseOptions?: Apollo.MutationHookOptions<ChatSendEventMutation, ChatSendEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChatSendEventMutation, ChatSendEventMutationVariables>(ChatSendEventDocument, options);
      }
export type ChatSendEventMutationHookResult = ReturnType<typeof useChatSendEventMutation>;
export type ChatSendEventMutationResult = Apollo.MutationResult<ChatSendEventMutation>;
export type ChatSendEventMutationOptions = Apollo.BaseMutationOptions<ChatSendEventMutation, ChatSendEventMutationVariables>;