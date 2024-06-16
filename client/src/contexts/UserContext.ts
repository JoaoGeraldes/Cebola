import { createContext } from "react";
import { User } from "../../../types";

export const UserContext = createContext<User>({
  username: null,
  password: null,
});
