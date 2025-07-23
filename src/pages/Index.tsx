import { useState } from "react";
import AskGoBox from "@/components/home/AskGoBox";
import AgentCards from "@/components/home/AgentCards";
import RecentCasesSection from "@/components/home/RecentCasesSection";

const Index = () => {
  const [userName] = useState('Ana'); // Mock user name

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AskGoBox userName={userName} getTimeGreeting={getTimeGreeting} />
        <AgentCards />
        <RecentCasesSection />
      </div>
    </div>
  );
};

export default Index;