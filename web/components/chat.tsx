import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { first, isEmpty, orderBy } from "lodash";
import { DateTime } from "luxon";

import { BoxProps, VStack, Box } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { useToast } from "components/toast";

import { gql, useApolloClient } from "@apollo/client";

import { SendEventInput } from "apollo";

import { useChatMessagesQuery } from "apollo";

import { ChatEventDocument, ChatEventSubscription } from "apollo";

import {
  ChatSendEventDocument,
  ChatSendEventMutation,
  ChatSendEventMutationVariables,
} from "apollo";

gql`
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

gql`
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

gql`
  mutation ChatSendEvent($input: SendEventInput!) {
    payload: sendEvent(input: $input) {
      ok
    }
  }
`;

export interface ChatProps extends BoxProps {
  handle: string | undefined;
}

export const Chat: FC<ChatProps> = ({ handle, ...otherProps }) => {
  const client = useApolloClient();
  const toast = useToast();
  const bottomTabRef = useRef<HTMLDivElement>(null);

  const [currentMessage, setCurrentMessage] = useState<MessageInfo | null>(
    null,
  );
  useEffect(() => {
    setTimeout(() => {
      bottomTabRef.current?.scrollIntoView();
    }, 10);
  }, [currentMessage]);

  const { data, refetch } = useChatMessagesQuery({
    fetchPolicy: "network-only",
    onError: ({ message }) => {
      toast({
        status: "error",
        title: "Failed to load messages",
        description: message,
      });
    },
  });
  const messages = useMemo(() => {
    if (data?.messages) {
      return orderBy(
        data.messages,
        ({ timestamp }) => DateTime.fromISO(timestamp),
        "asc",
      );
    }
  }, [data]);

  useEffect(() => {
    if (data?.currentMessage) {
      const { sender, body } = data.currentMessage;
      setCurrentMessage({ sender, body });
    }
    setTimeout(() => {
      bottomTabRef.current?.scrollIntoView();
    }, 10);
  }, [data]);

  useEffect(() => {
    if (handle) {
      const listener = ({ key, metaKey }: KeyboardEvent) => {
        if (metaKey) {
          return;
        }

        const input: SendEventInput = {};
        if (currentMessage?.sender === handle) {
          if (key.length === 1) {
            input.append = {
              ch: key,
            };
          } else if (key === "Enter") {
            input.end = true;
          } else if (key === "Backspace") {
            input.delete = true;
          } else {
            return;
          }
        } else {
          if (key.length === 1) {
            input.start = {
              sender: handle,
              ch: key,
            };
          } else {
            return;
          }
        }

        client
          .mutate<ChatSendEventMutation, ChatSendEventMutationVariables>({
            mutation: ChatSendEventDocument,
            variables: { input },
          })
          .then(({ errors }) => {
            if (!isEmpty(errors)) {
              const error = first(errors)!;
              toast({
                status: "error",
                title: "Failed to update message",
                description: error.message,
              });
            }
          });
      };
      document.addEventListener("keydown", listener);
      return () => document.removeEventListener("keydown", listener);
    }
  }, [handle, currentMessage]);

  useEffect(
    () => {
      const subscription = client
        .subscribe<ChatEventSubscription>({
          query: ChatEventDocument,
        })
        .subscribe(({ data }) => {
          if (data?.event) {
            const { start, end, append, delete: deleteEvent } = data.event;
            if (start) {
              const { sender, ch } = start;
              setCurrentMessage({ sender, body: ch });
              refetch();
            } else if (end) {
              setCurrentMessage(null);
              refetch();
            } else if (append) {
              const { ch } = append;
              setCurrentMessage(message => {
                if (!message) {
                  throw new Error(
                    "Attempted to append to nonexistent message.",
                  );
                }
                const { body, ...other } = message;
                return { body: body.concat(ch), ...other };
              });
            } else if (deleteEvent) {
              setCurrentMessage(message => {
                if (!message) {
                  throw new Error(
                    "Attempted to append to nonexistent message.",
                  );
                }
                const { body, ...other } = message;
                return { body: body.slice(0, -1), ...other };
              });
            }
          }
        });
      return () => {
        subscription.unsubscribe();
      };
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <VStack
      align="stretch"
      spacing={3}
      overflowY="auto"
      borderWidth={1}
      borderColor="gray.200"
      rounded="md"
      p={3}
      {...otherProps}
    >
      {messages?.map(({ id, sender, body }) => (
        <MessageBubble
          key={id}
          {...{ sender, body }}
          isActive={sender === handle}
        />
      ))}
      {currentMessage && (
        <MessageBubble
          sender={currentMessage.sender}
          body={currentMessage.body}
          isActive={currentMessage.sender === handle}
          showMarker
        />
      )}
      <Box ref={bottomTabRef} />
    </VStack>
  );
};

type MessageInfo = {
  sender: string;
  body: string;
};

interface MessageBubbleProps extends BoxProps {
  sender: string;
  body: string;
  isActive?: boolean;
  showMarker?: boolean;
}

const MessageBubble: FC<MessageBubbleProps> = ({
  sender,
  body,
  isActive,
  showMarker,
  ...otherProps
}) => {
  return (
    <VStack align="stretch" spacing={1} rounded="2xl" {...otherProps}>
      <Badge
        alignSelf="start"
        bg={isActive ? "pink.600" : "gray.600"}
        color="white"
      >
        {sender}
      </Badge>
      <Text color="gray.800" fontSize="sm">
        {body || <>&nbsp;</>}
        {showMarker && (
          <chakra.span color="pink.500" fontWeight="semibold">
            _
          </chakra.span>
        )}
      </Text>
    </VStack>
  );
};
