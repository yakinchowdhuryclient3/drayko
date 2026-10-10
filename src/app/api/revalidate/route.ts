import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paths } = body;

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json(
        { error: "paths array is required" },
        { status: 400 }
      );
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      revalidated: paths,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}