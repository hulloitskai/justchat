import React, { useState } from "react";
import type { NextPage } from "next";

import { Container, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { HandlePicker } from "components/handle";
import { Chat } from "components/chat";

const HomePage: NextPage = () => {
  const [handle, setHandle] = useState<string>();
  return (
    <Container py={8}>
      <VStack align="stretch" spacing={3}>
        <Text
          alignSelf="center"
          fontSize="lg"
          fontWeight="extrabold"
          letterSpacing={3}
        >
          JUSTCHAT<chakra.span color="pink.600">_</chakra.span>
        </Text>
        <HandlePicker onPick={setHandle} />
        <Chat handle={handle} h={96} />
        <Alert status={handle ? "info" : "warning"} rounded="md" px={3} py={2}>
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {handle
              ? "Start typing to chat!"
              : "You are anonymous; this conversation is read-only."}
          </AlertDescription>
        </Alert>
      </VStack>
    </Container>
  );
};

export default HomePage;
