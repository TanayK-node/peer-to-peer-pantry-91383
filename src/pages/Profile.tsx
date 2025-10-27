import { useState } from "react";
import { ArrowLeft, Share2, Star, Heart, LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useCurrentUserProfile, useUserProducts } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listing");

  // If userId is provided in URL, show that profile, otherwise show current user's profile
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const { data: profile, isLoading: profileLoading } = userId 
    ? useProfile(userId)
    : useCurrentUserProfile();

  const { data: userProducts = [], isLoading: productsLoading } = useUserProducts(profileUserId);

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
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="listing">Listing</TabsTrigger>
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
              <div className="space-y-4">
                {userProducts.map((product) => {
                  const imageUrl = product.image_urls?.[0] || "/placeholder.svg";
                  const formattedDate = format(new Date(product.created_at), "MMM dd");
                  
                  return (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`}
                      className="block"
                    >
                      <div className="bg-card rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                          {product.featured && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold mb-1">$ {Number(product.price).toLocaleString()}</p>
                          <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2 capitalize">
                            {product.condition.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              📍 {product.location || "Location not set"}
                            </span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            <div className="text-center py-12 text-muted-foreground">
              No saved items yet
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
