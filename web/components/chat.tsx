import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { orderBy } from "lodash";
import { DateTime } from "luxon";

import { BoxProps, VStack, HStack, Box, Center } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Collapse, ScaleFade } from "@chakra-ui/react";
import { useSafeLayoutEffect } from "@chakra-ui/react";
import { useToast } from "components/toast";
import { chakra } from "@chakra-ui/react";

import { ChatInput, ChatInputHandle } from "components/chat-input";

import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import { formatApolloError } from "components/apollo";

import { ChatEventDocument } from "apollo";
import type { ChatEventSubscription } from "apollo";

import { useChatMessagesQuery } from "apollo";
import type { ChatMessagesQuery } from "apollo";

gql`
  query ChatMessages {
    messages(take: 10) {
      id
      timestamp
      senderHandle
      body
    }
  }
`;

gql`
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

export interface ChatProps extends BoxProps {
  handle: string | undefined;
}

export const Chat: FC<ChatProps> = ({ handle, ...otherProps }) => {
  const client = useApolloClient();
  const toast = useToast();

  const handleRef = useRef<string | undefined | null>(handle);
  useEffect(() => {
    handleRef.current = handle;
  }, [handle]);

  const initialMessageRef = useRef<
    ChatEventSubscription["event"]["message"] | null
  >(null);
  const [currentMessage, setCurrentMessage] = useState<CurrentMessage | null>(
    null,
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);
  const inputInitialValue = useMemo(() => {
    if (initialMessageRef.current) {
      const { senderHandle, body } = initialMessageRef.current;
      if (senderHandle === handle) {
        return body;
      }
    }
  }, [handle]);

  const { data, fetchMore } = useChatMessagesQuery({
    ssr: false,
    onError: error => {
      toast({
        status: "error",
        title: "Failed to load messages",
        description: formatApolloError(error),
      });
    },
  });

  // Sort messages in ascending order by timestamp
  const messages = useMemo<ChatMessagesQuery["messages"] | undefined>(() => {
    if (data?.messages) {
      return orderBy(
        data.messages,
        ({ timestamp }) => DateTime.fromISO(timestamp),
        "asc",
      );
    }
  }, [data]);

  // Scroll to bottom when current message or data updates
  useSafeLayoutEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView();
      }, 10);
    }
  }, [currentMessage, data]);

  // Subscribe to events
  useEffect(() => {
    const subscription = client
      .subscribe<ChatEventSubscription>({
        query: ChatEventDocument,
      })
      .subscribe(({ data, errors }) => {
        if (data?.event) {
          const { message, key } = data.event;
          if (message) {
            if (!initialMessageRef.current) {
              initialMessageRef.current = message;
            }
            const { senderHandle, body } = message;
            if (inputRef.current && senderHandle !== handleRef.current) {
              inputRef.current.reset();
            }
            setCurrentMessage({ senderHandle, body });
            fetchMore({});
          } else if (key) {
            switch (key) {
              case "Enter":
                fetchMore({}).then(({ data }) => {
                  if (data) {
                    setCurrentMessage(null);
                  }
                });
                break;
              case "Backspace":
                setCurrentMessage(message => {
                  if (!message) {
                    console.error(
                      `[justchat-web] Attempted to update a nonexistent message.`,
                    );
                    return message;
                  }
                  const { body, ...otherFields } = message;
                  return { body: body.slice(0, -1), ...otherFields };
                });
                break;
              default:
                setCurrentMessage(message => {
                  if (!message) {
                    console.error(
                      `[justchat-web] Attempted to update a nonexistent message.`,
                    );
                    return message;
                  }
                  const { body, ...otherFields } = message;
                  return { body: body.concat(key), ...otherFields };
                });
            }
          }
        }
        if (errors) {
          for (const error of errors) {
            console.error(
              `[justchat-web] Error while streaming events: ${error}`,
            );
          }
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <VStack align="stretch" minH={0} {...otherProps}>
      <VStack
        align="stretch"
        spacing={0}
        flex={1}
        borderWidth={1}
        borderColor="gray.200"
        rounded="md"
        overflow="hidden"
      >
        <Collapse in={!!handle}>
          <Center w="full" bg="pink.600" py={0.5} boxShadow="md">
            <HStack spacing={0} color="pink.100">
              <Text fontSize="xs" opacity={0.85}>
                CHATTING AS
              </Text>
              <Badge color="inherit" bg="transparent">
                {handle}
              </Badge>
            </HStack>
          </Center>
        </Collapse>
        <VStack
          align="stretch"
          spacing={3}
          flex={1}
          flexShrink={1}
          overflowY="auto"
          p={3}
        >
          {messages?.map(({ id, senderHandle, body }) => (
            <ChatMessage
              key={id}
              isActive={senderHandle === handle}
              {...{ senderHandle, body }}
            />
          ))}
          {currentMessage && (
            <ChatMessage
              senderHandle={currentMessage.senderHandle}
              body={currentMessage.body}
              isActive={currentMessage.senderHandle === handle}
              showMarker
            />
          )}
          <Box ref={bottomRef} />
        </VStack>
      </VStack>
      <ScaleFade in={!!handle}>
        {!!handle && (
          <ChatInput
            ref={inputRef}
            handle={handle}
            initialValue={inputInitialValue}
          />
        )}
      </ScaleFade>
    </VStack>
  );
};

type CurrentMessage = {
  senderHandle: string;
  body: string;
};

interface ChatMessageProps extends BoxProps {
  senderHandle: string;
  body: string;
  isActive?: boolean;
  showMarker?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({
  senderHandle,
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
        {senderHandle}
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
