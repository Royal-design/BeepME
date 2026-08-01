"use client";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EditProfileSchema, ProfileFormData } from "@/schema/profileSchema";
import { Textarea } from "@/components/ui/textarea";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getUserData } from "@/redux/slice/authSlice";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";

interface EditProfilePageProps {
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditProfilePage = ({
  setIsEditDialogOpen
}: EditProfilePageProps) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;

  const form = useForm({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      bio: "",
      name: "",
      photo: null
    }
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name || "");
      form.setValue("bio", user.bio || "");
    }
  }, [user, form]);

  const handleImageUpload = async (file?: File) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chattybee");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/chattybee/image/upload",
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  const handleSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("User ID is undefined");
      }

      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      let newImageUrl = userSnapshot.exists()
        ? userSnapshot.data()?.photo
        : null;

      if (data.photo instanceof File) {
        const uploadedImageUrl = await handleImageUpload(data.photo);
        if (uploadedImageUrl) newImageUrl = uploadedImageUrl;
      }

      const updatedData = {
        name: data.name,
        bio: data.bio,
        photo: newImageUrl ?? null,
        id: userId,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, updatedData, { merge: true });

      toast.success("Profile updated");
      setIsEditDialogOpen(false);
      dispatch(getUserData());
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-2">
              <FormLabel className="sr-only">Profile photo</FormLabel>
              <button
                type="button"
                onClick={() => document.getElementById("profile-photo")?.click()}
                className="group relative cursor-pointer rounded-full"
                aria-label="Upload profile photo"
              >
                <Avatar
                  src={previewUrl || user?.photo}
                  name={user?.name}
                  size="xl"
                />
                <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Camera size={20} className="text-white" />
                </span>
              </button>
              <Input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  field.onChange(file);

                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setPreviewUrl(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-[11px] text-faint">
                Click to upload a new photo
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  className="h-11 bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Tell the hive a little about yourself"
                  className="resize-none bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={loading || form.formState.isSubmitting}
          type="submit"
          className="h-11 w-full cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};
