import { useState } from "react";
import Button from "../Button";
import Input from "../Input";
import styled from "styled-components";
import Label from "../Label";

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
    <StyledLogin>
      <img src="/cebola_logo.png" alt="" />
      <form onSubmit={handleSubmit}>
        <Label htmlFor="username">username</Label>
        <Input
          id="username"
          type="text"
          onChange={(e) =>
            setInputData({ ...inputData, username: e.target.value })
          }
        />

        <Label htmlFor="password">password</Label>
        <Input
          id="password"
          type="text"
          onChange={(e) =>
            setInputData({ ...inputData, password: e.target.value })
          }
        />

        <br />
        <br />
        <Button type="submit">Login</Button>
      </form>
    </StyledLogin>
  );
}

const StyledLogin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 200px;
    height: auto;
  }
`;
