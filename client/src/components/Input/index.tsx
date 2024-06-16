import styled from "styled-components";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function Input(props: Props) {
  return <StyledInput {...props} />;
}

const StyledInput = styled("input")<Props>`
  background: ${({ theme }) => theme.background.green2};
  border-top: 1px solid ${({ theme }) => theme.borderColor.green2};
  border-left: 1px solid ${({ theme }) => theme.borderColor.green2};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor.green1};
  border-right: 1px solid ${({ theme }) => theme.borderColor.green1};
  color: ${({ theme }) => theme.color.white};
  width: 100%;
  padding: 8px 3px;
  opacity: 0.5;
  transition: opacity 0.4s;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 1.2em;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.intenseGreen};
    outline-style: dashed;
  }

  &:hover {
    opacity: 1;
  }
`;
