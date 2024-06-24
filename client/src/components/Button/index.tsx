import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button(props: Props) {
  return <StyledButton {...props}></StyledButton>;
}

const StyledButton = styled("button")<Props>`
  background: ${(props) => props.theme.background.a};
  border-top: 1px solid ${(props) => props.theme.borderColor.a};
  border-left: 1px solid ${(props) => props.theme.borderColor.a};
  border-bottom: 1px solid ${(props) => props.theme.borderColor.b};
  border-right: 1px solid ${(props) => props.theme.borderColor.b};
  color: ${(props) => props.theme.color.b};
  letter-spacing: 1px;
  font-variant: petite-caps;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.4em 0.6em;
  height: 36px;

  &:hover {
    color: ${(props) => props.theme.color.b};
    transition: background 0.25s;
    background: ${(props) => props.theme.background.b};
  }

  &:active {
    border-top: 1px solid ${(props) => props.theme.borderColor.b};
    border-left: unset;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.a};
    border-right: unset;
    background: ${(props) => props.theme.background.a};
  }

  &:focus-visible {
    outline: none;
  }
`;
