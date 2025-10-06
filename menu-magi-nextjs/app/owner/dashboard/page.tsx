'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, LogOut, ChefHat, Receipt, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QRCodeSVG } from 'qrcode.react';
import { uploadImage, deleteImage } from '@/lib/uploadImage';
import { formatIndianCurrency } from '@/lib/gst';

interface Owner {
  id: string;
  email: string;
  restaurant_name: string;
  phone: string | null;
  address: string | null;
}

interface MenuItem {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [shopUrl, setShopUrl] = useState('');

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/owner/login');
        return;
      }

      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (ownerError) {
        if (ownerError.code === 'PGRST116') {
          const { data: newOwner, error: insertError } = await supabase
            .from('owners')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              restaurant_name: session.user.user_metadata?.restaurant_name || 'My Restaurant',
            })
            .select()
            .single();

          if (insertError) {
            toast.error('Error creating account');
            return;
          }

          setOwner(newOwner);
          loadMenuItems(newOwner.id);
          // Generate permanent QR code URL with owner ID
          setShopUrl(`${window.location.origin}/customer/table?restaurant=${newOwner.id}`);
          return;
        }

        toast.error('Error loading account data');
        return;
      }

      setOwner(ownerData);
      loadMenuItems(ownerData.id);
      // Generate permanent QR code URL with owner ID
      setShopUrl(`${window.location.origin}/customer/table?restaurant=${ownerData.id}`);
    } catch (error: any) {
      console.error('Auth error:', error);
      router.push('/owner/login');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (ownerId: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading menu items:', error);
      return;
    }

    setMenuItems(data || []);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/owner/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('');
    setFormImage('');
    setImagePreview(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormPrice(item.price.toString());
    setFormCategory(item.category || '');
    setFormImage(item.image_url || '');
    setImagePreview(item.image_url);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Store the file object for upload
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formDescription.trim() || !formPrice.trim() || !owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = formImage; // Keep existing image URL for edits

      // Upload new image if a file was selected
      if (imageFile) {
        toast.info('Uploading image...');
        const { url, error } = await uploadImage(imageFile, owner.id);

        if (error || !url) {
          toast.error(`Image upload failed: ${error || 'Unknown error'}`);
          setIsUploading(false);
          return;
        }

        // Delete old image if editing and had an image
        if (editingItem && editingItem.image_url && editingItem.image_url.includes('menu-images')) {
          await deleteImage(editingItem.image_url);
        }

        imageUrl = url;
        toast.success('Image uploaded successfully!');
      }

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: formName,
            description: formDescription,
            price,
            category: formCategory || null,
            image_url: imageUrl || null,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Menu item updated successfully!');
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            owner_id: owner.id,
            name: formName,
            description: formDescription,
            price,
            category: formCategory || null,
            image_url: imageUrl || null,
            is_available: true,
          });

        if (error) throw error;
        toast.success('Menu item added successfully!');
      }

      loadMenuItems(owner.id);
      setIsDialogOpen(false);
      setImageFile(null);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm('Are you sure you want to delete "' + name + '"?')) {
      return;
    }

    try {
      // Find the item to get its image URL
      const item = menuItems.find(i => i.id === id);

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete image from storage if it exists
      if (item?.image_url && item.image_url.includes('menu-images')) {
        const deleted = await deleteImage(item.image_url);
        if (deleted) {
          console.log('Image deleted from storage');
        }
      }

      loadMenuItems(owner!.id);
      toast.success('Menu item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{owner.restaurant_name}</h1>
                <p className="text-sm text-muted-foreground">{owner.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push('/owner/orders')}>
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

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Menu Items</CardDescription>
              <CardTitle className="text-4xl">{menuItems.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available Items</CardDescription>
              <CardTitle className="text-4xl">
                {menuItems.filter(item => item.is_available).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-4xl">
                {new Set(menuItems.filter(item => item.category).map(item => item.category)).size}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {showQRCode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Restaurant QR Code</CardTitle>
              <CardDescription>
                This is your permanent QR code - it never changes!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <QRCodeSVG value={shopUrl} size={256} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  📌 How to use this QR code:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Print this QR code once</li>
                  <li>Place it on every table in your restaurant</li>
                  <li>Customers scan it to see YOUR menu only</li>
                  <li>QR code stays the same even when you update menu items</li>
                  <li>Each customer selects their table number after scanning</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                This QR code is unique to your restaurant: <strong>{owner.restaurant_name}</strong>
              </p>
              <div className="flex gap-3">
                <Button onClick={() => window.print()} variant="default" size="lg">
                  🖨️ Print QR Code
                </Button>
                <Button onClick={() => {
                  navigator.clipboard.writeText(shopUrl);
                  toast.success('URL copied to clipboard!');
                }} variant="outline" size="lg">
                  📋 Copy URL
                </Button>
              </div>
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of your menu item' : 'Add a new dish to your menu'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 199.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Burgers"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Food Image</Label>
                  <div className="space-y-3">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload image (max 5MB). Image will be optimized and stored in cloud storage.
                    </p>
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 overflow-hidden bg-muted">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  {item.category && (
                    <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                  )}
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₹{formatIndianCurrency(item.price)}
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
}
