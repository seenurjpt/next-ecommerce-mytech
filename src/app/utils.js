import { FaShoppingCart, FaFolder, FaCalendarAlt } from "react-icons/fa";
import { MdDashboard, MdContactPage } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { BsChatSquareTextFill } from "react-icons/bs";

export const restrictedPaths = [
  "/project",
  "/contact",
  "/chat",
  "/filemanager",
  "/calendar",
  "/e-commerce/categories",
  "/e-commerce/orders",
  "/e-commerce/customer",
];

export const navItems = [
  { icon: <MdDashboard />, label: "Dashboard", route: "/dashboard" },
  {
    icon: <FaShoppingCart />,
    label: "E-Commerce",
    route: "/e-commerce",
    subItems: [
      { label: "Product", route: "/e-commerce/product" },
      { label: "Categories", route: "/e-commerce/categories" },
      { label: "Orders", route: "/e-commerce/orders" },
      { label: "Customer", route: "/e-commerce/customer" },
    ],
  },
  { icon: <FaNoteSticky />, label: "Project", route: "/project" },
  {
    icon: <MdContactPage />,
    label: "Contact",
    route: "/contact",
  },
  { icon: <FaFolder />, label: "File Manager", route: "/filemanager" },
  { icon: <BsChatSquareTextFill />, label: "Chat", route: "/chat" },
  { icon: <FaCalendarAlt />, label: "Calendar", route: "/calendar" },
];
