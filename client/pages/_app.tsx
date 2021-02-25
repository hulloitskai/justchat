import React, { FC } from "react";
import { AppProps } from "next/app";

import { ApolloProvider } from "services/apollo";
import { ChakraProvider } from "services/chakra";

const App: FC<AppProps> = ({ Component, pageProps }) => (
  <ApolloProvider>
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  </ApolloProvider>
);

export default App;
