import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, CheckSquare } from "lucide-react";
import RegistrationFormBuilder from "@/modules/registration/RegistrationFormBuilder";
import RegistrationFlow from "@/modules/registration/RegistrationFlow";
import PaymentVerificationDashboard from "@/modules/registration/PaymentVerificationDashboard";
import { RegistrationPlatformProvider, defaultPlatformAdapter } from "@/modules/registration/platform-adapter";
import type { RegistrationFormConfig, PaymentVerification } from "@/modules/registration/types";

export default function RegistrationDemo() {
  const { toast } = useToast();
  const [config, setConfig] = useState<RegistrationFormConfig | undefined>();
  const [mockRegistrations, setMockRegistrations] = useState<PaymentVerification[]>([
    {
      id: "reg-1",
      teamName: "Alpha Squad",
      contactEmail: "alpha@example.com",
      paymentTransactionId: "TXN123456",
      paymentStatus: "submitted",
      status: "submitted",
      createdAt: new Date("2024-01-15"),
      paymentProofUrl: null
    },
    {
      id: "reg-2",
      teamName: "Beta Force",
      contactEmail: "beta@example.com",
      paymentStatus: "verified",
      status: "approved",
      createdAt: new Date("2024-01-14"),
      paymentTransactionId: null,
      paymentProofUrl: null
    }
  ]);

  const handleSaveConfig = (newConfig: RegistrationFormConfig) => {
    setConfig(newConfig);
    toast({
      title: "Configuration Saved",
      description: "Registration form configuration has been saved successfully.",
    });
  };

  const handleSubmitRegistration = (data: any) => {
    toast({
      title: "Registration Submitted",
      description: `Thank you ${data.teamName}! Your registration has been submitted.`,
    });

    const newRegistration: PaymentVerification = {
      id: `reg-${Date.now()}`,
      teamName: data.teamName,
      contactEmail: data.contactEmail,
      paymentTransactionId: data.paymentTransactionId,
      paymentProofUrl: data.paymentProofUrl,
      paymentStatus: data.paymentTransactionId || data.paymentProofUrl ? "submitted" : "pending",
      status: "submitted",
      createdAt: new Date()
    };

    setMockRegistrations([...mockRegistrations, newRegistration]);
  };

  const handleApprove = (id: string) => {
    setMockRegistrations(
      mockRegistrations.map(reg =>
        reg.id === id
          ? { ...reg, paymentStatus: "verified", status: "approved" }
          : reg
      )
    );
    toast({
      title: "Registration Approved",
      description: "Team has been added to the tournament.",
    });
  };

  const handleReject = (id: string) => {
    setMockRegistrations(
      mockRegistrations.map(reg =>
        reg.id === id
          ? { ...reg, paymentStatus: "rejected", status: "rejected" }
          : reg
      )
    );
    toast({
      title: "Registration Rejected",
      description: "Payment proof has been rejected.",
      variant: "destructive"
    });
  };

  const mockConfig: RegistrationFormConfig = {
    id: "demo-config",
    tournamentId: "demo-tournament",
    requiresPayment: 1,
    entryFee: 25,
    paymentUrl: "https://paypal.me/demo",
    paymentInstructions: "Please include your team name in the payment note.",
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        stepTitle: "Team Information",
        stepDescription: "Basic team details",
        fields: [
          {
            id: "field-1",
            fieldType: "text",
            fieldLabel: "Team Captain Name",
            fieldPlaceholder: "John Doe",
            isRequired: 1,
            displayOrder: 0,
            dropdownOptions: null
          },
          {
            id: "field-2",
            fieldType: "dropdown",
            fieldLabel: "Region",
            isRequired: 1,
            displayOrder: 1,
            dropdownOptions: "North America, Europe, Asia, South America, Africa, Oceania",
            fieldPlaceholder: null
          }
        ]
      },
      {
        id: "step-2",
        stepNumber: 2,
        stepTitle: "Player Roster",
        stepDescription: "List your team members",
        fields: [
          {
            id: "field-3",
            fieldType: "text",
            fieldLabel: "Player 1 IGN",
            fieldPlaceholder: "InGameName",
            isRequired: 1,
            displayOrder: 0,
            dropdownOptions: null
          },
          {
            id: "field-4",
            fieldType: "text",
            fieldLabel: "Player 2 IGN",
            fieldPlaceholder: "InGameName",
            isRequired: 1,
            displayOrder: 1,
            dropdownOptions: null
          },
          {
            id: "field-5",
            fieldType: "yesno",
            fieldLabel: "Do you have a substitute player?",
            isRequired: 0,
            displayOrder: 2,
            dropdownOptions: null,
            fieldPlaceholder: null
          }
        ]
      }
    ]
  };

  return (
    <RegistrationPlatformProvider value={defaultPlatformAdapter}>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Registration Module Demo</h1>
          <p className="text-muted-foreground">
            Modular, customizable registration system for tournament management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Builder</CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create custom multi-step forms with various field types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Flow</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Mobile-friendly registration with auto-save and payment integration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Review and approve payment submissions from organizer dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" data-testid="tab-builder">
              <Settings className="w-4 h-4 mr-2" />
              Form Builder
            </TabsTrigger>
            <TabsTrigger value="flow" data-testid="tab-flow">
              <Users className="w-4 h-4 mr-2" />
              User Registration
            </TabsTrigger>
            <TabsTrigger value="verification" data-testid="tab-verification">
              <CheckSquare className="w-4 h-4 mr-2" />
              Payment Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Registration Form Builder</CardTitle>
                <CardDescription>
                  Design custom registration forms with multiple steps and field types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationFormBuilder
                  tournamentId="demo-tournament"
                  initialConfig={config}
                  onSave={handleSaveConfig}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">User Registration Experience</CardTitle>
                <CardDescription>
                  Complete a multi-step registration with payment proof submission
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {config || mockConfig ? (
                  <RegistrationFlow
                    config={config || mockConfig}
                    tournamentId="demo-tournament"
                    tournamentName="Summer Championship 2024"
                    onSubmit={handleSubmitRegistration}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No registration form configured yet
                    </p>
                    <Badge variant="outline">
                      Go to Form Builder tab to create a form
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Payment Verification Dashboard</CardTitle>
                <CardDescription>
                  Review and approve registration submissions with payment proof
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentVerificationDashboard
                  registrations={mockRegistrations}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="font-display text-lg">Module Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Organizer Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Custom multi-step registration forms</li>
                  <li>✓ Flexible field types (text, dropdown, yes/no)</li>
                  <li>✓ Entry fee configuration</li>
                  <li>✓ Payment link integration (PayPal, Cash App, Stripe, etc.)</li>
                  <li>✓ Payment verification dashboard</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">User Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Mobile-friendly registration flow</li>
                  <li>✓ Local auto-save (resume later)</li>
                  <li>✓ Payment proof upload (screenshot or transaction ID)</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Real-time form validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </RegistrationPlatformProvider>
  );
}
