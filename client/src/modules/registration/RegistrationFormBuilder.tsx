import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, DollarSign, Link as LinkIcon, Edit2 } from "lucide-react";
import type { RegistrationFormConfig, RegistrationStepConfig, RegistrationFieldConfig, FieldType } from "./types";

interface RegistrationFormBuilderProps {
  tournamentId: string;
  initialConfig?: RegistrationFormConfig;
  onSave: (config: RegistrationFormConfig) => void;
}

export default function RegistrationFormBuilder({
  tournamentId,
  initialConfig,
  onSave
}: RegistrationFormBuilderProps) {
  const [requiresPayment, setRequiresPayment] = useState(initialConfig?.requiresPayment === 1 || false);
  const [entryFee, setEntryFee] = useState(initialConfig?.entryFee?.toString() || "");
  const [paymentUrl, setPaymentUrl] = useState(initialConfig?.paymentUrl || "");
  const [paymentInstructions, setPaymentInstructions] = useState(initialConfig?.paymentInstructions || "");
  const [steps, setSteps] = useState<RegistrationStepConfig[]>(
    initialConfig?.steps || [
      {
        id: "step-1",
        stepNumber: 1,
        stepTitle: "Team Information",
        stepDescription: "Basic team details",
        fields: [
          {
            id: "field-team-name",
            fieldType: "text",
            fieldLabel: "Team Name",
            fieldPlaceholder: "Enter your team name",
            isRequired: 1,
            dropdownOptions: null,
            displayOrder: 0
          }
        ]
      }
    ]
  );

  const addStep = () => {
    const newStep: RegistrationStepConfig = {
      id: `step-${Date.now()}`,
      stepNumber: steps.length + 1,
      stepTitle: `Step ${steps.length + 1}`,
      stepDescription: "",
      fields: []
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    const filtered = steps.filter(s => s.id !== stepId);
    const renumbered = filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1
    }));
    setSteps(renumbered);
  };

  const updateStep = (stepId: string, updates: Partial<RegistrationStepConfig>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const addField = (stepId: string) => {
    const newField: RegistrationFieldConfig = {
      id: `field-${Date.now()}`,
      fieldType: "text",
      fieldLabel: "New Field",
      fieldPlaceholder: "",
      isRequired: 1,
      dropdownOptions: null,
      displayOrder: 0
    };

    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: [...step.fields, { ...newField, displayOrder: step.fields.length }]
        };
      }
      return step;
    }));
  };

  const updateField = (stepId: string, fieldId: string, updates: Partial<RegistrationFieldConfig>) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
          )
        };
      }
      return step;
    }));
  };

  const removeField = (stepId: string, fieldId: string) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.filter(f => f.id !== fieldId)
        };
      }
      return step;
    }));
  };

  const handleSave = async () => {
    // Convert dropdown options from comma-separated string to JSON array
    const processedSteps = steps.map(step => {
      return {
        ...step,
        fields: step.fields.map((field, idx) => {
          const processedField = {
            ...field,
            displayOrder: idx,
            dropdownOptions: field.fieldType === "dropdown" && field.dropdownOptions
              ? JSON.stringify(
                  field.dropdownOptions
                    .split(",")
                    .map((opt: string) => opt.trim())
                    .filter((opt: string) => opt.length > 0)
                )
              : null
          };
          return processedField;
        })
      };
    });

    const config: RegistrationFormConfig = {
      id: initialConfig?.id || `config-${Date.now()}`,
      tournamentId,
      requiresPayment: requiresPayment ? 1 : 0,
      entryFee: requiresPayment && entryFee ? parseInt(entryFee) : null,
      paymentUrl: requiresPayment ? paymentUrl : null,
      paymentInstructions: requiresPayment ? paymentInstructions : null,
      steps: processedSteps
    };
    
    if (tournamentId !== "new") {
      await fetch(`/api/tournaments/${tournamentId}/registration/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
    }
    
    onSave(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Payment Settings</CardTitle>
          <CardDescription>Configure entry fee and payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Payment</Label>
              <p className="text-sm text-muted-foreground">Enable entry fee for this tournament</p>
            </div>
            <Switch
              checked={requiresPayment}
              onCheckedChange={setRequiresPayment}
              data-testid="switch-requires-payment"
            />
          </div>

          {requiresPayment && (
            <>
              <div className="space-y-2">
                <Label htmlFor="entry-fee">Entry Fee (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="entry-fee"
                    type="number"
                    min="0"
                    placeholder="25"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="pl-10"
                    data-testid="input-entry-fee"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-url">Payment URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="payment-url"
                    type="url"
                    placeholder="https://paypal.me/yourlink or https://cash.app/$yourtag"
                    value={paymentUrl}
                    onChange={(e) => setPaymentUrl(e.target.value)}
                    className="pl-10"
                    data-testid="input-payment-url"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports PayPal, Cash App, Stripe, or any payment link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-instructions">Payment Instructions (Optional)</Label>
                <Textarea
                  id="payment-instructions"
                  placeholder="Include your team name in the payment note..."
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  rows={3}
                  data-testid="textarea-payment-instructions"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Registration Steps</h3>
          <p className="text-sm text-muted-foreground">Create custom registration flow</p>
        </div>
        <Button onClick={addStep} data-testid="button-add-step">
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step, stepIndex) => (
          <Card key={step.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                <Badge variant="outline">Step {step.stepNumber}</Badge>
                <Input
                  value={step.stepTitle}
                  onChange={(e) => updateStep(step.id, { stepTitle: e.target.value })}
                  className="font-display font-semibold flex-1 max-w-xs"
                  placeholder="Step title"
                  data-testid={`input-step-title-${stepIndex}`}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStep(step.id)}
                disabled={steps.length === 1}
                data-testid={`button-remove-step-${stepIndex}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  value={step.stepDescription || ""}
                  onChange={(e) => updateStep(step.id, { stepDescription: e.target.value })}
                  placeholder="Step description (optional)"
                  className="text-sm text-muted-foreground"
                  data-testid={`input-step-description-${stepIndex}`}
                />
              </div>

              <div className="space-y-3">
                {step.fields.map((field, fieldIndex) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Field Type</Label>
                          <Select
                            value={field.fieldType}
                            onValueChange={(value: FieldType) =>
                              updateField(step.id, field.id, { fieldType: value })
                            }
                          >
                            <SelectTrigger data-testid={`select-field-type-${stepIndex}-${fieldIndex}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Input</SelectItem>
                              <SelectItem value="dropdown">Dropdown</SelectItem>
                              <SelectItem value="yesno">Yes/No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.isRequired === 1}
                            onCheckedChange={(checked) =>
                              updateField(step.id, field.id, { isRequired: checked ? 1 : 0 })
                            }
                            data-testid={`switch-field-required-${stepIndex}-${fieldIndex}`}
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                      </div>

                      <Input
                        value={field.fieldLabel}
                        onChange={(e) =>
                          updateField(step.id, field.id, { fieldLabel: e.target.value })
                        }
                        placeholder="Field label"
                        data-testid={`input-field-label-${stepIndex}-${fieldIndex}`}
                      />

                      {field.fieldType === "text" && (
                        <Input
                          value={field.fieldPlaceholder || ""}
                          onChange={(e) =>
                            updateField(step.id, field.id, { fieldPlaceholder: e.target.value })
                          }
                          placeholder="Placeholder text (optional)"
                          data-testid={`input-field-placeholder-${stepIndex}-${fieldIndex}`}
                        />
                      )}

                      {field.fieldType === "dropdown" && (
                        <div>
                          <Label className="text-xs">Options (comma-separated)</Label>
                          <Input
                            value={field.dropdownOptions || ""}
                            onChange={(e) =>
                              updateField(step.id, field.id, { dropdownOptions: e.target.value })
                            }
                            placeholder="Option 1, Option 2, Option 3"
                            data-testid={`input-dropdown-options-${stepIndex}-${fieldIndex}`}
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(step.id, field.id)}
                      data-testid={`button-remove-field-${stepIndex}-${fieldIndex}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addField(step.id)}
                  className="w-full"
                  data-testid={`button-add-field-${stepIndex}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => console.log("Preview")}>
          <Edit2 className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleSave} data-testid="button-save-registration-config">
          Save Registration Form
        </Button>
      </div>
    </div>
  );
}
