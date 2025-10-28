import { useState } from "react";
import { ArrowLeft, Share2, Star, Heart, LogOut, MoreVertical, Trash2, Edit, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useCurrentUserProfile, useUserProducts, useUserSoldProducts } from "@/hooks/useProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listing");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  // If userId is provided in URL, show that profile, otherwise show current user's profile
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const { data: profile, isLoading: profileLoading } = userId 
    ? useProfile(userId)
    : useCurrentUserProfile();

  const { data: userProducts = [], isLoading: productsLoading } = useUserProducts(profileUserId);
  const { data: soldProducts = [], isLoading: soldProductsLoading } = useUserSoldProducts(profileUserId);
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites(isOwnProfile ? user?.id : undefined);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const handleDeleteClick = (productId: string) => {
    setSelectedProductId(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProductId) {
      deleteProduct.mutate(selectedProductId);
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const handleMarkAsSold = (productId: string) => {
    updateProduct.mutate({ productId, status: "sold" });
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/product/${productId}/edit`);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const memberSince = format(new Date(profile.member_since), "MMMM yyyy");
  const rating = Math.round(profile.rating || 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{isOwnProfile ? "My Profile" : "Profile"}</h1>
          {isOwnProfile && (
            <button onClick={handleLogout} className="p-2 hover:bg-muted rounded-full">
              <LogOut className="h-5 w-5" />
            </button>
          )}
          {!isOwnProfile && <div className="w-10" />}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={profile.avatar_url || "/placeholder.svg"}
            alt={profile.full_name}
            className="w-20 h-20 rounded-full mb-3 bg-primary/10 object-cover"
          />
          <h2 className="text-xl font-bold mb-1">{profile.full_name}</h2>
          <p className="text-sm text-muted-foreground mb-2">Member since: {memberSince}</p>
          {profile.location && (
            <p className="text-sm text-muted-foreground mb-2">📍 {profile.location}</p>
          )}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-sm font-medium">Rating:</span>
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-accent text-accent" />
            ))}
            {profile.total_ratings && profile.total_ratings > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({profile.total_ratings} reviews)
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="text-sm text-center text-muted-foreground mb-4 max-w-md">
              {profile.bio}
            </p>
          )}
          {isOwnProfile && (
            <Button className="px-8" onClick={() => navigate("/profile/edit")}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="listing">Listing</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listing" className="mt-0">
            {productsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : userProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {isOwnProfile ? "You haven't listed any products yet" : "No products listed"}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {userProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} showFeatured={false} />
                    {isOwnProfile && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2 h-8 w-8 bg-white/90 hover:bg-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsSold(product.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Sold
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold" className="mt-0">
            {soldProductsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading sold products...</div>
            ) : soldProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {isOwnProfile ? "You haven't sold any items yet" : "No sold items"}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {soldProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showFeatured={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            {!isOwnProfile ? (
              <div className="text-center py-12 text-muted-foreground">
                Only available on your own profile
              </div>
            ) : favoritesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading favorites...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No saved items yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  fav.products && <ProductCard key={fav.id} product={fav.products} showFeatured={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
