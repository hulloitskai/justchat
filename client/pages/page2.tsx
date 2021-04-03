import React, { FC, useMemo, useState } from "react";
import first from "lodash/first";

import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";

import { Container, Box } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";

import { Chat } from "components/chat";
import { Identify } from "components/identify";
import { RoomQuery, RoomQueryVariables } from "schema";

// const ROOM_QUERY = gql`
//   query RoomQuery($handle: String!) {
//     roomInfo(handle: $handle) {
//       roomId
//       name
//       hasSecret
//     }
//   }
// `;

// const useHandle = () => {
//   const router = useRouter();
//   const { handle: handleParam } = router.query;
//   return Array.isArray(handleParam) ? first(handleParam) : handleParam;
// };

const PageTwo: FC = () => {
  // Fetch room info from server.
  // const { data, error, loading: isLoading } = useQuery<
  //   RoomQuery,
  //   RoomQueryVariables
  // >(ROOM_QUERY, {
  //   variables: handle ? { handle } : undefined,
  //   skip,
  // });

  // // Destructure room info.
  // const { roomId, name, hasSecret } =
  //   useMemo(() => data?.roomInfo, [data]) ?? {};

  // Handle user identification.
  const [roomId, seRoomId] = useState<string | undefined>();

  // const renderError = () => {
  //   if (!error) {
  //     return null;
  //   }
  //   return (
  //     <Box>
  //       <Text>An error occurred. Whoops?</Text>
  //       <Text>{error.toString()}</Text>
  //     </Box>
  //   );
  // };

  // const renderContent = () => {
  //   return (
  //     <Chat
  //       userId={userId}
  //       roomId={roomId}
  //       // roomSecret={null}
  //     />
  //   );
  // };

  return (
    <Container py={12}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading>make room?</Heading>
          <Text>make room</Text>
        </Box>
        {/* {isLoading && <Spinner />}
        {renderError()}
        {renderContent()} */}
      </VStack>
    </Container>
  );
};

// const PageTwo: FC = () => {
//   return <div>Hi</div>;
// };

export default PageTwo;
