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
  width: 100%;
  background: ${(props) => props.theme.color.darkBg};
  border-top: 1px solid ${(props) => props.theme.color.darkBorder};
  border-left: 1px solid ${(props) => props.theme.color.darkBorder};
  border-bottom: 1px solid ${(props) => props.theme.color.lightBorder};
  border-right: 1px solid ${(props) => props.theme.color.lightBorder};
  color: ${(props) => props.theme.color.fg};
  padding: ${(props) => props.theme.padding.default};
  opacity: 0.5;
  transition: opacity 0.4s;
  margin-top: 5px;
  margin-bottom: 5px;


  &:focus-visible {
    outline: 1px solid ${(props) => props.theme.color.greeen};
    outline-style: dashed;
  }

  &:hover {
    opacity: 1;
  }
`;
