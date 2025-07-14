import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { provinces, structure, aboutICA } from "@/utils/about";
import Image from "next/image";
export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-to-r from-red-700 to-red-500 text-white py-20">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-5xl font-extrabold mb-4">{aboutICA.name}</h1>
            <p className="text-lg opacity-90">
              Empowering Cheerleading in Indonesia through Unity and Excellence
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">About ICA</h2>
            <p>
              {aboutICA.introduction}
            </p>
            <ul className="space-y-2">
              <li><strong>Founded:</strong> {aboutICA.established}</li>
              <li><strong>Founder:</strong> {aboutICA.founder}</li>
              <li><strong>Sanctioned by:</strong> {aboutICA.sanctionedBy}</li>
            </ul>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative rounded-xl shadow-lg bg-white w-full h-64 flex items-center justify-center text-gray-500 overflow-hidden">
              <Image
                src="/ica-text.png"
                alt="Logo"
                width={650}
                height={400}
                className="object-contain animate-pulse"
              />
            </div>

          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold mb-4">Vision & Mission</h2>
              <p className="whitespace-pre-line">
                {aboutICA.visionMission}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Our Goal</h2>
              <p className="whitespace-pre-line">
                {aboutICA.goal}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Provinces Joined ICA</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {provinces.map((province, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-red-700 to-red-500 text-white rounded-xl shadow-md p-4 text-center font-semibold hover:scale-105 transition-transform"
              >
                {province}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

