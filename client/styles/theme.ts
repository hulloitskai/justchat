import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

import {
  blueGray,
  amber,
  emerald,
  teal,
  blue,
  indigo,
  violet,
  pink,
  rose,
} from "tailwindcss/colors";

const THEME = extendTheme({
  colors: {
    gray: blueGray,
    red: rose,
    yellow: amber,
    green: emerald,
    teal,
    blue,
    indigo,
    purple: violet,
    pink,
  },
  fonts: {
    body:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    heading:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  },
  space: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  sizes: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  styles: {
    global: {
      html: {
        WebkitFontSmoothing: "auto",
      },
      body: {
        bg: "gray.100",
        lineHeight: "normal",
      },
    },
  },
  components: {
    Button: {
      variants: {
        // @ts-ignore
        solid: (props: Record<string, any>) => {
          const { colorScheme } = props;
          if (colorScheme === "black") {
            const bg = mode("black", "white")(props);
            return {
              bg,
              _hover: {
                bg: mode("gray.700", "gray.200")(props),
                _disabled: { bg },
              },
              _active: { bg: mode("gray.800", "gray.100")(props) },
            };
          }
        },
      },
    },
    Form: {
      baseStyle: {
        helperText: {
          mt: 1,
        },
      },
    },
    FormLabel: {
      baseStyle: {
        mb: 1,
      },
    },
    FormError: {
      baseStyle: {
        text: {
          mt: 1,
        },
      },
    },
  },
});

export default THEME;
