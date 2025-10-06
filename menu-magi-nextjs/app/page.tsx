import Link from "next/link";
import { ChefHat, UtensilsCrossed } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 to-black/60">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              Menu Magi
            </h1>
            <p className="text-xl md:text-2xl font-light drop-shadow-lg">
              Fresh Food, Fast Service, Great Taste
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="container mx-auto px-4 -mt-20 pb-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Card */}
          <Link href="/customer/table">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105">
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <UtensilsCrossed className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">I'm a Customer</h2>
                  <p className="text-gray-600 text-lg">
                    Browse our menu and place your order
                  </p>
                </div>
                <div className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Ordering
                </div>
              </div>
            </div>
          </Link>

          {/* Owner Card */}
          <Link href="/owner/login">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105">
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <ChefHat className="w-12 h-12 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">I'm the Owner</h2>
                  <p className="text-gray-600 text-lg">
                    Manage menu and view orders
                  </p>
                </div>
                <div className="w-full py-3 px-6 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors">
                  Owner Login
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
