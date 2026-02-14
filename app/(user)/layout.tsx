import Footer from "@/Component/UserComponent/Footer";
import NavBar from "@/Component/UserComponent/NavBar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="pt-16">
      <NavBar />
      {children}
      <Footer/>
    </div>
  );
}
