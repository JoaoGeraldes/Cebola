import styled from "styled-components";
import Button from "../Button";

interface Props {
  onToggle: () => void;
}

export default function ThemeToggle({ onToggle }: Props) {
  return (
    <StyledContainer>
      <Button onClick={onToggle}>Toggle</Button>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: ${(props) => props.theme.margin.double};
`;
