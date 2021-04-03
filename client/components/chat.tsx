import React, { FC, useEffect, useRef, useMemo } from "react";
import keyBy from "lodash/keyBy";
import isEmpty from "lodash/isEmpty";

import { useForm } from "react-hook-form";
import { useQuery, useMutation, gql } from "@apollo/client";

import { HiPaperAirplane } from "react-icons/hi";

import { Box, BoxProps, VStack, HStack } from "@chakra-ui/react";
import { Text, Icon, IconButton } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { Avatar, Spinner } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

import { ChatQuery, ChatQueryVariables } from "schema";
import { SendMessageMutation, SendMessageMutationVariables } from "schema";

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessageMutation($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
    }
  }
`;

const CHAT_QUERY = gql`
  query ChatQuery($roomId: ID!) {
    room(id: $roomId) {
      id
      members {
        id
        name
      }
      messages {
        id
        createdAt
        content
        sender {
          id
        }
      }
    }
  }
`;

export interface ChatProps extends BoxProps {
  userId: string;
  roomId: string;
  //   roomSecret: string | null;
}

interface ChatFieldValues {
  content: string;
}

export const Chat: FC<ChatProps> = ({
  userId,
  roomId,
  //   roomSecret,
  ...otherProps
}) => {
  const toast = useToast({
    position: "bottom",
    isClosable: true,
  });

  const { data, previousData, refetch } = useQuery<
    ChatQuery,
    ChatQueryVariables
  >(CHAT_QUERY, {
    variables: {
      roomId,
    },
    pollInterval: 1000,
    onError: error => {
      toast({
        status: "error",
        title: "Failed to load chat",
        description: error.toString(),
      });
    },
  });

  const [sendMessage, { loading: isSending }] = useMutation<
    SendMessageMutation,
    SendMessageMutationVariables
  >(SEND_MESSAGE_MUTATION, {
    onCompleted: () => refetch(),
    onError: error => {
      toast({
        status: "error",
        title: "Failed to send message",
        description: error.toString(),
      });
    },
  });

  const { members, messages } = useMemo(() => data?.room, [data]) ?? {};
  const membersById = useMemo(() => keyBy(members, "id"), [members]);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { isValid },
  } = useForm<ChatFieldValues>({
    mode: "all",
  });
  const onSubmit = handleSubmit(({ content }) => {
    setValue("content", "");
    sendMessage({
      variables: {
        input: {
          content,
          senderId: userId,
          roomId,
        },
      },
    });
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = bottomRef.current;
    if (!element) {
      return;
    }

    const isFirstLoad =
      !isEmpty(messages) && isEmpty(previousData?.room?.messages);
    element.scrollIntoView({
      behavior: isFirstLoad ? undefined : "smooth",
    });
  }, [messages]);

  const renderChatBox = () => {
    if (!messages) {
      return <Spinner />;
    }
    return (
      <VStack align="stretch" bg="white" rounded="md" p={3}>
        {!isEmpty(messages) ? (
          <VStack align="stretch" flex={1} maxH={72} overflowY="scroll">
            {messages.map(({ id, content, sender: { id: senderId } }) => {
              const sender = membersById[senderId];
              if (!sender) {
                throw new Error(
                  "Message sender does not correspond to any " +
                    "known room member.",
                );
              }
              return (
                <VStack
                  key={id}
                  align="stretch"
                  spacing={0}
                  bg="gray.100"
                  rounded="md"
                  p={2}
                >
                  <Text>{content}</Text>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    {sender.name}
                  </Text>
                </VStack>
              );
            })}
            <Box ref={bottomRef} />
          </VStack>
        ) : (
          <VStack align="center" flex={1}>
            <Text color="gray.400">room has no messages</Text>
          </VStack>
        )}
        <HStack as="form" onSubmit={onSubmit}>
          <Input
            ref={register({ required: true })}
            type="text"
            name="content"
            placeholder="Enter your message here..."
            isRequired
          />
          <IconButton
            type="submit"
            icon={<Icon as={HiPaperAirplane} transform="rotate(90deg)" />}
            aria-label="Send"
            isLoading={isSending}
            isDisabled={!isValid}
          />
        </HStack>
      </VStack>
    );
  };

  return (
    <VStack align="stretch" spacing={4} {...otherProps}>
      <Box>
        <Text color="gray.700">ur room id is {roomId}</Text>
        <Text color="gray.500">
          this is where you can pretend you have friends
        </Text>
      </Box>
      <VStack align="stretch">
        <Text fontSize="lg" fontWeight="medium">
          ur friends:
        </Text>
        {members ? (
          <Wrap spacing={4}>
            {members.map(({ id, name }) => (
              <WrapItem key={id}>
                <VStack spacing={1}>
                  <Avatar name={name} size="sm" />
                  <Text fontSize="sm">{name}</Text>
                </VStack>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Spinner />
        )}
      </VStack>
      <VStack align="stretch">
        <Text fontSize="lg" fontWeight="medium">
          ur msgs:
        </Text>
        {renderChatBox()}
      </VStack>
    </VStack>
  );
};
