import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button(props: Props) {
  return <StyledButton {...props}></StyledButton>;
}

const StyledButton = styled("button")<Props>`
  background: ${(props) => props.theme.background.green1};
  border-top: 1px solid ${(props) => props.theme.borderColor.green1};
  border-left: 1px solid ${(props) => props.theme.borderColor.green1};
  border-bottom: 1px solid ${(props) => props.theme.borderColor.green2};
  border-right: 1px solid ${(props) => props.theme.borderColor.green2};
  color: ${(props) => props.theme.color.yellow};
  letter-spacing: 1px;
  font-variant: petite-caps;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.4em 0.6em;
  height: 36px;

  &:hover {
    color: ${(props) => props.theme.color.yellow};
    transition: background 0.25s;
    background: ${(props) => props.theme.background.green2};
  }

  &:active {
    border-top: 1px solid ${(props) => props.theme.borderColor.green2};
    border-left: unset;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.green1};
    border-right: unset;
    background: ${(props) => props.theme.background.green1};
  }

  &:focus-visible {
    outline: none;
  }
`;
