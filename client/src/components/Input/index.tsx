import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function Input(props: Props) {
  return <StyledInput {...props} />;
}

const StyledInput = styled("input")<Props>`
  background: ${({ theme }) => theme.background.b};
  border-top: 1px solid ${({ theme }) => theme.borderColor.b};
  border-left: 1px solid ${({ theme }) => theme.borderColor.b};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor.a};
  border-right: 1px solid ${({ theme }) => theme.borderColor.a};
  color: ${({ theme }) => theme.color.a};
  width: 100%;
  padding: 8px 3px;
  opacity: 0.5;
  transition: opacity 0.4s;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 1.2em;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.c};
    outline-style: dashed;
  }

  &:hover {
    opacity: 1;
  }
`;
