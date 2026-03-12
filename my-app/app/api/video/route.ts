import { getSignedDownloadUrl } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Video key is required", { status: 400 });
  }

  try {
    const url = await getSignedDownloadUrl(key);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error generating presigned URL for video:", error);
    return new NextResponse("Error fetching video", { status: 500 });
  }
}
