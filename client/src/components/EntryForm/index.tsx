import { useState } from "react";
import { NewEntry } from "../../../../types";
import Input from "../Input";
import Button from "../Button";
import styled from "styled-components";

interface Props {
  onSubmit: (formData: NewEntry) => void;
}

export default function EntryForm(props: Props) {
  const { onSubmit } = props;

  const [formData, setFormData] = useState<NewEntry>({
    description: "",
    password: "",
    domain: "",
    username: "",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.target.id as keyof typeof formData;
    const value = e.target.value;

    setFormData({ ...formData, [id]: value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <StyledForm onSubmit={handleSubmit}>
      <div className="limiter">
        <span className="hint">
          <i>* required fields</i>
        </span>
        <label htmlFor="description">Description *</label>
        <Input
          required
          id="description"
          onChange={handleInputChange}
          type="text"
        />
        <label htmlFor="password">Password *</label>
        <Input
          required
          onChange={handleInputChange}
          id="password"
          type="text"
        />
        <label htmlFor="domain">Domain</label>
        <Input onChange={handleInputChange} id="domain" type="text" />
        <label htmlFor="Username">Username</label>
        <Input onChange={handleInputChange} id="username" type="text" />
        <Button>Save</Button>
      </div>
    </StyledForm>
  );
}

const StyledForm = styled("form")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;

  .hint {
    text-align: right;
    color: ${(props) => props.theme.color.label};
  }

  .limiter {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 700px;
  }

  label {
    text-align: left;
    color: ${(props) => props.theme.color.label};
    margin-top: 10px;
    margin-left: ${(props) => props.theme.margin.default};
  }
`;
