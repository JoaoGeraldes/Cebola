import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function Input(props: Props) {
  return <StyledInput {...props} />;
  /* return <StyledButton {...props}></StyledButton>; */
}

const StyledInput = styled("input")<Props>`
  background: ${(props) => props.theme.color.darkBg};
  border-top: 2px solid ${(props) => props.theme.color.darkBorder};
  border-left: 2px solid ${(props) => props.theme.color.darkBorder};
  border-bottom: 1px solid ${(props) => props.theme.color.lightBorder};
  border-right: 1px solid ${(props) => props.theme.color.lightBorder};
  color: ${(props) => props.theme.color.fg};
  padding: 0.5em;
  opacity: 0.7;
  transition: opacity 0.4s;
  margin: 5px;

  &:focus-visible {
    outline: 2px solid #ffffff89;
    outline-style: dashed;
  }

  &:hover {
    opacity: 1;
  }
`;
