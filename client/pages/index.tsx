import React, { FC } from "react";
import { useRouter } from "next/router";

import { Container, Box } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";

import { CreateRoom } from "components/create-room";

const Home: FC = () => {
  const router = useRouter();
  return (
    <Container py={12}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading>u wanna crfeate a room?</Heading>
          <Text>hehe</Text>
        </Box>
        <CreateRoom onCreate={({ handle }) => router.push(`/room/${handle}`)} />
      </VStack>
    </Container>
  );
};

export default Home;
