import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Olym Pose account to get started",
};

export default function RegisterPage() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-display-sm">Create your account</CardTitle>
        <CardDescription className="text-base">
          Join Olym Pose and start your fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
