"use client";

import dynamic from "next/dynamic";

// Dynamically import the ImageConverter component with SSR disabled
const ImageConverter = dynamic(() => import("@/components/image-converter"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Loading converter...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <ImageConverter />;
}
