import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button(props: Props) {
  return <StyledButton {...props}></StyledButton>;
}

const StyledButton = styled("button")<Props>`
  background: ${(props) => props.theme.color.bg};
  border-top: 2px solid ${(props) => props.theme.color.lightBorder};
  border-left: 2px solid ${(props) => props.theme.color.lightBorder};
  border-bottom: 1px solid ${(props) => props.theme.color.darkBorder};
  border-right: 1px solid ${(props) => props.theme.color.darkBorder};
  color: ${(props) => props.theme.color.fg};
  padding: 0.4em 0.8em;
  cursor: pointer;
  margin: ${(props) => props.theme.margin.default};

  &:hover {
    color: ${(props) => props.theme.color.yellow};
    transition: all 0.4s;
  }

  &:active {
    border-top: 2px solid ${(props) => props.theme.color.darkBorder};
    border-left: 2px solid ${(props) => props.theme.color.darkBorder};
    border-bottom: 1px solid ${(props) => props.theme.color.lightBorder};
    border-right: 1px solid ${(props) => props.theme.color.lightBorder};
    background: ${props => props.theme.color.bg};
  }
`;
