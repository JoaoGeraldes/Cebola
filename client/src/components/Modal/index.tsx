import styled from "styled-components";

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function Modal({ children }: Props) {
  return <StyledModal>{children}</StyledModal>;
}

const StyledModal = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 100;
  position: absolute;
  padding: ${(props) => props.theme.padding.default};
  top: 0;
  background: ${(props) => props.theme.color.daGreen};

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
