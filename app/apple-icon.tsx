import { ImageResponse } from "next/og";

const PAW_ICON_URL =
  "https://emam-reza-group.vercel.app/api/uploads/cmvqj38je0000l208mlshq7ce";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <img
        src={PAW_ICON_URL}
        alt="Apple touch icon"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ),
    size,
  );
}
