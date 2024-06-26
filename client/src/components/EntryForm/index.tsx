import { useState } from "react";
import { NewEntry } from "../../../../types";
import Input from "../Input";
import Button from "../Button";
import styled, { useTheme } from "styled-components";
import Plus from "../Icons/Plus";
import Return from "../Icons/Return";
import Disk from "../Icons/Disk";
import Label from "../Label";

interface Props {
  onSubmit: (formData: NewEntry) => void;
  onCancel: () => void;
}

export default function EntryForm(props: Props) {
  const { onSubmit, onCancel } = props;
  const theme = useTheme();

  const [formData, setFormData] = useState<NewEntry>({
    description: "",
    password: "",
    domain: "",
    username: "",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.target.id as keyof typeof formData;
    const value = e.target.value;

    setFormData({ ...formData, [id]: value?.trim() });
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
          <Plus fill={theme.color.d} /> Add new entry
        </h1>
        <span className="hint">
          <span className="required">{requiredIcon}</span> -{" "}
          <small>required fields</small>
        </span>
        <Label htmlFor="description">Description {requiredIcon}</Label>

        <Input
          autoComplete="one-time-code"
          required
          autoFocus
          id="description"
          onChange={handleInputChange}
          type="text"
        />
        <Label htmlFor="password">Password {requiredIcon}</Label>
        <Input
          autoComplete="one-time-code"
          required
          onChange={handleInputChange}
          id="password"
          type="text"
        />
        <Label htmlFor="domain">Domain</Label>
        <Input
          autoComplete="one-time-code"
          onChange={handleInputChange}
          id="domain"
          type="text"
        />
        <Label htmlFor="Username">Username</Label>
        <Input
          autoComplete="one-time-code"
          onChange={handleInputChange}
          id="username"
          type="text"
        />
        <div className="actions">
          <Button type="button" onClick={onCancel}>
            <Return fill={theme.color.b} />
            &nbsp;Cancel
          </Button>
          <Button type="submit">
            <Disk fill={theme.color.b} />
            &nbsp;Save
          </Button>
        </div>
      </div>
    </StyledForm>
  );
}

const StyledForm = styled("form")`
  background: ${(props) => props.theme.background.a};
  padding: ${(props) => props.theme.padding.box};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px;
  animation: fadeIn 0.3s;

  h1 {
    color: ${(props) => props.theme.color.a};
  }

  .hint {
    color: ${(props) => props.theme.color.a};
    text-align: right;
  }

  .required {
    color: ${(props) => props.theme.color.b};
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
