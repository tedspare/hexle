import { ReactElement } from "react";

interface IProps {
  color: string; // #FFFFFF
  contrastColor: string; // #000000
}
import ReactDOMServer from "react-dom/server";

const encodeSvg = (reactElement: ReactElement) => {
  return (
    "data:image/svg+xml," +
    escape(ReactDOMServer.renderToStaticMarkup(reactElement))
  );
};

const Favicon = ({ color, contrastColor }: IProps) => {
  const svg = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="16" height="16" fill={color} />
      <path
        d="M8.54762 13L10.5476 3H11.7381L9.7381 13H8.54762ZM3 10.2266L3.19048 9.25H12.2857L12.0952 10.2266H3ZM4.2619 13L6.2619 3H7.45238L5.45238 13H4.2619ZM3.71429 6.75L3.90476 5.77344H13L12.8095 6.75H3.71429Z"
        fill={contrastColor}
      />
    </svg>
  );

  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes={"any"} />
      <link rel="icon" href={encodeSvg(svg)} type="image/svg+xml" />
    </>
  );
};

export default Favicon;
