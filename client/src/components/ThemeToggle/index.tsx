import styled, { useTheme } from "styled-components";
import Button from "../Button";
import Sun from "../Icons/Sun";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import Moon from "../Icons/Moon";

export default function ThemeToggle() {
  const theme = useTheme();
  const { currentTheme, setTheme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <Button
        onClick={() => {
          const changeToTheme = currentTheme === "dark" ? "light" : "dark";

          localStorage.setItem("theme", changeToTheme);
          currentTheme === "dark"
            ? setTheme(changeToTheme)
            : setTheme(changeToTheme);
        }}
      >
        {currentTheme === "dark" ? (
          <Sun fill={theme.color.b} />
        ) : (
          <Moon fill={theme.color.b} />
        )}
      </Button>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: ${(props) => props.theme.margin.double};
`;
