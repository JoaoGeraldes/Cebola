import styled from "styled-components";

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function Modal({ children }: Props) {
  return <StyledModal>{children}</StyledModal>;
}

const StyledModal = styled("div")`
  background: ${(props) => props.theme.background.c};
  padding: ${(props) => props.theme.padding.default};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 100;
  position: absolute;
  top: 0;

  .cebola-guy {
    transform: translateY(40%);
    animation: sneaky 0.4s;
    animation-delay: 0.3s;
    animation-fill-mode: forwards;
    animation-timing-function: ease-out;
    z-index: -1;
    opacity: 0;

    @keyframes sneaky {
      from {
        transform: translateY(100%);
        opacity: 0;
        rotate: 12deg;
      }

      to {
        transform: translateY(40%);
        opacity: 1;
        rotate: 0deg;
      }
    }
  }
`;
