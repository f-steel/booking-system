"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Shield } from "lucide-react";
import { useDevAdminMode } from "@/components/DevAdminToggle";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shoeType: string;
  serviceType: string;
  scheduledDate: Date;
  notes: string | null;
  status: string;
  collectionRequired: boolean;
  collectionAddress: string | null;
  collectionCity: string | null;
  collectionPostcode: string | null;
}

export default function EditBookingForm({
  booking,
  isAdmin: serverIsAdmin = false,
}: {
  booking: Booking;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { isDevAdmin } = useDevAdminMode();
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || "",
    shoeType: booking.shoeType,
    serviceType: booking.serviceType,
    scheduledDate: format(
      new Date(booking.scheduledDate),
      "yyyy-MM-dd'T'HH:mm"
    ),
    notes: booking.notes || "",
    status: booking.status,
    collectionRequired: booking.collectionRequired || false,
    collectionAddress: booking.collectionAddress || "",
    collectionCity: booking.collectionCity || "",
    collectionPostcode: booking.collectionPostcode || "",
  });

  // Update admin status based on dev mode
  useEffect(() => {
    const checkAdmin = () => {
      if (process.env.NODE_ENV === "development") {
        // In dev mode, ONLY use dev admin toggle - ignore server admin status
        const localValue = localStorage.getItem("dev_admin_mode") === "true";
        const devAdminValue = localValue || isDevAdmin;
        setIsAdmin(devAdminValue);
        return;
      }
      // In production, use server admin status
      setIsAdmin(serverIsAdmin);
    };

    checkAdmin();

    // Listen for dev admin mode changes
    if (process.env.NODE_ENV === "development") {
      const handleChange = (e: CustomEvent) => {
        // When toggle changes, immediately update - this overrides server admin status
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
  }, [isDevAdmin, serverIsAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update booking");
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
    <Card className="shadow-xl border-2">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
          Edit Booking
          {isAdmin && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          {isAdmin
            ? "Update all booking details"
            : "You can only update status and notes. To update other information, please add a comment on the booking page."}
        </CardDescription>
        {!isAdmin && (
          <div className="mt-2 p-3 bg-muted/50 border border-border rounded-md">
            <p className="text-sm text-foreground">
              <strong className="font-semibold">Need to update your information?</strong> Please add a
              comment on the booking details page and we&apos;ll update it for
              you.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              disabled={!isAdmin}
              required
              className={!isAdmin ? "bg-muted" : ""}
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
              disabled={!isAdmin}
              required
              className={!isAdmin ? "bg-muted" : ""}
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
              disabled={!isAdmin}
              className={!isAdmin ? "bg-muted" : ""}
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
              disabled={!isAdmin}
              required
              className={!isAdmin ? "bg-muted" : ""}
            >
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
              disabled={!isAdmin}
              required
              className={!isAdmin ? "bg-muted" : ""}
            >
              <option value="basic">Basic Clean</option>
              <option value="deep">Deep Clean</option>
              <option value="restoration">Restoration</option>
              <option value="custom">Custom Service</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              required
            >
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="ready_for_collection">Ready for Collection</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              disabled={!isAdmin}
              required
              className={!isAdmin ? "bg-muted" : ""}
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
                <Label htmlFor="collectionRequired" className="text-base font-medium">
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
                  disabled={!isAdmin}
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
                    disabled={!isAdmin}
                    required={formData.collectionRequired}
                    className={`w-full ${!isAdmin ? "bg-muted" : ""}`}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionCity">
                      City *
                    </Label>
                    <Input
                      id="collectionCity"
                      value={formData.collectionCity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          collectionCity: e.target.value,
                        })
                      }
                      disabled={!isAdmin}
                      required={formData.collectionRequired}
                      className={!isAdmin ? "bg-muted" : ""}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionPostcode">
                      Postcode *
                    </Label>
                    <Input
                      id="collectionPostcode"
                      value={formData.collectionPostcode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          collectionPostcode: e.target.value,
                        })
                      }
                      disabled={!isAdmin}
                      required={formData.collectionRequired}
                      className={!isAdmin ? "bg-muted" : ""}
                      placeholder="Postcode"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Updating..." : "Update Booking"}
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
  );
}


