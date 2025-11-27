import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const registrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  contactEmail: z.string().email("Valid email required").optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface TournamentRegistrationFormProps {
  tournamentId: string;
  tournamentName: string;
  onRegistrationSuccess?: () => void;
}

export default function TournamentRegistrationForm({ 
  tournamentId, 
  tournamentName,
  onRegistrationSuccess 
}: TournamentRegistrationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: "",
      contactEmail: user?.email || "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const res = await apiRequest('POST', `/api/tournaments/${tournamentId}/registrations`, {
        ...data,
        userId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Registration submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/registrations`] });
      form.reset();
      onRegistrationSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for Tournament</CardTitle>
        <CardDescription>{tournamentName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your team name" 
                      {...field}
                      data-testid="input-register-team-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="your@email.com" 
                      {...field}
                      data-testid="input-register-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full"
              data-testid="button-register-submit"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Team"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
