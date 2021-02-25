import React, { FC } from "react";
import THEME from "styles/theme";

import { ChakraProvider as Provider } from "@chakra-ui/react";

export interface ChakraProviderProps {}

export const ChakraProvider: FC<ChakraProviderProps> = ({ children }) => (
  <Provider theme={THEME}>{children}</Provider>
);
