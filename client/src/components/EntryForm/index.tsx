import { useState } from "react";
import { NewEntry } from "../../../../types";
import Input from "../Input";
import Button from "../Button";
import styled from "styled-components";
import Plus from "../Icons/Plus";
import { theme } from "../../theme";
import Return from "../Icons/Return";
import Disk from "../Icons/Disk";
import Label from "../Label";

interface Props {
  onSubmit: (formData: NewEntry) => void;
  onCancel: () => void;
}

export default function EntryForm(props: Props) {
  const { onSubmit, onCancel } = props;

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

  const requiredIcon = <span className="required">&#x2605;</span>;

  return (
    <StyledForm onSubmit={handleSubmit}>
      <div className="limiter">
        <h1>
          <Plus fill={theme.color.dullGreen} /> Add new entry
        </h1>
        <span className="hint">
          <span className="required">{requiredIcon}</span> -{" "}
          <small>required fields</small>
        </span>
        <Label htmlFor="description">Description {requiredIcon}</Label>

        <Input
          required
          autoFocus
          id="description"
          onChange={handleInputChange}
          type="text"
        />
        <Label htmlFor="password">Password {requiredIcon}</Label>
        <Input
          required
          onChange={handleInputChange}
          id="password"
          type="text"
        />
        <Label htmlFor="domain">Domain</Label>
        <Input onChange={handleInputChange} id="domain" type="text" />
        <Label htmlFor="Username">Username</Label>
        <Input onChange={handleInputChange} id="username" type="text" />
        <div className="actions">
          <Button type="button" onClick={onCancel}>
            <Return fill={theme.color.yellow} />
            &nbsp;Cancel
          </Button>
          <Button type="submit">
            <Disk fill={theme.color.yellow} />
            &nbsp;Save
          </Button>
        </div>
      </div>
    </StyledForm>
  );
}

const StyledForm = styled("form")`
  background: ${(props) => props.theme.background.green1};
  padding: ${(props) => props.theme.padding.box};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px;
  animation: fadeIn 0.3s;

  h1 {
    color: ${(props) => props.theme.color.white};
  }

  .hint {
    color: ${(props) => props.theme.color.white};
    text-align: right;
  }

  .required {
    color: ${(props) => props.theme.color.yellow};
  }

  .limiter {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 700px;
  }

  .actions {
    margin-top: ${(props) => props.theme.margin.double};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;
