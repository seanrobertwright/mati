'use client';

import { useState } from 'react';
import { Bell, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface NotificationPreferencesData {
  reviewReminders: {
    enabled: boolean;
    daysBeforeDue: number[];
    email: boolean;
    inApp: boolean;
  };
  approvalPending: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
  changeRequests: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
  documentUpdates: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesData;
  onSave: (preferences: NotificationPreferencesData) => void;
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences: initialPreferences,
  onSave,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);

  const handleSave = () => {
    onSave(preferences);
    setOpen(false);
  };

  const handleReset = () => {
    setPreferences(initialPreferences);
  };

  const togglePreference = (
    category: keyof NotificationPreferencesData,
    field: 'enabled' | 'email' | 'inApp',
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field],
      },
    }));
  };

  const updateDaysBeforeDue = (days: number, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      reviewReminders: {
        ...prev.reviewReminders,
        daysBeforeDue: checked
          ? [...prev.reviewReminders.daysBeforeDue, days].sort((a, b) => b - a)
          : prev.reviewReminders.daysBeforeDue.filter(d => d !== days),
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <Bell className="h-4 w-4" />
          Notification Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Customize how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Review Reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Review Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when documents are due for review
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.reviewReminders.enabled}
                onChange={() => togglePreference('reviewReminders', 'enabled')}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            {preferences.reviewReminders.enabled && (
              <div className="ml-6 space-y-3 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label className="text-sm">Remind me before due date:</Label>
                  <div className="flex flex-wrap gap-2">
                    {[30, 14, 7, 3, 1].map((days) => (
                      <label key={days} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.reviewReminders.daysBeforeDue.includes(days)}
                          onChange={(e) => updateDaysBeforeDue(days, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{days} day{days !== 1 ? 's' : ''}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Delivery method:</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.reviewReminders.inApp}
                        onChange={() => togglePreference('reviewReminders', 'inApp')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">In-app</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.reviewReminders.email}
                        onChange={() => togglePreference('reviewReminders', 'email')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Approval Pending */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Approval Pending</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when documents need your approval
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.approvalPending.enabled}
                onChange={() => togglePreference('approvalPending', 'enabled')}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            {preferences.approvalPending.enabled && (
              <div className="ml-6 space-y-2 pl-4 border-l-2">
                <Label className="text-sm">Delivery method:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.approvalPending.inApp}
                      onChange={() => togglePreference('approvalPending', 'inApp')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">In-app</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.approvalPending.email}
                      onChange={() => togglePreference('approvalPending', 'email')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Change Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Change Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about change requests for your documents
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.changeRequests.enabled}
                onChange={() => togglePreference('changeRequests', 'enabled')}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            {preferences.changeRequests.enabled && (
              <div className="ml-6 space-y-2 pl-4 border-l-2">
                <Label className="text-sm">Delivery method:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.changeRequests.inApp}
                      onChange={() => togglePreference('changeRequests', 'inApp')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">In-app</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.changeRequests.email}
                      onChange={() => togglePreference('changeRequests', 'email')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Document Updates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Document Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when documents you're watching are updated
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.documentUpdates.enabled}
                onChange={() => togglePreference('documentUpdates', 'enabled')}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            {preferences.documentUpdates.enabled && (
              <div className="ml-6 space-y-2 pl-4 border-l-2">
                <Label className="text-sm">Delivery method:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.documentUpdates.inApp}
                      onChange={() => togglePreference('documentUpdates', 'inApp')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">In-app</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.documentUpdates.email}
                      onChange={() => togglePreference('documentUpdates', 'email')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

