import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #065f46 0%, #0f766e 100%)",
          color: "#fff",
          fontSize: 190,
          fontWeight: 700,
        }}
      >
        م
      </div>
    ),
    size,
  );
}
