import { NextResponse } from "next/server";

export function GET(): NextResponse {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
