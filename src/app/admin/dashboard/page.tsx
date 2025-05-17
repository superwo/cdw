import { KPICards } from "@/components/admin/dashboard/kpi-cards";
import { SalesChart } from "@/components/admin/dashboard/sales-chart";
import { prisma } from "@/lib/prisma";
import { calculatePercentageChange } from "@/lib/utils";
import { ClassifiedStatus, CustomerStatus } from "@prisma/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

async function getDashboardData() {
	const now = new Date();
	const startOfThisMonth = startOfMonth(now);
	const endOfThisMonth = endOfMonth(now);
	const startOfLastMonth = startOfMonth(subMonths(now, 1));

	const lastMonthPromises = {
		carsSoldThisMonth: prisma.classified.count({
			where: {
				status: ClassifiedStatus.SOLD,
				updatedAt: {
					gte: startOfThisMonth,
					lte: endOfThisMonth,
				},
			},
		}),
		carsSoldLastMonth: prisma.classified.count({
			where: {
				status: ClassifiedStatus.SOLD,
				updatedAt: {
					gte: startOfLastMonth,
					lt: startOfThisMonth,
				},
			},
		}),
		newCustomersThisMonth: prisma.customer.count({
			where: {
				createdAt: {
					gte: startOfThisMonth,
					lte: endOfThisMonth,
				},
			},
		}),
		newCustomersLastMonth: prisma.customer.count({
			where: {
				createdAt: {
					gte: startOfLastMonth,
					lt: startOfThisMonth,
				},
			},
		}),
		purchasedCustomersThisMonth: prisma.customer.count({
			where: {
				status: CustomerStatus.PURCHASED,
				updatedAt: {
					gte: startOfThisMonth,
					lte: endOfThisMonth,
				},
			},
		}),
		purchasedCustomersLastMonth: prisma.customer.count({
			where: {
				status: CustomerStatus.PURCHASED,
				updatedAt: {
					gte: startOfLastMonth,
					lt: startOfThisMonth,
				},
			},
		}),
	};

	const totalSalesThisMonth = prisma.classified.aggregate({
		where: {
			status: ClassifiedStatus.SOLD,
			updatedAt: {
				gte: startOfThisMonth,
				lte: endOfThisMonth,
			},
		},
		_sum: { price: true },
	});

	const totalSalesPreviousMonth = prisma.classified.aggregate({
		where: {
			status: ClassifiedStatus.SOLD,
			updatedAt: {
				gte: startOfLastMonth,
				lt: startOfThisMonth,
			},
		},
		_sum: { price: true },
	});

	const [
		carsSoldThisMonth,
		carsSoldLastMonth,
		newCustomersThisMonth,
		newCustomersLastMonth,
		purchasedCustomersThisMonth,
		purchasedCustomersLastMonth,
	] = await Promise.all(Object.values(lastMonthPromises));

	const [salesThisMonth, salesPreviousMonth] = await Promise.all([
		totalSalesThisMonth,
		totalSalesPreviousMonth,
	]);

	const conversionRate =
		newCustomersThisMonth > 0
			? purchasedCustomersThisMonth / newCustomersThisMonth
			: 0;

	const previousConversionRate =
		newCustomersLastMonth > 0
			? purchasedCustomersLastMonth / newCustomersLastMonth
			: 0;

	const totalSales = salesThisMonth._sum.price || 0;
	const previousTotalSales = salesPreviousMonth._sum.price || 0;

	console.log({ totalSales, previousTotalSales });

	const conversionRatePercentageChange = calculatePercentageChange(
		conversionRate,
		previousConversionRate,
	);

	const salesPercentageChange = calculatePercentageChange(
		totalSales,
		previousTotalSales,
	);

	const carsSoldPercentageChange = calculatePercentageChange(
		carsSoldThisMonth,
		carsSoldLastMonth,
	);

	const newCustomersPercentageChange = calculatePercentageChange(
		newCustomersThisMonth,
		newCustomersLastMonth,
	);

	return {
		totalSales,
		carsSoldThisMonth,
		newCustomersThisMonth,
		conversionRate,
		conversionRatePercentageChange,
		salesPercentageChange,
		carsSoldPercentageChange,
		newCustomersPercentageChange,
	};
}

async function getChartData() {
	const now = new Date();
	const monthsData = [];

	for (let i = 0; i < 12; i++) {
		const startDate = startOfMonth(subMonths(now, i));
		const endDate = endOfMonth(startDate);

		const monthlySales = await prisma.classified.aggregate({
			where: {
				status: ClassifiedStatus.SOLD,
				updatedAt: {
					gte: startDate,
					lte: endDate,
				},
			},
			_sum: {
				price: true,
			},
		});

		monthsData.unshift({
			month: format(startDate, "MMM"),
			sales: monthlySales._sum.price || 0,
		});
	}

	return monthsData;
}
export type DashboardDataType = ReturnType<typeof getDashboardData>;
export type ChartDataType = ReturnType<typeof getChartData>;

export default async function AdminDashboardPage() {
	const dashboardData = getDashboardData();
	const chartData = getChartData();
	return (
		<>
			<KPICards data={dashboardData} />
			<SalesChart data={chartData} />
		</>
	);
}
