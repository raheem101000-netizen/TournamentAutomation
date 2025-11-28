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
import { Loader2 } from "lucide-react";
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

  // Fetch registration config with steps and fields
  const { data: config, isLoading: configLoading } = useQuery<RegistrationConfig | null>({
    queryKey: [`/api/tournaments/${tournamentId}/registration/config`],
  });

  // Build dynamic schema based on fetched fields
  const schemaObj: Record<string, any> = {};

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

  const dynamicSchema = z.object(schemaObj);

  type FormData = Record<string, any>;

  const form = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: Object.fromEntries(
      config?.steps.flatMap((s) => s.fields).map((f) => [f.id, ""]) || []
    ),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/registrations`, {
        userId: user?.id,
        responses: data,
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

  // If no registration config was set up, don't show a form at all
  if (!config) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground text-sm">Registration is not available for this tournament</p>
        </CardContent>
      </Card>
    );
  }

  // Collect all fields from all steps and sort by display order
  const allFields = config.steps
    ? config.steps
        .flatMap((step) =>
          step.fields.map((field) => ({
            ...field,
            stepTitle: step.stepTitle,
            stepNumber: step.stepNumber,
          }))
        )
        .sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const onSubmit = (data: FormData) => {
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Show registration steps that organizer created */}
            {config.steps && config.steps.length > 0 ? (
              <div className="space-y-6">
                {config.steps.map((step) => (
                  <div key={step.id} className="border-l-2 border-primary/30 pl-4 py-2">
                    <h3 className="font-semibold text-sm mb-1">{step.stepTitle}</h3>
                    {step.stepDescription && (
                      <p className="text-xs text-muted-foreground mb-3">{step.stepDescription}</p>
                    )}
                    
                    {/* Fields for this step */}
                    {step.fields && step.fields.length > 0 ? (
                      <div className="space-y-3">
                        {step.fields
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((field) => (
                            <FormField
                              key={field.id}
                              control={form.control}
                              name={field.id}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>
                                    {field.fieldLabel}
                                    {field.isRequired && <span className="text-destructive ml-1">*</span>}
                                  </FormLabel>
                                  <FormControl>
                                    {field.fieldType === "text" ? (
                                      <Input
                                        placeholder={field.fieldPlaceholder || ""}
                                        {...formField}
                                        value={formField.value || ""}
                                        onChange={formField.onChange}
                                        data-testid={`input-${field.id}`}
                                      />
                                    ) : field.fieldType === "dropdown" ? (
                                      <Select
                                        value={formField.value || ""}
                                        onValueChange={formField.onChange}
                                      >
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
                                    ) : field.fieldType === "yesno" ? (
                                      <Select
                                        value={formField.value || ""}
                                        onValueChange={formField.onChange}
                                      >
                                        <SelectTrigger data-testid={`select-${field.id}`}>
                                          <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="yes">Yes</SelectItem>
                                          <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : null}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No fields configured for this step yet</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No registration steps configured for this tournament</p>
              </div>
            )}

            {/* Submit button */}
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
