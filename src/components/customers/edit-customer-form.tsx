"use client";
import { updateCustomerAction } from "@/app/_actions/customer";
import {
	EditCustomerSchema,
	type EditCustomerType,
} from "@/app/schemas/customer.schema";
import { toast } from "@/hooks/use-toast";
import { formatCustomerStatus } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Customer, CustomerStatus } from "@prisma/client";
import { useTransition } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Select } from "../ui/select";

export const EditCustomerForm = ({ customer }: { customer: Customer }) => {
	const form = useForm<EditCustomerType>({
		resolver: zodResolver(EditCustomerSchema),
		defaultValues: {
			status: customer.status,
		},
	});

	const [, startTransition] = useTransition();

	const onChangeHandler: SubmitHandler<EditCustomerType> = (data) => {
		startTransition(async () => {
			const result = await updateCustomerAction({
				id: customer.id,
				status: data.status,
			});

			if (result.success) {
				toast({
					title: "Customer Updated",
					description: result.message,
				});
			} else {
				toast({
					title: "Error Updating Customer",
					description: result.message,
					variant: "destructive",
				});
			}
		});
	};

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onChangeHandler)}>
				<FormField
					control={form.control}
					name="status"
					render={({ field: { ref, ...rest } }) => (
						<FormItem>
							<FormLabel htmlFor="status">Customer Status</FormLabel>
							<FormControl>
								<Select
									options={Object.values(CustomerStatus).map((value) => ({
										label: formatCustomerStatus(value),
										value,
									}))}
									noDefault={false}
									selectClassName="bg-primary-800 border-transparent text-muted/75"
									{...rest}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};
