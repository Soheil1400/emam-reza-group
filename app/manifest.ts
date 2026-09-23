import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "گروه فرهنگی امام رضا(ع)",
    short_name: "امام رضا(ع)",
    description: "سایت رسمی گروه فرهنگی امام رضا(ع) شامل روایت‌ها، رویدادها و حلقه‌ها",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f7",
    theme_color: "#065f46",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
