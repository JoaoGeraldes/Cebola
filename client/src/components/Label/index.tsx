import styled from "styled-components";

export default function Label(
  props: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
) {
  return <StyledLabel {...props} />;
}

const StyledLabel = styled.label`
  text-align: left;
  color: ${(props) => props.theme.color.label};
  margin-top: 10px;
  font-variant: small-caps;

  /* .required {
      transform: translateY(-0.5em);
      position: absolute;
      font-size: 0.7em;
      padding-left: 0.5em;
    } */
`;
