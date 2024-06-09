export default function RightArrow({ fill }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill={fill ? fill : "#000000"}
      version="1.1"
      id="Layer_1"
      width="24px"
      height="24px"
      viewBox="0 0 8 8"
      enableBackground="new 0 0 8 8"
      xmlSpace="preserve"
    >
      <rect
        x="2.95"
        y="1.921"
        transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 7.6689 8.4842)"
        width="5.283"
        height="1.466"
      />
      <rect x="0.024" y="3.157" width="6.375" height="1.683" />
      <rect
        x="2.956"
        y="4.615"
        transform="matrix(-0.7069 0.7073 -0.7073 -0.7069 13.3369 5.1684)"
        width="5.284"
        height="1.465"
      />
    </svg>
  );
}
