import { createContext } from "react";

export const ThemeContext = createContext<{
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  currentTheme: "dark" | "light";
}>({
  setTheme: () => null,
  currentTheme: "light",
});
