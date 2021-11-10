import React, { FC, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";

import { HiClock } from "react-icons/hi";

import { BoxProps, VStack, HStack } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { Fade } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

export interface ChatMessageProps extends BoxProps {
  readonly senderHandle: string;
  readonly body: string;
  readonly expiresAt?: string;
  readonly isActive?: boolean;
  readonly isCurrent?: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({
  senderHandle,
  body,
  expiresAt: expiresAtISO,
  isActive,
  isCurrent,
  ...otherProps
}) => {
  const expiresAt = useMemo(() => {
    if (expiresAtISO) {
      return DateTime.fromISO(expiresAtISO);
    }
  }, [expiresAtISO]);

  const [secondsRemaining, setSecondsRemaining] = useState<number | undefined>(
    () => {
      if (expiresAt) {
        const secondsRemaining = expiresAt.diffNow("seconds").seconds;
        return Math.round(secondsRemaining);
      }
    },
  );
  useEffect(() => {
    if (
      expiresAt &&
      (secondsRemaining === undefined || secondsRemaining > -1)
    ) {
      const interval = setTimeout(() => {
        const secondsRemaining = expiresAt.diffNow("seconds").seconds;
        setSecondsRemaining(secondsRemaining);
      }, 250);
      return () => {
        clearTimeout(interval);
      };
    }
  }, [secondsRemaining]);

  if (secondsRemaining !== undefined && secondsRemaining < -0.5) {
    return null;
  }
  return (
    <Fade
      in={secondsRemaining === undefined || secondsRemaining >= 2}
      transition={{ exit: { duration: 3 } }}
    >
      <VStack align="stretch" spacing={1} rounded="2xl" {...otherProps}>
        <HStack>
          <Badge
            alignSelf="start"
            bg={isActive ? "pink.600" : "gray.600"}
            color="white"
          >
            {senderHandle}
          </Badge>
          {secondsRemaining !== undefined && (
            <Badge fontWeight="medium" textTransform="unset" color="gray.500">
              <HStack spacing={1}>
                <Icon as={HiClock} />
                <Text>
                  {secondsRemaining > 0 ? Math.ceil(secondsRemaining) : 0}s
                </Text>
              </HStack>
            </Badge>
          )}
        </HStack>
        <Text color="gray.800" fontSize="sm" whiteSpace="pre-wrap">
          {body || <>&nbsp;</>}
          {isCurrent && (
            <chakra.span color="pink.500" fontWeight="semibold">
              _
            </chakra.span>
          )}
        </Text>
      </VStack>
    </Fade>
  );
};
