import Products from "@/app/components/productlist/Products";

export const metadata = {
  title: "Products | MyTech",
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

const page = () => {
  return <Products />;
};

export default page;
