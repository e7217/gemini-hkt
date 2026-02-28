import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-4xl font-bold mb-4">LifePath</h1>
      <p className="text-lg text-muted-foreground">
        Explore your life path with AI.
      </p>
      <Card className="p-6 flex flex-col gap-4 min-w-[300px]">
        <Input placeholder="Enter your goal..." />
        <Button>Generate Path</Button>
      </Card>
    </div>
  );
}
