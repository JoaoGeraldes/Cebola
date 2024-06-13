import { useState } from "react";
import { NewEntry } from "../../../../types";
import Input from "../Input";
import Button from "../Button";
import styled from "styled-components";
import Plus from "../Icons/Plus";
import { theme } from "../../theme";
import Return from "../Icons/Return";
import Disk from "../Icons/Disk";

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
          <Plus fill={theme.color.lightBorder} /> Add new entry
        </h1>
        <span className="hint">
          <i>{requiredIcon} - <small>required fields</small></i>
        </span>
        <label htmlFor="description">Description {requiredIcon}</label>
        <Input
          required
          id="description"
          onChange={handleInputChange}
          type="text"
        />
        <label htmlFor="password">Password {requiredIcon}</label>
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px;
  animation: fadeIn 0.3s;
  background: ${(props) => props.theme.color.bg};
  padding: ${(props) => props.theme.padding.box};

  h1 {
    color: ${(props) => props.theme.color.lightBorder};
  }

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

  .actions {
    margin-top: ${(props) => props.theme.margin.double};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  label {
    text-align: left;
    color: ${(props) => props.theme.color.label};
    margin-top: 10px;
    margin-left: ${(props) => props.theme.margin.default};

    .required {
      transform: translateY(-0.5em);
      position: absolute;
      font-size: 0.7em;
      padding-left: 0.5em;
    }
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
