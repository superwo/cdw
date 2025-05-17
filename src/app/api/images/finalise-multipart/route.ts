import { FinaliseMultipartUploadSchema } from "@/app/schemas/images.schema";
import { auth } from "@/auth";
import { env } from "@/env";
import { s3 } from "@/lib/s3";
import type { CompleteMultipartUploadCommandInput } from "@aws-sdk/client-s3";
import { forbidden } from "next/navigation";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
	try {
		if (!req.auth) forbidden();
		const data = await req.json();

		const validated = FinaliseMultipartUploadSchema.safeParse(data);
		if (!validated.success) return NextResponse.error();
		const { fileId, fileKey, parts } = validated.data;
		const { default: mimetype } = await import("mime-types");
		const mime = mimetype.lookup(fileKey);

		const { default: orderBy } = await import("lodash.orderby");

		const multipartParams: CompleteMultipartUploadCommandInput = {
			Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
			Key: fileKey,
			UploadId: fileId,
			MultipartUpload: {
				// make sure these are in the right order
				Parts: orderBy(parts, ["PartNumber"], ["asc"]),
			},
			...(mime && { ContentType: mime }),
		};

		const { CompleteMultipartUploadCommand } = await import(
			"@aws-sdk/client-s3"
		);

		const command = new CompleteMultipartUploadCommand(multipartParams);
		const payload = await s3.send(command);

		return NextResponse.json(
			{
				url: payload.Location,
				key: payload.Key,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(`Error in finalising multipart upload: ${error}`);
		return NextResponse.error();
	}
});
