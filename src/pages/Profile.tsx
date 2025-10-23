import { useState } from "react";
import { ArrowLeft, Share2, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { mockProducts } from "@/data/mockData";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listing");
  const userProduct = mockProducts[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <button className="p-2 hover:bg-muted rounded-full">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/placeholder.svg"
            alt="Robert Paul"
            className="w-20 h-20 rounded-full mb-3 bg-primary/10"
          />
          <h2 className="text-xl font-bold mb-1">Robert Paul</h2>
          <p className="text-sm text-muted-foreground mb-2">Member since : July 2022</p>
          <div className="flex items-center gap-1 mb-4">
            <span className="text-sm font-medium">Rating:</span>
            {[...Array(4)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-accent text-accent" />
            ))}
          </div>
          <Button className="px-8">Edit Profile</Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="listing">Listing</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listing" className="mt-0">
            <div className="bg-card rounded-lg p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={userProduct.image}
                  alt={userProduct.title}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
                  <Heart className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <Badge className="bg-accent text-accent-foreground text-xs mb-2">
                  Recently Added
                </Badge>
                <p className="text-lg font-bold mb-1">$ {userProduct.price.toLocaleString()}</p>
                <h3 className="font-semibold text-sm mb-1">{userProduct.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">2022 Model</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    📍 {userProduct.location}
                  </span>
                  <span>{userProduct.postedDate}</span>
                </div>
              </div>
            </div>
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
