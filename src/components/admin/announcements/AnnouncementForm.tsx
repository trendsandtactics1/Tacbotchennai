import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AnnouncementFormProps = {
  initialData?: {
    title: string;
    description: string;
    image_url?: string;
    link?: string;
  };
  editingId?: string | null;
  onSubmit: () => void;
};

export default function AnnouncementForm({ initialData, editingId, onSubmit }: AnnouncementFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData || {
    title: "",
    description: "",
    image_url: "",
    link: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('announcements')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        navigate("/admin/login");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("announcements")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }

      setFormData({
        title: "",
        description: "",
        image_url: "",
        link: "",
      });
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {formData.image_url && (
            <img 
              src={formData.image_url} 
              alt="Preview" 
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>
        <div>
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          />
        </div>
        <Button type="submit" disabled={uploading}>
          {editingId ? "Update Announcement" : "Create Announcement"}
        </Button>
      </form>
    </Card>
  );
}