import React, { forwardRef, useEffect } from "react";
import { useImperativeHandle, useRef, useState } from "react";

import { Center } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Fade } from "@chakra-ui/react";

import {
  InputProps,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

import { gql } from "@apollo/client";
import { useChatInputUpdateMutation } from "apollo";

gql`
  mutation ChatInputUpdate($input: UpdateInput!) {
    update(input: $input) {
      ok
    }
  }
`;

export interface ChatInputProps extends InputProps {
  handle: string;
  initialValue?: string;
}

export type ChatInputHandle = {
  reset: () => void;
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ handle, initialValue, ...otherProps }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      const inputEl = inputRef.current;
      if (inputEl && initialValue) {
        inputEl.value = initialValue;
      }
    }, []);

    const [isDisabled, setIsDisabled] = useState(false);
    useEffect(() => {
      if (!isDisabled) {
        setTimeout(() => {
          const inputEl = inputRef.current;
          if (inputEl) {
            inputEl.focus();
          }
        }, 10);
      }
    }, [isDisabled]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        const inputEl = inputRef.current;
        if (inputEl) {
          inputEl.value = "";
        }
        setIsDisabled(true);
        setTimeout(() => setIsDisabled(false), 1000);
      },
    }));

    const [runUpdateMutation, { loading: isLoading }] =
      useChatInputUpdateMutation();
    return (
      <InputGroup {...otherProps}>
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          autoFocus
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          isDisabled={isDisabled}
          onMouseDown={event => {
            event.preventDefault();
            const { currentTarget } = event;
            if (currentTarget !== document.activeElement) {
              currentTarget.focus();
            }
          }}
          onKeyDown={event => {
            if (isDisabled) {
              return;
            }
            const { key, metaKey, ctrlKey, currentTarget } = event;
            if (metaKey || ctrlKey) {
              if (metaKey && key === "l") {
                return;
              }
              if (metaKey && key === "r") {
                return;
              }
              return event.preventDefault();
            }
            if (key.length > 1) {
              if (key === "Escape") {
                return currentTarget.blur();
              }
              if (!["Enter", "Backspace"].includes(key)) {
                return event.preventDefault();
              }
            }
            runUpdateMutation({
              variables: {
                input: {
                  senderHandle: handle,
                  key,
                },
              },
            });
            if (key === "Enter") {
              currentTarget.value = "";
            }
          }}
          _focus={{ borderColor: "pink.600", borderWidth: 2 }}
        />
        <InputRightElement>
          <Fade in={isLoading}>
            <Center>
              <Spinner color="pink.600" size="sm" />
            </Center>
          </Fade>
        </InputRightElement>
      </InputGroup>
    );
  },
);

ChatInput.displayName = "ChatInput";
