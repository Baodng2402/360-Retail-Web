"use client";

import { Menu } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import ThemeMode from "@/shared/components/ui/themeMode";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface HomeNavbarProps {
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

const HomeNavbar = ({
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
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/signup" },
  },
  className,
}: HomeNavbarProps) => {
  return (
    <section
      className={cn(
        "bg-background text-foreground transition-colors duration-300",
        "border-b border-border",
        "sticky top-0 z-50",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <nav className="hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-6">
              <a
                href={logo.url}
                className="flex items-center transition-opacity duration-300 hover:opacity-80"
              >
                <img
                  src={logo.src}
                  className="h-12 w-auto scale-150 transition-all duration-300"
                  alt={logo.alt}
                />
                <span className="text-lg font-semibold tracking-tight -ml-3">
                  {logo.title}
                </span>
              </a>

              <div className="flex items-center">
                <NavigationMenu>
                  <NavigationMenuList>
                    {menu.map((item) => renderMenuItem(item))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="scale-75 origin-right">
                <ThemeMode />
              </div>

              <Button asChild variant="outline" size="sm">
                <a href={auth.login.url}>{auth.login.title}</a>
              </Button>

              <Button asChild size="sm">
                <a href={auth.signup.url}>{auth.signup.title}</a>
              </Button>
            </div>
          </nav>

          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <a
                href={logo.url}
                className="flex items-center transition-opacity duration-300 hover:opacity-80"
              >
                <img
                  src={logo.src}
                  className="h-12 w-auto dark:invert transition-all duration-300"
                  alt={logo.alt}
                />
                <span className="text-lg font-semibold tracking-tight -ml-2">
                  {logo.title}
                </span>
              </a>

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
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

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

export { HomeNavbar };


