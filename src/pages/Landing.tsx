// Landing page - Choose between Owner login or Customer ordering
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Delicious food" 
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 to-black/60">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              Delicious Bites
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
          <Card className="gradient-card border-2 border-border hover:shadow-glow transition-smooth cursor-pointer group">
            <div 
              className="p-8 flex flex-col items-center text-center space-y-6"
              onClick={() => navigate("/customer/table")}
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <UtensilsCrossed className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">I'm a Customer</h2>
                <p className="text-muted-foreground text-lg">
                  Browse our menu and place your order
                </p>
              </div>
              <Button size="lg" className="w-full">
                Start Ordering
              </Button>
            </div>
          </Card>

          {/* Owner Card */}
          <Card className="gradient-card border-2 border-border hover:shadow-glow transition-smooth cursor-pointer group">
            <div 
              className="p-8 flex flex-col items-center text-center space-y-6"
              onClick={() => navigate("/owner/login")}
            >
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <ChefHat className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">I'm the Owner</h2>
                <p className="text-muted-foreground text-lg">
                  Manage menu and view orders
                </p>
              </div>
              <Button size="lg" variant="outline" className="w-full">
                Owner Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
