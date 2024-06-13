import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button(props: Props) {
  return <StyledButton {...props}></StyledButton>;
}

const StyledButton = styled("button")<Props>`
  letter-spacing: 1px;
  font-variant: petite-caps;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.color.bg};
  border-top: 1px solid ${(props) => props.theme.color.lightBorder};
  border-left: 1px solid ${(props) => props.theme.color.lightBorder};
  border-bottom: 1px solid ${(props) => props.theme.color.darkBorder};
  border-right: 1px solid ${(props) => props.theme.color.darkBorder};
  color: ${(props) => props.theme.color.yellow};
  cursor: pointer;
  padding: 0.4em 0.6em;
  height: 36px;
  /* margin: ${(props) => props.theme.margin.default}; */

  &:hover {
    color: ${(props) => props.theme.color.yellow};
    transition: background 0.25s;
    background: ${(props) => props.theme.color.darkBg};
  }

  &:active {
    border-top: 1px solid ${(props) => props.theme.color.darkBorder};
    border-left: unset;
    border-bottom: 1px solid ${(props) => props.theme.color.lightBorder};
    border-right: unset;
    background: ${(props) => props.theme.color.bg};
  }

  &:focus-visible {
    outline: none;
  }
`;
