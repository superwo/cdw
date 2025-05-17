"use client";
import { routes } from "@/config/routes";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import {
	CarFrontIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ActiveLink } from "../ui/active-link";

const navigation = [
	{
		name: "Dashboard",
		href: routes.admin.dashboard,
		icon: LayoutDashboardIcon,
	},
	{
		name: "Classifieds",
		href: routes.admin.classifieds,
		icon: CarFrontIcon,
	},
	{
		name: "Customers",
		href: routes.admin.customers,
		icon: UsersIcon,
	},
	{
		name: "Settings",
		href: routes.admin.settings,
		icon: SettingsIcon,
	},
];

export const AdminSidebar = () => {
	const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
	const handleSidebarHover = useCallback((expanded: boolean) => {
		setIsSidebarExpanded(expanded);
	}, []);

	const sidebarVariants: Variants = {
		expanded: { width: 256 },
		collapsed: { width: "fit-content" },
	};

	const menuTextVariants: Variants = {
		expanded: {
			opacity: 1,
			width: "auto",
			marginLeft: 10,
		},
		collapsed: { opacity: 0, width: 0 },
	};

	const logoVariants: Variants = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	};

	return (
		<motion.div
			className="bg-black/20 h-screen overflow-hidden flex flex-col"
			animate={isSidebarExpanded ? "expanded" : "collapsed"}
			variants={sidebarVariants}
			initial="collapsed"
			transition={{ duration: 0.3, ease: "easeInOut" }}
			onMouseEnter={() => handleSidebarHover(true)}
			onMouseLeave={() => handleSidebarHover(false)}
		>
			<div className="flex flex-col grow px-4">
				<Link href={routes.home}>
					<div className="relative h-[60px] w-full">
						<AnimatePresence initial={false} mode="wait">
							{isSidebarExpanded ? (
								<motion.div
									key="expanded-logo"
									className="absolute inset-0"
									variants={logoVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={{ duration: 0.4 }}
								>
									<Image
										src="/logo.svg"
										fill={true}
										className="object-contain object-left"
										alt="Majestic Motors Logo"
									/>
								</motion.div>
							) : (
								<motion.div
									key="collapsed-logo"
									className="absolute inset-0"
									variants={logoVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={{ duration: 0.1 }}
								>
									<Image
										src="/logo-mob.svg"
										fill={true}
										className="object-contain object-left"
										alt="Majestic Motors Mobile Logo"
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</Link>
				<nav className="flex flex-col gap-2">
					{navigation.map((item) => {
						return (
							<ActiveLink
								key={item.name}
								href={item.href}
								className="flex items-center p-2 rounded-lg transition-colors duration-200 w-full cursor-pointer"
							>
								<div className="flex items-center justify-center">
									<item.icon aria-hidden="true" className="h-6 w-6 shrinnk-0" />
									<motion.span
										variants={menuTextVariants}
										animate={isSidebarExpanded ? "expanded" : "collapsed"}
										initial="collapsed"
										transition={{ duration: 0.3, ease: "easeInOut" }}
										className="whitespace-nowrap overflow-hidden"
									>
										{item.name}
									</motion.span>
								</div>
							</ActiveLink>
						);
					})}
				</nav>
			</div>
		</motion.div>
	);
};
