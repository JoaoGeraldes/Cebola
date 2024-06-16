import { createContext } from "react";

export const MessageContext = createContext<{
  message: string | null;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  message: null,
  setMessage: () => null,
});
