import {extendTheme} from "@chakra-ui/react";

export const theme = extendTheme({
    styles: {
        global: {
            body: {
                backgroundColor: "#eee",
                color: "#333",
            },
            ".side-icon": {
                svg: {
                    height: "24px",
                    width: "24px",
                }
            }
        }
    }
})