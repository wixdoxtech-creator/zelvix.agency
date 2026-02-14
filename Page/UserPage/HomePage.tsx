import HeroSection from "@/Component/UserComponent/HeroSection";
import HeroCorosal from "./HeroCorosal";
import HomeFlashDeals from "@/Component/UserComponent/HomeFlashDeals";
import HomePageRating from "@/Component/UserComponent/HomePageRating";
import HomePageBanner from "./HomePageBanner";
import HomePageChooseAyurveda from "./HomePageChooseAyurveda";
import Footer from "@/Component/UserComponent/Footer";

const HomePage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf8f5]">
      <div className="relative z-10">
        <HeroSection />
        <HomePageBanner />
        <HeroCorosal />
        <HomeFlashDeals />
        <HomePageRating />
        <HomePageChooseAyurveda />
      </div>
    </main>
  );
};

export default HomePage;
