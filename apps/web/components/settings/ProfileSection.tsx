"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY_OPTIONS } from "@/lib/subscription-options";
import { updateCurrentUserProfile } from "@/lib/users";
import type { UserProfile } from "@/types";

const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  baseCurrency: z.string().min(1, "Select a currency"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Props = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
};

export function ProfileSection({ profile, onSaved }: Props) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      baseCurrency: profile.baseCurrency,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateCurrentUserProfile(values);
    if (result.success && result.data) {
      onSaved(result.data);
      form.reset(values);
    } else {
      form.setError("root", { message: result.error ?? "Failed to save profile — please try again" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" value={profile.email} disabled readOnly />
            </div>

            <FormField
              control={form.control}
              name="baseCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Currency</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p role="alert" className="text-xs text-error">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
                className="bg-accent text-accent-foreground hover:bg-accent-dark"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
