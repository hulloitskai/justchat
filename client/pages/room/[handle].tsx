import React, { FC, useMemo, useState } from "react";
import first from "lodash/first";

import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";

import { Container, Box } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";

import { Chat } from "components/chat";
import { Identify } from "components/identify";
import { RoomQuery, RoomQueryVariables } from "schema";

const ROOM_QUERY = gql`
  query RoomQuery($handle: String!) {
    roomInfo(handle: $handle) {
      roomId
      name
      hasSecret
    }
  }
`;

const useHandle = () => {
  const router = useRouter();
  const { handle: handleParam } = router.query;
  return Array.isArray(handleParam) ? first(handleParam) : handleParam;
};

const Room: FC = () => {
  const handle = useHandle();
  const skip = !handle;

  // Fetch room info from server.
  const { data, error, loading: isLoading } = useQuery<
    RoomQuery,
    RoomQueryVariables
  >(ROOM_QUERY, {
    variables: handle ? { handle } : undefined,
    skip,
  });

  // Destructure room info.
  const { roomId, name, hasSecret } =
    useMemo(() => data?.roomInfo, [data]) ?? {};

  // Handle user identification.
  const [userId, setUserId] = useState<string | undefined>();

  const renderError = () => {
    if (!error) {
      return null;
    }
    return (
      <Box>
        <Text>An error occurred. Whoops?</Text>
        <Text>{error.toString()}</Text>
      </Box>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return null;
    }
    if (!roomId) {
      return (
        <Box>
          <Text>ur room is bad n u shud feel bad</Text>
        </Box>
      );
    }
    if (hasSecret) {
      return (
        <Box>
          <Text>
            u cant go to this room cuz it has a secret. also we were too lazy to
            impl. secret input
          </Text>
        </Box>
      );
    }
    if (!userId) {
      return (
        <Identify
          roomId={roomId}
          // roomSecret={null}
          onIdentify={setUserId}
        />
      );
    }
    return (
      <Chat
        userId={userId}
        roomId={roomId}
        // roomSecret={null}
      />
    );
  };

  return (
    <Container py={12}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading>S3Xy chatr00m</Heading>
          <Text>handle: {handle}</Text>
        </Box>
        {isLoading && <Spinner />}
        {renderError()}
        {renderContent()}
      </VStack>
    </Container>
  );
};

export default Room;
