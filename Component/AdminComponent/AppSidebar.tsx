"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  Package,
  ShoppingCart,
  SquareUser,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type SubMenuChild = {
  title: string;
  url: string;
};

type SubMenuItem = {
  title: string;
  url?: string;
  children?: SubMenuChild[];
};

type MenuItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  subItems?: SubMenuItem[];
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Order",
    icon: ShoppingCart,
    subItems: [
      {
        title: "All Order",
        url: "/admin/order/all",
      },
      {
        title: "Pending Order",
        url: "/admin/order/pending",
      },
      {
        title: "Pregress Order",
        url: "/admin/order/pregress-order",
      },
      {
        title: "Delivered Order",
        url: "/admin/order/delivered-order",
      },
      {
        title: "Completed Order",
        url: "/admin/order/completed-order",
      },
      {
        title: "Declined Order",
        url: "/admin/order/declined-order",
      },
      {
        title: "Cash On Delivery",
        url: "/admin/order/cash-on-delivery",
      },
    ],
  },
  {
    title: "User",
    icon: SquareUser,
    subItems: [
      {
        title: "Customer List",
        url: "/admin/user/customer-list",
      },
      {
        title: "Pending Customer List",
        url: "/admin/user/pending-customer-list",
      },
      {
        title: "Block Customer List",
        url: "/admin/user/block-user-List",
      },
    ],
  },
  {
    title: "Products",
    icon: Package,
    subItems: [
      {
        title: "Manage Category",
        children: [
          {
            title: "Product Category",
            url: "/admin/products/manage-category/product-category",
          },
        ],
      },
      {
        title: "Manage Product",
        children: [
          {
            title: "Create Product",
            url: "/admin/products/manage-product/create-product",
          },
          {
            title: "Product Detaile",
            url: "/admin/products/manage-product/product-detaile",
          },
        ],
      },
      {
        title: "Inventory",
        url: "/admin/products/inventory",
      },
    ],
  },
  {
    title: "Shop Setup",
    icon: Package,
    subItems: [
      {
        title: "Ecommerce",
        children: [
          {
            title: "Coupon",
            url: "/admin/coupon",
          },
          {
            title: "Payment Method",
            url: "/admin/payment-method",
          },
        ],
      },
    ],
  },
  {
    title: "Configuration",
    icon: Package,
    subItems: [
      {
        title: "Sms Configuration",
        children: [
          {
            title: "Setting",
            url: "/admin/sms-configuratio/setting",
          },
        ],
      },
    ],
  },
  {
    title: "Page",
    icon: Package,
    subItems: [
      {
        title: "Home",
        children: [
          {
            title: "Banner",
            url: "/admin/pages/banner",
          },
          {
            title: "Payment Method",
            url: "/admin/payment-method",
          },
        ],
      },
    ],
  },
];

export function AppSidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  return (
    <Sidebar className="border-r border-white/10 bg-[#1b263b] text-white">
      <SidebarHeader className="bg-[#1b263b] px-4 py-5">
        <p className="text-lg font-semibold tracking-wide text-white">
          Admin Panel
        </p>
        <p className="text-xs text-white/65">Manage your store dashboard</p>
      </SidebarHeader>
      <SidebarContent className="bg-[#1b263b] px-2">
        <SidebarGroup className="bg-[#1b263b]">
          <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-[#1b263b]">
            <SidebarMenu className="bg-[#1b263b]">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.url ? (
                    <SidebarMenuButton
                      asChild
                      className="text-white/85 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white"
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      className={`text-white/85 hover:bg-white/10 hover:text-white ${
                        openMenu === item.title ? "bg-white/15 text-white" : ""
                      }`}
                      onClick={() =>
                        setOpenMenu((current) =>
                          current === item.title ? null : item.title,
                        )
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform ${
                          openMenu === item.title ? "rotate-180" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  )}

                  {item.subItems && openMenu === item.title ? (
                    <SidebarMenuSub className="border-white/15">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.url ? (
                            <SidebarMenuSubButton
                              asChild
                              className="text-white/75 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white"
                            >
                              <Link href={subItem.url}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          ) : (
                            <SidebarMenuSubButton
                              asChild
                              className={`text-white/75 hover:bg-white/10 hover:text-white ${
                                openSubMenu === `${item.title}-${subItem.title}`
                                  ? "bg-white/10 text-white"
                                  : ""
                              }`}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center"
                                onClick={() =>
                                  setOpenSubMenu((current) =>
                                    current === `${item.title}-${subItem.title}`
                                      ? null
                                      : `${item.title}-${subItem.title}`,
                                  )
                                }
                              >
                                <span>{subItem.title}</span>
                                <ChevronDown
                                  className={`ml-auto h-4 w-4 transition-transform ${
                                    openSubMenu ===
                                    `${item.title}-${subItem.title}`
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </button>
                            </SidebarMenuSubButton>
                          )}

                          {subItem.children &&
                          openSubMenu === `${item.title}-${subItem.title}` ? (
                            <SidebarMenuSub className="ml-3 border-white/15">
                              {subItem.children.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className="text-white/70 hover:bg-white/10 hover:text-white"
                                  >
                                    <Link href={child.url}>{child.title}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          ) : null}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 bg-[#1b263b] px-4 py-4 text-xs text-white/60">
        Zelvix Admin
      </SidebarFooter>
    </Sidebar>
  );
}
