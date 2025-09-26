import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/components/DashboardStats";
import { MachineCard } from "@/components/MachineCard";
import { Search, Plus, Filter, Download } from "lucide-react";
import heroImage from "@/assets/hero-equipment.jpg";

// Mock data - In a real app, this would come from an API
const mockStats = {
  totalMachines: 24,
  operational: 18,
  maintenance: 4,
  alerts: 2,
  utilizationRate: 78,
  completedInspections: 156,
};

const mockMachines = [
  {
    id: "1",
    name: "Telehandler TH-001",
    model: "JCB 535-95",
    serialNumber: "JCB2023001",
    status: "operational" as const,
    location: "Construction Site A",
    project: "Office Building Project",
    operator: "Juan Pérez",
    hourMeter: 1245,
    lastInspection: "2024-01-15",
    nextMaintenance: "2024-02-15",
    fuelLevel: 75,
  },
  {
    id: "2",
    name: "Mini Loader ML-002",
    model: "Bobcat S650",
    serialNumber: "BOB2023002",
    status: "maintenance" as const,
    location: "Warehouse B",
    hourMeter: 2890,
    lastInspection: "2024-01-10",
    nextMaintenance: "2024-01-28",
    fuelLevel: 45,
  },
  {
    id: "3",
    name: "Telehandler TH-003",
    model: "Caterpillar TH3510D",
    serialNumber: "CAT2023003",
    status: "inspection" as const,
    location: "Industrial Zone C",
    project: "Manufacturing Facility",
    operator: "Maria González",
    hourMeter: 1567,
    lastInspection: "2023-12-20",
    nextMaintenance: "2024-02-01",
    fuelLevel: 90,
  },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMachines = mockMachines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (machineId: string) => {
    console.log("View details for machine:", machineId);
    // Navigate to machine details page
  };

  const handleStartInspection = (machineId: string) => {
    console.log("Start inspection for machine:", machineId);
    // Navigate to inspection form
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative p-8 text-primary-foreground">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Fleet Management Dashboard
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Monitor and manage your equipment fleet in real-time. Track inspections, 
              maintenance schedules, and operational efficiency.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Machine
              </Button>
              <Button variant="secondary" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats stats={mockStats} />

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Machines Overview */}
        <div className="md:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fleet Overview</CardTitle>
                  <CardDescription>
                    Current status of your equipment fleet
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search machines, models, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4">
                {filteredMachines.map((machine) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    onViewDetails={handleViewDetails}
                    onStartInspection={handleStartInspection}
                  />
                ))}
                
                {filteredMachines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No machines found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Register New Machine
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Records
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Critical notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                  <div>
                    <p className="text-sm font-medium">Engine Alert - TH-003</p>
                    <p className="text-xs text-muted-foreground">High temperature detected</p>
                    <Badge variant="destructive" className="text-xs mt-1">Critical</Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2" />
                  <div>
                    <p className="text-sm font-medium">Maintenance Due - ML-002</p>
                    <p className="text-xs text-muted-foreground">300h service required</p>
                    <Badge variant="secondary" className="text-xs mt-1">Due Soon</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}