import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegistrationStep, RegistrationField } from "@shared/schema";

interface RegistrationConfig {
  id: string;
  tournamentId: string;
  requiresPayment: number;
  entryFee: string | null;
  paymentUrl: string | null;
  paymentInstructions: string | null;
  steps: (RegistrationStep & { fields: RegistrationField[] })[];
}

interface TournamentRegistrationFormProps {
  tournamentId: string;
  tournamentName: string;
  onRegistrationSuccess?: () => void;
}

export default function TournamentRegistrationForm({
  tournamentId,
  tournamentName,
  onRegistrationSuccess,
}: TournamentRegistrationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Fetch registration config with steps and fields
  const { data: config, isLoading: configLoading } = useQuery<RegistrationConfig>({
    queryKey: [`/api/tournaments/${tournamentId}/registration-config`],
  });

  // Build dynamic schema based on fetched fields
  const dynamicSchema = useMemo(() => {
    const schemaObj: Record<string, any> = {
      teamName: z.string().min(1, "Team name is required"),
      contactEmail: z.string().email("Valid email required").optional(),
    };

    // Add fields for each step if config exists
    if (config?.steps) {
      config.steps.forEach((step) => {
        step.fields.forEach((field) => {
          let fieldSchema: any;

          if (field.fieldType === "text") {
            fieldSchema = z.string();
            if (field.isRequired) {
              fieldSchema = fieldSchema.min(1, `${field.fieldLabel} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
          } else if (field.fieldType === "dropdown") {
            fieldSchema = z.string();
            if (field.isRequired) {
              fieldSchema = fieldSchema.min(1, `${field.fieldLabel} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
          } else if (field.fieldType === "yesno") {
            fieldSchema = z.string();
            if (field.isRequired) {
              fieldSchema = fieldSchema.min(1, `${field.fieldLabel} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
          }

          schemaObj[field.id] = fieldSchema;
        });
      });
    }

    return z.object(schemaObj);
  }, [config]);

  type FormData = {
    teamName: string;
    contactEmail?: string;
    [key: string]: any;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      teamName: "",
      contactEmail: user?.email || "",
      ...Object.fromEntries(
        config?.steps.flatMap((s) => s.fields).map((f) => [f.id, ""]) || []
      ),
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const responses = Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => key !== "teamName" && key !== "contactEmail")
          .map(([key, value]) => [key, value])
      );

      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/registrations`, {
        teamName: data.teamName,
        contactEmail: data.contactEmail,
        userId: user?.id,
        responses,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Registration submitted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/tournaments/${tournamentId}/registrations`],
      });
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

  if (configLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Loading registration form...</p>
        </CardContent>
      </Card>
    );
  }

  if (!config || config.steps.length === 0) {
    // Fallback to basic form if no config
    return (
      <Card>
        <CardHeader>
          <CardTitle>Register for Tournament</CardTitle>
          <CardDescription>{tournamentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data as FormData))} className="space-y-4">
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

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Sort fields by display order
  const sortedFields = [...currentStep.fields].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register",
        variant: "destructive",
      });
      return;
    }

    if (isLastStep) {
      registerMutation.mutate(data);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStep.stepTitle || "Registration"}</CardTitle>
        <CardDescription>
          {currentStep.stepDescription || tournamentName}
          {config.steps.length > 1 && (
            <div className="mt-2 text-xs font-medium">
              Step {currentStepIndex + 1} of {config.steps.length}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Show team name and email on first step only */}
            {isFirstStep && (
              <>
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
              </>
            )}

            {/* Dynamic fields for current step */}
            <div className="space-y-4">
              {sortedFields.map((field) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id as keyof FormData}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.fieldLabel}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        {field.fieldType === "text" && (
                          <Input
                            placeholder={field.fieldPlaceholder || ""}
                            {...formField}
                            data-testid={`input-${field.id}`}
                          />
                        )}
                        {field.fieldType === "dropdown" && (
                          <Select value={formField.value || ""} onValueChange={formField.onChange}>
                            <SelectTrigger data-testid={`select-${field.id}`}>
                              <SelectValue
                                placeholder={field.fieldPlaceholder || "Select an option"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.dropdownOptions && 
                                JSON.parse(field.dropdownOptions).map((option: string) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.fieldType === "yesno" && (
                          <Select value={formField.value || ""} onValueChange={formField.onChange}>
                            <SelectTrigger data-testid={`select-${field.id}`}>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                disabled={isFirstStep || registerMutation.isPending}
                data-testid="button-previous-step"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1"
                data-testid={isLastStep ? "button-register-submit" : "button-next-step"}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLastStep ? "Registering..." : "Processing..."}
                  </>
                ) : isLastStep ? (
                  "Register Team"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
