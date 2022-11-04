import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ?bg=#000000&color=#FFFFFF
    const hasParams = searchParams.has("bg") && searchParams.has("color");
    const bg = hasParams ? `#${searchParams.get("bg")}` : "#000000";
    const color = hasParams ? `#${searchParams.get("color")}` : "#FFFFFF";

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: bg,
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: 300,
              fontStyle: "normal",
              fontWeight: "bold",
              color: color,
              whiteSpace: "pre-wrap",
            }}
          >
            #
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
