/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendMessageMutation
// ====================================================

export interface SendMessageMutation_sendMessage {
  __typename: "Message";
  id: string;
  content: string;
}

export interface SendMessageMutation {
  sendMessage: SendMessageMutation_sendMessage;
}

export interface SendMessageMutationVariables {
  input: SendMessageInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ChatQuery
// ====================================================

export interface ChatQuery_room_members {
  __typename: "User";
  id: string;
  name: string;
}

export interface ChatQuery_room_messages_sender {
  __typename: "User";
  id: string;
}

export interface ChatQuery_room_messages {
  __typename: "Message";
  id: string;
  createdAt: any;
  content: string;
  sender: ChatQuery_room_messages_sender;
}

export interface ChatQuery_room {
  __typename: "Room";
  id: string;
  members: ChatQuery_room_members[];
  messages: ChatQuery_room_messages[];
}

export interface ChatQuery {
  room: ChatQuery_room | null;
}

export interface ChatQueryVariables {
  roomId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateRoomMutation
// ====================================================

export interface CreateRoomMutation_createRoom {
  __typename: "Room";
  id: string;
  handle: string;
  name: string;
}

export interface CreateRoomMutation {
  createRoom: CreateRoomMutation_createRoom;
}

export interface CreateRoomMutationVariables {
  input: CreateRoomInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: IdentifyUserMutation
// ====================================================

export interface IdentifyUserMutation_identifyUser {
  __typename: "User";
  id: string;
  name: string;
}

export interface IdentifyUserMutation {
  identifyUser: IdentifyUserMutation_identifyUser;
}

export interface IdentifyUserMutationVariables {
  input: IdentifyUserInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RoomQuery
// ====================================================

export interface RoomQuery_roomInfo {
  __typename: "RoomInfo";
  roomId: string;
  name: string;
  hasSecret: boolean;
}

export interface RoomQuery {
  roomInfo: RoomQuery_roomInfo | null;
}

export interface RoomQueryVariables {
  handle: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface CreateRoomInput {
  name: string;
  handle: string;
  secret?: string | null;
}

export interface IdentifyUserInput {
  name: string;
  roomId: string;
  roomSecret?: string | null;
}

export interface SendMessageInput {
  content: string;
  senderId: string;
  roomId: string;
  roomSecret?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
