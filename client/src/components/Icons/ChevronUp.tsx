export default function ChevronUp({ fill }: { fill?: string }) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 512 512"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g
          id="add"
          fill={fill ? fill : "#000000"}
          transform="translate(134.186667, 172.586667)"
        >
          <polygon
            id="arrowhead-up"
            points="213.333333 151.893333 121.813333 60.16 30.2933333 151.893333 2.84217094e-14 121.6 121.813333 0 243.626667 121.6"
          ></polygon>
        </g>
      </g>
    </svg>
  );
}
