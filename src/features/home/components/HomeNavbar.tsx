 "use client";

import { Menu } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import ThemeMode from "@/shared/components/ui/themeMode";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

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
    url: "/",
    src: logoImage,
    alt: "360 Retail logo",
    title: "360 Retail",
  },
  // Mặc định không hiển thị các mục menu mock (Products, Resources...).
  // Nếu sau này bạn muốn thêm, có thể truyền prop menu từ ngoài vào.
  menu = [],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/signup" },
  },
  className,
}: HomeNavbarProps) => {
  const { t } = useTranslation("home");

  const translatedLogo = {
    ...logo,
    alt: t("navbar.brandAlt", { defaultValue: logo.alt }),
    title: t("navbar.brandTitle", { defaultValue: logo.title }),
  };

  const translatedAuth = {
    login: {
      ...auth.login,
      title: t("navbar.login", { defaultValue: auth.login.title }),
    },
    signup: {
      ...auth.signup,
      title: t("navbar.signup", { defaultValue: auth.signup.title }),
    },
  };

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
              <motion.a
                href={translatedLogo.url}
                className="flex items-center gap-2 transition-all duration-300 hover:scale-105 group"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={translatedLogo.src}
                  className="h-9 w-auto rounded-xl bg-transparent"
                  alt={translatedLogo.alt}
                />
                <span className="text-lg font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                  {translatedLogo.title}
                </span>
              </motion.a>

              {menu.length > 0 && (
                <div className="flex items-center">
                  <NavigationMenu>
                    <NavigationMenuList>
                      {menu.map((item) => renderMenuItem(item))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="scale-75 origin-right">
                <ThemeMode />
              </div>

              <LanguageSwitcher />

              <Button
                variant="outline"
                size="sm"
                className="border-[#FF7B21]/30 hover:border-[#FF7B21] hover:bg-[#FF7B21]/5 transition-all duration-300"
                asChild
              >
                <a href={translatedAuth.login.url}>{translatedAuth.login.title}</a>
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:shadow-lg hover:shadow-[#FF7B21]/20 transition-all duration-300"
                asChild
              >
                <a href={translatedAuth.signup.url}>{translatedAuth.signup.title}</a>
              </Button>
            </div>
          </nav>

          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <a
                href={translatedLogo.url}
                className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
              >
                <img
                  src={translatedLogo.src}
                  className="h-9 w-auto transition-all duration-300"
                  alt={translatedLogo.alt}
                />
                <span className="text-lg font-semibold tracking-tight">
                  {translatedLogo.title}
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
                        <a href={translatedLogo.url} className="flex items-center gap-2">
                          <img
                            src={translatedLogo.src}
                            className="h-8 w-auto transition-all duration-300"
                            alt={translatedLogo.alt}
                          />
                          <span className="text-base font-semibold">
                            {translatedLogo.title}
                          </span>
                        </a>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 flex flex-col gap-6">
                      {menu.length > 0 && (
                        <Accordion
                          type="single"
                          collapsible
                          className="flex w-full flex-col gap-4"
                        >
                          {menu.map((item) => renderMobileMenuItem(item))}
                        </Accordion>
                      )}

                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          className="border-[#FF7B21]/30 hover:border-[#FF7B21] hover:bg-[#FF7B21]/5 transition-all duration-300"
                          asChild
                        >
                          <a href={translatedAuth.login.url}>{translatedAuth.login.title}</a>
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:shadow-lg hover:shadow-[#FF7B21]/20 transition-all duration-300"
                          asChild
                        >
                          <a href={translatedAuth.signup.url}>{translatedAuth.signup.title}</a>
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


