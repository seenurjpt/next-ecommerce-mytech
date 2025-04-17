import { SearchProvider } from "./context/SearchContext";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WrapperComp from "./WrapperComp";
import "./range-slider.css";
import "./globals.css";
export const metadata = {
  title: "MyTech",
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
          limit={3}
        />
        <SearchProvider>
          <WrapperComp children={children} />
        </SearchProvider>
      </body>
    </html>
  );
}
