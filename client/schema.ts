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

export interface ChatQuery_room {
  __typename: "Room";
  id: string;
  members: ChatQuery_room_members[];
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

export interface IdentifyUserInput {
  name: string;
  roomId: string;
  roomSecret?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
