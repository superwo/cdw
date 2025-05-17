import { SingleImageUploadSchema } from "@/app/schemas/images.schema";
import { auth } from "@/auth";
import { MAX_IMAGE_SIZE } from "@/config/constants";
import { env } from "@/env";
import { uploadToS3 } from "@/lib/s3";
import { forbidden } from "next/navigation";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300;

export const POST = auth(async (req) => {
	if (!req.auth) forbidden();

	const formData = await req.formData();

	const validated = SingleImageUploadSchema.safeParse(formData);

	if (!validated.success) {
		return NextResponse.json({ message: "Invalid file" }, { status: 400 });
	}

	const { file } = validated.data;
	const uuid = uuidv4();

	if (file.size > MAX_IMAGE_SIZE) {
		return NextResponse.json({ message: "Invalid file size" }, { status: 400 });
	}

	const { default: mimetype } = await import("mime-types");

	const mime = mimetype.lookup(file.name).toString();
	if (mime.match(/image\/(jpeg|jpg|png|webp)/) === null) {
		console.log("File is not an image");

		return NextResponse.json(
			{ message: `File type invalid ${mime}` },
			{ status: 400 },
		);
	}

	const decodedFileName = decodeURIComponent(decodeURIComponent(file.name));
	const key = `uploads/${uuid}/${decodedFileName}`;

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		await uploadToS3({
			bucketName: env.NEXT_PUBLIC_S3_BUCKET_NAME,
			file: buffer,
			path: key,
			mimetype: mime,
		});
		const url = `${env.NEXT_PUBLIC_S3_URL}/${key}`;
		return NextResponse.json({ url }, { status: 200 });
	} catch (err) {
		console.log(`Error uploading file: ${err}`);
		if (err instanceof Error) {
			return NextResponse.json(
				{ message: `Error uploading file ${err.message}` },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ message: "Something went wrong" },
			{ status: 400 },
		);
	}
});
