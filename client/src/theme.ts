const light = {
  color: {
    a: "#ffffff",
    b: "#c3b44f",
    c: "#66ff00",
    d: "#a2b298",
    e: "#baff76",
  },

  borderColor: {
    a: "#64735b",
    b: "#30372a",
  },

  background: {
    a: "#4c5844",
    b: "#3e4637",
    c: "#31372d",
  },

  margin: {
    default: "6px",
    double: "12px",
  },

  padding: {
    default: "10px",
    lil: "4px",
    box: "16px",
  },

  textShadow: {
    subtle: "1px 1px 1px #00000066",
  },

  boxShadow: {
    subtle: "0px 1px 1px #00000059",
  },
};

const dark = {
  color: {
    a: "#f5f5f5",
    b: "#ffd600", // buttons and icon color
    c: "#b6b6b6",
    d: "#999999",
    e: "#00a7ff",
  },

  borderColor: {
    a: "#3b3b3b",
    b: "#0d0d0d",
  },

  background: {
    a: "#2b2b2b", // box sections background color + buttons background default state
    b: "#161616", // mouse hover button color + inputs background
    c: "#1f1f1f",
    d: "#64735b",
  },

  margin: {
    default: "6px",
    double: "12px",
  },

  padding: {
    default: "10px",
    lil: "4px",
    box: "16px",
  },

  textShadow: {
    subtle: "1px 1px 1px #00000066",
  },

  boxShadow: {
    subtle: "0px 1px 1px #00000059",
  },
};

export const theme = {
  light,
  dark,
};

export type Themezor = typeof theme.light;
