import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <HeroSection />
      </section>

      {/* Content Section */}
      <section className="relative min-h-screen mt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Latest Questions */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 ml-10 text-3xl font-bold text-white">
                Latest Questions
              </h2>
              <LatestQuestions />
            </div>

            {/* Top Contributors */}
            <div className="lg:col-span-1 mr-15">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Top Contributors
              </h2>
              <TopContributers />
            </div>
          </div>
        </div>
      </section>
      <section>
        <Footer/>
      </section>
    </main>
  );
}
