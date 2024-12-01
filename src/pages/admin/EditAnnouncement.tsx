import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnnouncementForm from "@/components/admin/announcements/AnnouncementForm";

type Announcement = {
  title: string;
  description: string;
  image_url?: string;
  link?: string;
};

export default function EditAnnouncement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAnnouncement(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load announcement",
        variant: "destructive",
      });
      navigate("/admin/announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/announcements");
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!announcement) {
    return <div className="p-4">Announcement not found</div>;
  }

  return (
    <div className="space-y-6 p-6 mt-16">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Announcement</h1>
      </div>

      <AnnouncementForm
        initialData={announcement}
        editingId={id}
        onSubmit={() => {
          navigate("/admin/announcements");
        }}
      />
    </div>
  );
}