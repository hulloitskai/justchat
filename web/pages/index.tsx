import React, { useState } from "react";
import type { NextPage } from "next";

import { Container, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Collapse } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { HandlePicker } from "components/handle";
import { Chat } from "components/chat";

const HomePage: NextPage = () => {
  const [handle, setHandle] = useState<string>();
  return (
    <Container py={[3, 8]} h="100vh">
      <VStack align="stretch" spacing={2} h="full">
        <Text
          alignSelf="center"
          fontSize="lg"
          fontWeight="extrabold"
          letterSpacing={3}
        >
          JUSTCHAT<chakra.span color="pink.600">_</chakra.span>
        </Text>
        <Collapse in={!handle}>
          <HandlePicker onPick={setHandle} />
        </Collapse>
        <Chat handle={handle} flex={1} />
        <Button
          onClick={() => {
            throw new Error("Something went wrong??");
          }}
        >
          Fail
        </Button>
      </VStack>
    </Container>
  );
};

export default HomePage;
