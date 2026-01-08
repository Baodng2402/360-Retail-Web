"use client";

/**
 * HEADER COMPONENT - Navigation Bar
 *
 * Component này hiển thị thanh điều hướng (navbar) cho website.
 * Hỗ trợ:
 * - Desktop menu với dropdown
 * - Mobile menu với sheet (sidebar)
 * - Dark mode transition mượt mà
 * - Theme toggle button
 *
 * @fresher-note: Component này sử dụng Tailwind CSS và Radix UI
 */

import { Menu } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import ThemeMode from "../ui/themeMode";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * @fresher-note: Interface định nghĩa cấu trúc của 1 menu item
 * - title: Tên hiển thị
 * - url: Link đến trang
 * - description: Mô tả (optional)
 * - icon: Icon hiển thị (optional)
 * - items: Sub-menu items (optional, cho dropdown)
 */
interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

/**
 * @fresher-note: Props cho Navbar component
 * Tất cả đều optional với default values
 */
interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

/**
 * Main Navbar Component
 *
 * @fresher-note:
 * - Responsive: Hidden mobile menu on desktop (lg:hidden), hidden desktop menu on mobile
 * - Dark mode: Tất cả colors dùng semantic tokens (bg-background, text-foreground, etc.)
 * - Transitions: Tất cả dùng duration-300 để đồng nhất
 */
const Navbar1 = ({
  logo = {
    url: "http://localhost:5173/",
    src: logoImage,
    alt: "logo",
    title: "360 Retail",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Products",
      url: "#",
    },
    {
      title: "Resources",
      url: "#",
    },
    {
      title: "Pricing",
      url: "#",
    },
    {
      title: "Blog",
      url: "#",
    },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
  className,
}: Navbar1Props) => {
  return (
    /**
     * @fresher-note: Main section wrapper
     * - bg-background: Màu nền thích ứng với dark mode
     * - text-foreground: Màu chữ thích ứng với dark mode
     * - transition-colors duration-300: Smooth color transition khi đổi theme
     * - border-b: Viền dưới để phân tách header với content
     */
    <section
      className={cn(
        "bg-background text-foreground transition-colors duration-300",
        "border-b border-border",
        "sticky top-0 z-50", // Sticky header luôn hiển thị khi scroll
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* 
            DESKTOP NAVIGATION
            @fresher-note: Ẩn trên mobile (hidden), hiện trên desktop (lg:flex)
          */}
          <nav className="hidden items-center justify-between lg:flex">
            {/* Left side: Logo & Menu */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <a
                href={logo.url}
                className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
              >
                <img
                  src={logo.src}
                  className="h-8 w-auto dark:invert transition-all duration-300"
                  alt={logo.alt}
                />
                <span className="text-lg font-semibold tracking-tight">
                  {logo.title}
                </span>
              </a>

              {/* Navigation Menu */}
              <div className="flex items-center">
                <NavigationMenu>
                  <NavigationMenuList>
                    {menu.map((item) => renderMenuItem(item))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            {/* Right side: Theme Toggle & Auth Buttons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle - scaled down for better fit */}
              <div className="scale-75 origin-right">
                <ThemeMode />
              </div>

              {/* Login Button */}
              <Button asChild variant="outline" size="sm">
                <a href={auth.login.url}>{auth.login.title}</a>
              </Button>

              {/* Sign Up Button */}
              <Button asChild size="sm">
                <a href={auth.signup.url}>{auth.signup.title}</a>
              </Button>
            </div>
          </nav>

          {/* 
            MOBILE NAVIGATION
            @fresher-note: Hiện trên mobile (block), ẩn trên desktop (lg:hidden)
          */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              {/* Mobile Logo */}
              <a
                href={logo.url}
                className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
              >
                <img
                  src={logo.src}
                  className="h-8 w-auto dark:invert transition-all duration-300"
                  alt={logo.alt}
                />
                <span className="text-lg font-semibold tracking-tight">
                  {logo.title}
                </span>
              </a>

              {/* Mobile Menu Button (Sheet) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2">
                        <img
                          src={logo.src}
                          className="h-8 w-auto dark:invert transition-all duration-300"
                          alt={logo.alt}
                        />
                      </a>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 flex flex-col gap-6">
                    {/* Mobile Menu Items */}
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline">
                        <a href={auth.login.url}>{auth.login.title}</a>
                      </Button>
                      <Button asChild>
                        <a href={auth.signup.url}>{auth.signup.title}</a>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Render Desktop Menu Item
 *
 * @fresher-note:
 * - Nếu có items -> hiển thị dropdown menu
 * - Nếu không có items -> hiển thị link thường
 * - Tất cả transition đều 300ms
 */
const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-muted hover:text-accent-foreground"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

/**
 * Render Mobile Menu Item
 *
 * @fresher-note:
 * - Nếu có items -> dùng Accordion (có thể mở/đóng)
 * - Nếu không có items -> hiển thị link thường
 */
const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
      </AccordionItem>
    );
  }

  return (
    <a
      key={item.title}
      href={item.url}
      className="text-md font-semibold transition-colors duration-300 hover:text-accent-foreground"
    >
      {item.title}
    </a>
  );
};

export { Navbar1 };
