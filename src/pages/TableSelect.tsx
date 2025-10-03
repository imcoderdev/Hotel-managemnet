// Customer table selection page
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

const TableSelect = () => {
  const navigate = useNavigate();
  const { ownerId } = useParams();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  // If coming from QR code, store the owner ID
  useEffect(() => {
    if (ownerId) {
      sessionStorage.setItem("ownerId", ownerId);
    }
  }, [ownerId]);

  // Generate table numbers 1-20
  const tableNumbers = Array.from({ length: 20 }, (_, i) => i + 1);

  // Handle table selection
  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  // Continue to menu
  const handleContinue = () => {
    if (selectedTable) {
      // Store table number in sessionStorage
      sessionStorage.setItem("tableNumber", selectedTable.toString());
      navigate("/customer/menu");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
              <p className="text-muted-foreground text-lg">
                Please select your table number to begin ordering
              </p>
            </div>

            {/* Table Selection Grid */}
            <div className="mb-8">
              <Label className="text-lg mb-4 block">Choose Your Table:</Label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {tableNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleTableSelect(number)}
                    className={`
                      aspect-square rounded-lg border-2 font-bold text-lg
                      transition-smooth hover:scale-105
                      ${
                        selectedTable === number
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-card hover:border-primary hover:bg-primary/10"
                      }
                    `}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Table Display */}
            {selectedTable && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Selected Table</p>
                <p className="text-3xl font-bold text-primary">Table {selectedTable}</p>
              </div>
            )}

            {/* Continue Button */}
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleContinue}
              disabled={!selectedTable}
            >
              Continue to Menu
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TableSelect;
