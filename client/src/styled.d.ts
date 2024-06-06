// import original module declarations
import "styled-components";
import { Themezor } from "./theme";

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme extends Themezor {
    /*     borderRadius: string;

    colors: {
      main: string;
      secondary: string;
    }; */
  }
}
