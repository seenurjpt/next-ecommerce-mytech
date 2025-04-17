import Dashboard from "./Dashboard";

export const metadata = {
  title: "Dashboard | MyTech",
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

const page = () => {
  return (
    <>
      <Dashboard />
    </>
  );
};

export default page;
