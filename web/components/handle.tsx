import React, { FC } from "react";

import { useForm } from "react-hook-form";

import { BoxProps, Box } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { ScaleFade } from "@chakra-ui/react";

import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";

const HANDLE_REGEX = `^([a-z0-9]+-*)*[a-z0-9]$`;

export interface HandlePickerProps extends Omit<BoxProps, "onPick"> {
  onPick: (handle: string) => void;
}

export const HandlePicker: FC<HandlePickerProps> = ({
  onPick,
  ...otherProps
}) => {
  const {
    register,
    formState: { errors, isValid, isSubmitted },
    handleSubmit,
  } = useForm<{ handle: string }>({ mode: "all" });
  const onSubmit = handleSubmit(({ handle }) => {
    onPick(handle);
  });
  return (
    <Box as="form" onSubmit={onSubmit} {...otherProps}>
      <FormControl isRequired isInvalid={!!errors.handle}>
        <FormLabel>Handle</FormLabel>
        <InputGroup>
          <Input
            placeholder="jeff-bezos"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            pattern={HANDLE_REGEX}
            minLength={2}
            maxLength={32}
            {...register("handle", {
              required: true,
              pattern: {
                value: new RegExp(HANDLE_REGEX),
                message: "Invalid format.",
              },
              minLength: {
                value: 2,
                message: "Too short.",
              },
              maxLength: {
                value: 32,
                message: "Too long.",
              },
            })}
          />
          <InputRightElement
            w="5.5rem"
            pointerEvents={isValid ? undefined : "none"}
          >
            <ScaleFade in={isValid} unmountOnExit>
              <Button
                type="submit"
                size="sm"
                colorScheme="black"
                h={6}
                px={1.5}
              >
                Continue
              </Button>
            </ScaleFade>
          </InputRightElement>
        </InputGroup>
        {!!errors.handle?.message && (
          <FormErrorMessage>{errors.handle.message}</FormErrorMessage>
        )}
        <FormHelperText>
          Can only contain lowercase letters, numbers, and dashes.
        </FormHelperText>
      </FormControl>
    </Box>
  );
};
