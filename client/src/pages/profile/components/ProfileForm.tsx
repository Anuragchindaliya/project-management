import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { useAuthStore } from "@/shared/store/auth.store";
import apiClient from "@/shared/api/client";
import { User } from "@/shared/api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileAvatarSelector } from "./ProfileAvatarSelector";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  console.log({user})
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // We assume the backend might return a new user object or token. 
      // If it returns a user, great. If not, we might need to refresh auth.
      // Based on auth.controller.ts, it returns { user: updatedUser }.
      const res = await apiClient.patch("/auth/profile", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      setIsAvatarSelectorOpen(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  const handleAvatarSelect = (url: string) => {
    form.setValue("avatarUrl", url, { shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <div className="flex flex-col gap-4 items-center">
            <Avatar className="h-24 w-24">
            <AvatarImage src={form.watch("avatarUrl") || user.avatarUrl} />
            <AvatarFallback className="text-xl">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
            </AvatarFallback>
            </Avatar>
             <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
            >
                {isAvatarSelectorOpen ? "Close Selector" : "Change Avatar"}
            </Button>
        </div>

        {isAvatarSelectorOpen && (
            <div className="p-4 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-2">
                <Label className="mb-2 block">Choose an avatar</Label>
                <ProfileAvatarSelector
                    currentAvatarUrl={form.watch("avatarUrl")}
                    onSelect={handleAvatarSelect}
                />
            </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
