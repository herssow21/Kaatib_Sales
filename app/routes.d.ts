import type { ComponentProps } from "react";
import type React from "react";
import type { LinkProps as OriginalLinkProps } from "@react-navigation/native";
import { router } from "expo-router";

declare module "expo-router" {
  export type RouteNames =
    | "/"
    | "/(tabs)"
    | "/(tabs)/dashboard"
    | "/(tabs)/inventory"
    | "/(tabs)/orders"
    | "/(tabs)/expenses"
    | "/(tabs)/settings"
    | "/profile"
    | "/users-management"
    | "/payment-settings"
    | "/expense-form"
    | "/report-details"
    | "/category-form"
    | "/policymodal"
    | "/transaction-form"
    | "/not-found"
    | "/customer-management-screen"
    | "/employee-management";

  export interface Router {
    push: (route: RouteNames | { pathname: RouteNames; params?: Record<string, string> }) => void;
    replace: (route: RouteNames | { pathname: RouteNames; params?: Record<string, string> }) => void;
    back: () => void;
  }

  export const router: Router;
  
  export function useLocalSearchParams<T extends Record<string, string>>(): T;
  
  interface ScreenProps {
    name: string;
    options?: {
      title?: string;
      tabBarIcon?: (props: { color: string; size?: number }) => React.ReactNode;
      [key: string]: unknown;
    };
  }

  interface StackComponent extends React.ComponentType<{
    screenOptions?: Record<string, unknown>;
    children: React.ReactNode;
  }> {
    Screen: React.ComponentType<ScreenProps>;
  }

  interface TabsComponent extends React.ComponentType<{
    screenOptions?: Record<string, unknown>;
    children: React.ReactNode;
  }> {
    Screen: React.ComponentType<ScreenProps>;
  }

  interface TabsProps {
    screenOptions?: Record<string, unknown>;
    children: React.ReactNode;
  }

  interface TabsType {
    (props: TabsProps): JSX.Element;
    Screen: React.ComponentType<ScreenProps>;
  }

  interface StackType {
    (props: TabsProps): JSX.Element;
    Screen: React.ComponentType<ScreenProps>;
  }

  export const Stack: StackType;
  export const Tabs: TabsType;

  interface LinkProps extends Omit<OriginalLinkProps, "to"> {
    href: RouteNames;
    asChild?: boolean;
  }
  
  export const Link: React.ComponentType<LinkProps>;
}

export {};

export default router;