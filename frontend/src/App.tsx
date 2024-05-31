import {BrowserRouter} from "react-router-dom";
import {RootRouter} from "./routers/RootRouter.tsx";
import {ChakraProvider} from "@chakra-ui/react";
import {theme} from "./theme/theme.ts";
import {RecoilRoot} from "recoil";

const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <RecoilRoot>
                <BrowserRouter>
                    <RootRouter />
                </BrowserRouter>
            </RecoilRoot>
        </ChakraProvider>
    )
}

export default App
