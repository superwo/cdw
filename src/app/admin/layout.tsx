import { AdminHeader } from "@/components/layouts/admin-header";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import type { PropsWithChildren } from "react";
import { AI } from "../_actions/ai";

export default async function AdminLayout({ children }: PropsWithChildren) {
	return (
		<AI>
			<div className="flex bg-primary-900 min-h-screen w-full">
				<AdminSidebar />
				<div className="flex flex-col flex-1 overflow-hidden">
					<AdminHeader />
					<main className="admin-scrollbar flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-auto">
						{children}
					</main>
				</div>
			</div>
		</AI>
	);
}
