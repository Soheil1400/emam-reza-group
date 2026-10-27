import { ImageResponse } from "next/og";

const PAW_ICON_URL =
  "https://emam-reza-group.vercel.app/api/uploads/cmvqj38je0000l208mlshq7ce";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <img
        src={PAW_ICON_URL}
        alt="PWA icon"
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
