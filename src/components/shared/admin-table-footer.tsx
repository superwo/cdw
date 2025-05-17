"use client";
import type { AwaitedPageProps, FilterOptions } from "@/config/types";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect } from "react";
import { Select } from "../ui/select";
import { TableCell, TableFooter, TableRow } from "../ui/table";
import { CustomPagination } from "./custom-pagination";
const itemsPerPageOptions: FilterOptions<string, string> = [
	{ label: "10", value: "10" },
	{ label: "25", value: "25" },
	{ label: "50", value: "50" },
	{ label: "100", value: "100" },
];

interface AdminTableFooterProps extends AwaitedPageProps {
	disabled: boolean;
	totalPages: number;
	baseURL: string;
	cols: number;
}

export const AdminTableFooter = (props: AdminTableFooterProps) => {
	const { disabled, totalPages, baseURL, cols, searchParams } = props;
	const itemsPerPage = searchParams?.itemsPerPage || "10";
	const router = useRouter();

	const handleItemsPerPage = (e: ChangeEvent<HTMLSelectElement>) => {
		const currentUrlParams = new URLSearchParams(window.location.search);
		currentUrlParams.set(e.target.name, e.target.value);
		const url = new URL(window.location.href);
		url.search = currentUrlParams.toString();
		router.push(url.toString());
	};

	useEffect(() => {
		const currentUrlParams = new URLSearchParams(window.location.search);
		currentUrlParams.set("itemsPerPage", itemsPerPage as string);
		const url = new URL(window.location.href);
		url.search = currentUrlParams.toString();
		router.push(url.toString());
	}, [router, itemsPerPage]);

	return (
		<TableFooter className="border-primary-800 hover:bg-transparent">
			<TableRow className="bg-primary-900 hover:bg-transparent">
				<TableCell colSpan={cols}>
					<div className="flex items-center">
						<Select
							name="itemsPerPage"
							value={searchParams?.itemsPerPage as string}
							onChange={handleItemsPerPage}
							options={itemsPerPageOptions}
							disabled={disabled}
							className="-mt-1"
							noDefault={false}
							selectClassName="bg-primary-800 text-muted/75 border-primary-800"
						/>
						<CustomPagination
							totalPages={totalPages}
							baseURL={baseURL}
							styles={{
								paginationRoot: "justify-end",
								paginationPrevious:
									"border-none hover:bg-primary-800 text-muted",
								paginationNext: "hover:bg-primary-800 text-muted",
								paginationLink: "border-none hover:bg-primary-800 text-muted",
								paginationLinkActive: "bg-primary-800 !text-white",
							}}
						/>
					</div>
				</TableCell>
			</TableRow>
		</TableFooter>
	);
};
