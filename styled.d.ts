import "styled-components";
import { ssTheme } from "./theme";

type SSTheme = typeof ssTheme;

declare module "styled-components" {
  export interface DefaultTheme extends SSTheme {}
}
