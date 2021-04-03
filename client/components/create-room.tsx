import React, { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "@apollo/client";

import { BoxProps, VStack } from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { Input, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

import slugify from "slugify";

import {
  CreateRoomMutation,
  CreateRoomMutationVariables,
  CreateRoomMutation_createRoom,
} from "schema";

const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoomMutation($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      handle
      name
    }
  }
`;

export interface CreateRoomProps extends BoxProps {
  onCreate: (room: CreateRoomMutation_createRoom) => void;
}

interface CreateRoomFieldValues {
  name: string;
  handle: string;
}

export const CreateRoom: FC<CreateRoomProps> = ({
  onCreate,
  ...otherProps
}) => {
  const toast = useToast({
    position: "bottom",
    isClosable: true,
  });

  const [createRoom, { loading: isLoading }] = useMutation<
    CreateRoomMutation,
    CreateRoomMutationVariables
  >(CREATE_ROOM_MUTATION, {
    onCompleted: ({ createRoom: room }) => {
      onCreate(room);
    },
    onError: error => {
      toast({
        status: "error",
        title: "Failed to create room",
        description: error.toString(),
      });
    },
  });

  const {
    handleSubmit,
    register,
    errors,
    watch,
    formState: { isValid },
  } = useForm<CreateRoomFieldValues>({
    mode: "all",
  });

  const name = watch("name", "");
  const derivedHandle = useMemo(
    () =>
      slugify(name, {
        lower: true,
      }),
    [name],
  );

  const onSubmit = handleSubmit(({ name, handle }) => {
    createRoom({
      variables: {
        input: {
          name,
          handle: handle || derivedHandle,
        },
      },
    });
  });

  return (
    <VStack as="form" align="stretch" {...otherProps}>
      <FormControl isRequired isInvalid={!!errors.name}>
        <FormLabel>Room Name</FormLabel>
        <Input
          ref={register({
            required: true,
            minLength: {
              value: 3,
              message: "Too short (minimum 3 characters).",
            },
            maxLength: {
              value: 128,
              message: "Too long.",
            },
          })}
          name="name"
          type="text"
          placeholder="Ass Room"
          minLength={3}
          maxLength={128}
          isRequired
        />
        {errors.name && (
          <FormErrorMessage>{errors.name.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl isInvalid={!!errors.handle}>
        <FormLabel>Handle</FormLabel>
        <Input
          ref={register({
            required: false,
            pattern: {
              value: /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/,
              message:
                "Invalid handle (lowercase alphanumeric + dashes, no spaces).",
            },
            maxLength: {
              value: 128,
              message: "Too long.",
            },
          })}
          name="handle"
          type="text"
          placeholder={derivedHandle || "ass-room"}
          pattern="^[a-z0-9][a-z0-9\-]*[a-z0-9]$"
          maxLength={128}
          isRequired
        />
        {errors.handle && (
          <FormErrorMessage>{errors.handle.message}</FormErrorMessage>
        )}
      </FormControl>
      <Button
        type="submit"
        colorScheme="pink"
        isLoading={isLoading}
        isDisabled={!isValid}
        onClick={onSubmit}
      >
        Create Room
      </Button>
    </VStack>
  );
};
