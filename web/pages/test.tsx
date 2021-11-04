import React from "react";
import type { NextPage } from "next";

import { Button } from "@chakra-ui/react";

const TestPage: NextPage = () => {
  return (
    <Button
      onClick={() => {
        console.error("[TestPage] This is an error log!");
      }}
    >
      Log An Error
    </Button>
  );
};

export default TestPage;
