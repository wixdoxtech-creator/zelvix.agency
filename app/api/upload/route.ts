import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Only jpg, png, webp, or gif files are allowed" },
        { status: 400 },
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { message: "File size must be 5MB or less" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const baseName = path.basename(file.name, ext);
    const safeBaseName = sanitizeFileName(baseName);
    const uniqueName = `${Date.now()}-${safeBaseName}${ext.toLowerCase()}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        data: {
          url: `/uploads/${uniqueName}`,
          name: uniqueName,
          size: file.size,
          type: file.type,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}
