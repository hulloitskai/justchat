import React, { useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import detect from "browser-detect";

import { Container, Box, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { HandlePicker } from "components/handle";
import { Chat } from "components/chat";

const HomePage: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState<string>();

  const isMobile = useMemo(() => {
    const browser = detect();
    return browser.mobile;
  }, []);

  return (
    <Container py={8} h="100vh" minH={96}>
      <VStack align="stretch" spacing={3} h="full">
        <Text
          alignSelf="center"
          fontSize="lg"
          fontWeight="extrabold"
          letterSpacing={3}
        >
          JUSTCHAT<chakra.span color="pink.600">_</chakra.span>
        </Text>
        <HandlePicker onPick={setHandle} />
        <Chat handle={handle} flex={1} />
        <Box pos="relative">
          <Alert
            status={handle ? "info" : "warning"}
            rounded="md"
            px={3}
            py={2}
          >
            <AlertIcon />
            <AlertDescription fontSize="sm">
              {handle ? (
                <>
                  Start typing!
                  {isMobile && (
                    <>
                      {" "}
                      <chakra.span
                        fontWeight="medium"
                        textDecor="underline"
                        onClick={() => {
                          const inputEl = inputRef.current;
                          if (inputEl) {
                            inputEl.value = "";
                            inputEl.focus();
                          }
                        }}
                      >
                        Click here to open keyboard.
                      </chakra.span>
                    </>
                  )}
                </>
              ) : (
                "You are anonymous; this conversation is read-only."
              )}
            </AlertDescription>
          </Alert>
          <Input
            ref={inputRef}
            pos="absolute"
            inset={0}
            zIndex="-1"
            border="none"
            pointerEvents="none"
          />
        </Box>
      </VStack>
    </Container>
  );
};

export default HomePage;
