import React, { FC, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";

import { Box, BoxProps, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { Avatar, Spinner } from "@chakra-ui/react";

import { ChatQuery, ChatQueryVariables } from "schema";

const CHAT_QUERY = gql`
  query ChatQuery($roomId: ID!) {
    room(id: $roomId) {
      id
      members {
        id
        name
      }
    }
  }
`;

export interface ChatProps extends BoxProps {
  userId: string;
  roomId: string;
  //   roomSecret: string | null;
}

export const Chat: FC<ChatProps> = ({
  userId,
  roomId,
  //   roomSecret,
  ...otherProps
}) => {
  const { data, loading: isLoading, error } = useQuery<
    ChatQuery,
    ChatQueryVariables
  >(CHAT_QUERY, {
    variables: {
      roomId,
    },
  });

  console.log({ data, isLoading, userId, roomId, error });

  const { members } = useMemo(() => data?.room, [data]) ?? {};
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
                <VStack>
                  <Avatar name={name} />
                  <Text>{name}</Text>
                </VStack>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Spinner />
        )}
      </VStack>
    </VStack>
  );
};
