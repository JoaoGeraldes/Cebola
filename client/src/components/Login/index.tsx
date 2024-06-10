import { useState } from "react";
import { CebolaClient } from "../../CebolaClient";
import Button from "../Button";
import Input from "../Input";

interface Props {
  onSubmit: (inputData: { username: string; password: string }) => void;
}

export default function Login(props: Props) {
  const { onSubmit } = props;

  const [inputData, setInputData] = useState({
    username: "",
    password: "",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(inputData);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="username"
          onChange={(e) =>
            setInputData({ ...inputData, username: e.target.value })
          }
        />
        <Input
          type="text"
          placeholder="password"
          onChange={(e) =>
            setInputData({ ...inputData, password: e.target.value })
          }
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
