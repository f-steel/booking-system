"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserSearch from "@/components/UserSearch";
import { useDevAdminMode } from "@/components/DevAdminToggle";

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const { isDevAdmin } = useDevAdminMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shoeType: "",
    serviceType: "",
    scheduledDate: "",
    notes: "",
    collectionRequired: false,
    collectionAddress: "",
    collectionCity: "",
    collectionPostcode: "",
  });

  useEffect(() => {
    const checkAdmin = () => {
      // Check dev mode first - check localStorage immediately
      // In dev mode, ONLY use dev admin toggle - ignore server admin status
      if (process.env.NODE_ENV === "development") {
        const localValue = localStorage.getItem("dev_admin_mode") === "true";
        const devAdminValue = localValue || isDevAdmin;
        setIsAdmin(devAdminValue);
        return;
      }

      // Only check server if not in dev mode
      async function checkServerAdmin() {
        try {
          const response = await fetch("/api/admin/check");
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          }
        } catch {
          setIsAdmin(false);
        }
      }
      checkServerAdmin();
    };

    checkAdmin();

    // Listen for dev admin mode changes
    if (process.env.NODE_ENV === "development") {
      const handleChange = (e: CustomEvent) => {
        setIsAdmin(e.detail.enabled);
      };

      window.addEventListener(
        "devAdminModeChanged",
        handleChange as EventListener
      );
      return () => {
        window.removeEventListener(
          "devAdminModeChanged",
          handleChange as EventListener
        );
      };
    }
  }, [isDevAdmin]);

  useEffect(() => {
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        customerName: selectedUser.name || "",
        customerEmail: selectedUser.email,
      }));
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create booking");
      } else {
        router.push("/bookings");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">
              Create New Booking
            </CardTitle>
            <CardDescription className="text-sm">
              Add a new shoe cleaning booking
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <UserSearch
                onSelect={setSelectedUser}
                selectedUser={selectedUser}
                isAdmin={isAdmin}
              />

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shoeType">Shoe Type *</Label>
                <Select
                  id="shoeType"
                  value={formData.shoeType}
                  onChange={(e) =>
                    setFormData({ ...formData, shoeType: e.target.value })
                  }
                  required
                >
                  <option value="">Select shoe type</option>
                  <option value="sneakers">Sneakers</option>
                  <option value="running">Running Shoes</option>
                  <option value="basketball">Basketball Shoes</option>
                  <option value="trainers">Trainers</option>
                  <option value="leather">Leather Shoes</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  required
                >
                  <option value="">Select service</option>
                  <option value="basic">Basic Clean</option>
                  <option value="deep">Deep Clean</option>
                  <option value="restoration">Restoration</option>
                  <option value="custom">Custom Service</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <Label
                      htmlFor="collectionRequired"
                      className="text-base font-medium"
                    >
                      Collection Required
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable if shoes need to be collected from customer
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch
                      id="collectionRequired"
                      checked={formData.collectionRequired}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          collectionRequired: e.target.checked,
                          // Clear address fields if collection is disabled
                          ...(e.target.checked
                            ? {}
                            : {
                                collectionAddress: "",
                                collectionCity: "",
                                collectionPostcode: "",
                              }),
                        })
                      }
                    />
                  </div>
                </div>

                {formData.collectionRequired && (
                  <div className="space-y-4 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="collectionAddress">
                        Collection Address *
                      </Label>
                      <Input
                        id="collectionAddress"
                        value={formData.collectionAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            collectionAddress: e.target.value,
                          })
                        }
                        required={formData.collectionRequired}
                        placeholder="Street address"
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="collectionCity">City *</Label>
                        <Input
                          id="collectionCity"
                          value={formData.collectionCity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              collectionCity: e.target.value,
                            })
                          }
                          required={formData.collectionRequired}
                          placeholder="City"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="collectionPostcode">Postcode *</Label>
                        <Input
                          id="collectionPostcode"
                          value={formData.collectionPostcode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              collectionPostcode: e.target.value,
                            })
                          }
                          required={formData.collectionRequired}
                          placeholder="Postcode"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Creating..." : "Create Booking"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


