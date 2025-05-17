import { validateIdSchema } from "@/app/schemas/id.schema";
import { routes } from "@/config/routes";
import type { PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassifiedForm } from "../../../../../components/classified/classified-form";

export default async function EditClassified(props: PageProps) {
	const params = await props.params;

	const { data, success } = validateIdSchema.safeParse({
		id: Number(params?.id),
	});

	if (!success) redirect(routes.admin.classifieds);

	const classified = await prisma.classified.findUnique({
		where: { id: data.id },
		include: { images: true },
	});

	if (!classified) redirect(routes.admin.classifieds);

	return <ClassifiedForm classified={classified} />;
}
