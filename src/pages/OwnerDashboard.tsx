// Owner dashboard - Menu management (add, edit, delete items)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, LogOut, ChefHat, Receipt, QrCode, History } from "lucide-react";
import { getCurrentOwner, logoutOwner, getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, initializeSampleData } from "@/lib/localStorage";
import { MenuItem } from "@/types";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(getCurrentOwner());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [shopUrl, setShopUrl] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");

  // Check authentication and load menu
  useEffect(() => {
    const currentOwner = getCurrentOwner();
    if (!currentOwner) {
      navigate("/owner/login");
      return;
    }

    setOwner(currentOwner);
    
    // Initialize sample data if needed
    initializeSampleData();
    
    // Load menu items
    loadMenuItems();
    
    // Generate shop URL for QR code
    const url = `${window.location.origin}/shop/${currentOwner.id}/table-select`;
    setShopUrl(url);
  }, [navigate]);

  // Load menu items from localStorage
  const loadMenuItems = () => {
    const items = getAllMenuItems();
    setMenuItems(items);
  };

  // Handle logout
  const handleLogout = () => {
    logoutOwner();
    toast.success("Logged out successfully");
    navigate("/owner/login");
  };

  // Open add dialog
  const handleAddClick = () => {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormImage("");
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormPrice(item.price.toString());
    setFormImage(item.image);
    setIsDialogOpen(true);
  };

  // Handle form submission (add or edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!formName.trim() || !formDescription.trim() || !formPrice.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        updateMenuItem(editingItem.id, {
          name: formName,
          description: formDescription,
          price,
          image: formImage || editingItem.image,
        });
        toast.success("Menu item updated successfully!");
      } else {
        // Add new item
        addMenuItem({
          name: formName,
          description: formDescription,
          price,
          image: formImage || "/src/assets/hero-food.jpg",
        });
        toast.success("Menu item added successfully!");
      }

      // Reload menu and close dialog
      loadMenuItems();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save menu item");
    }
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMenuItem(id);
      loadMenuItems();
      toast.success("Menu item deleted successfully!");
    }
  };

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Owner Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {owner.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate("/owner/history")}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              <Button variant="outline" onClick={() => navigate("/owner/orders")}>
                <Receipt className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button variant="outline" onClick={() => setShowQRCode(!showQRCode)}>
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* QR Code Section */}
        {showQRCode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Shop QR Code</CardTitle>
              <CardDescription>Customers can scan this to order directly</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-6 rounded-lg">
                <QRCodeSVG value={shopUrl} size={256} />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Print this QR code and place it on tables. When customers scan it, they'll go directly to table selection and menu.
              </p>
              <Button onClick={() => window.print()} variant="outline">Print QR Code</Button>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Menu Management</h2>
            <p className="text-muted-foreground">Add, edit, or remove items from your menu</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={handleAddClick}>
                <Plus className="mr-2 h-5 w-5" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the details of your menu item" : "Add a new dish to your menu"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Classic Burger"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your dish..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 12.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    type="text"
                    placeholder="/src/assets/your-image.jpg"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to use default image</p>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update Item" : "Add Item"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No menu items yet</p>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-smooth"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
