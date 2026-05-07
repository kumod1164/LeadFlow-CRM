'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Pencil, Loader2, Mail, Phone, Building2, Calendar, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateLeadSchema, type UpdateLeadInput } from '@/lib/validations/lead';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * Lead type (serialized from MongoDB)
 */
interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  followUpDate?: string;
  notes: Array<{
    _id: string;
    content: string;
    authorName: string;
    createdAt: string;
  }>;
  timeline: Array<{
    action: string;
    userName: string;
    details?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * User type for the assigned user dropdown
 */
interface User {
  _id: string;
  name: string;
  email: string;
}

/**
 * Stage badge color mapping
 */
const stageBadgeColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Contacted: 'bg-purple-100 text-purple-800 border-purple-200',
  Qualified: 'bg-green-100 text-green-800 border-green-200',
  Won: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Lost: 'bg-red-100 text-red-800 border-red-200',
};

/**
 * LeadInfoPanel Client Component
 * 
 * Displays lead information with editable fields via a dialog.
 * Allows updating lead details including name, email, phone, company, stage,
 * assignedTo (Admin only), and followUpDate.
 * 
 * Includes an inline follow-up date picker that immediately updates the lead
 * when a date is selected, triggering a PATCH request to /api/leads/[id].
 * 
 * **Validates: Requirements 7.1, 7.5, 11.1**
 */
export function LeadInfoPanel({
  lead,
  userRole,
}: {
  lead: Lead;
  userRole: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(
    lead.followUpDate ? new Date(lead.followUpDate) : undefined
  );
  const [isUpdatingFollowUp, setIsUpdatingFollowUp] = useState(false);

  const isAdmin = userRole === 'admin';

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<UpdateLeadInput>({
    resolver: zodResolver(UpdateLeadSchema) as any,
    defaultValues: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      stage: lead.stage,
      assignedTo: lead.assignedTo?._id || 'unassigned',
      followUpDate: lead.followUpDate || '',
    },
  });

  const selectedStage = watch('stage');
  const selectedAssignedTo = watch('assignedTo');

  /**
   * Fetch users when dialog opens (Admin only)
   */
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen && isAdmin && users.length === 0) {
      setIsLoadingUsers(true);
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          toast({
            title: 'Error loading users',
            description: 'Failed to fetch user list. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error loading users',
          description: 'Failed to fetch user list. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    }

    // Reset form when dialog closes
    if (!isOpen) {
      reset({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        stage: lead.stage,
        assignedTo: lead.assignedTo?._id || 'unassigned',
        followUpDate: lead.followUpDate || '',
      });
      setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate) : undefined);
    }
  };

  /**
   * Handle inline follow-up date change
   * Immediately PATCH the lead with the new followUpDate
   */
  const handleFollowUpDateChange = async (date: Date | undefined) => {
    setIsUpdatingFollowUp(true);

    try {
      const response = await fetch(`/api/leads/${lead._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followUpDate: date ? date.toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update follow-up date');
      }

      // Success - update local state and refresh page
      setFollowUpDate(date);
      router.refresh();
      
      toast({
        title: 'Follow-up date updated',
        description: date ? 'Follow-up reminder has been set.' : 'Follow-up date has been cleared.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating follow-up date:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update follow-up date. Please try again.',
        variant: 'destructive',
      });
      // Revert to original date on error
      setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate) : undefined);
    } finally {
      setIsUpdatingFollowUp(false);
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: UpdateLeadInput) => {
    setIsSubmitting(true);

    try {
      // Format followUpDate if set and handle unassigned value
      const payload = {
        ...data,
        assignedTo: data.assignedTo === 'unassigned' ? undefined : data.assignedTo,
        followUpDate: followUpDate ? followUpDate.toISOString() : undefined,
      };

      const response = await fetch(`/api/leads/${lead._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lead');
      }

      // Success - close dialog and refresh page
      setOpen(false);
      router.refresh();
      
      toast({
        title: 'Lead updated',
        description: 'Lead information has been successfully updated.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Lead Information</CardTitle>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update lead information. Changes will be recorded in the activity timeline.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field - Required */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field - Required */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Company Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  {...register('company')}
                  disabled={isSubmitting}
                />
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company.message}</p>
                )}
              </div>

              {/* Stage Field - Required */}
              <div className="space-y-2">
                <Label htmlFor="stage">
                  Stage <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedStage}
                  onValueChange={(value) => setValue('stage', value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-sm text-red-500">{errors.stage.message}</p>
                )}
              </div>

              {/* Assigned To Field - Admin Only */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select
                    value={selectedAssignedTo}
                    onValueChange={(value) => setValue('assignedTo', value)}
                    disabled={isSubmitting || isLoadingUsers}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select user (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assignedTo && (
                    <p className="text-sm text-red-500">
                      {errors.assignedTo.message}
                    </p>
                  )}
                </div>
              )}

              {/* Follow Up Date Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow Up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="followUpDate"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !followUpDate && 'text-muted-foreground'
                      )}
                      disabled={isSubmitting}
                    >
                      {followUpDate ? (
                        format(followUpDate, 'PPP')
                      ) : (
                        <span>Pick a date (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={followUpDate}
                      onSelect={(date) => {
                        setFollowUpDate(date);
                        setValue('followUpDate', date ? date.toISOString() : '');
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.followUpDate && (
                  <p className="text-sm text-red-500">
                    {errors.followUpDate.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Email</span>
            </div>
            <p className="text-gray-900">{lead.email}</p>
          </div>

          {lead.phone && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-gray-900">{lead.phone}</p>
            </div>
          )}

          {lead.company && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Company</span>
              </div>
              <p className="text-gray-900">{lead.company}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Stage</span>
            </div>
            <Badge
              className={cn(
                'border',
                stageBadgeColors[lead.stage] || 'bg-gray-100 text-gray-800'
              )}
            >
              {lead.stage}
            </Badge>
          </div>

          {lead.assignedTo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span className="font-medium">Assigned To</span>
              </div>
              <div className="flex items-center gap-2">
                {lead.assignedTo.image && (
                  <img
                    src={lead.assignedTo.image}
                    alt={lead.assignedTo.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <p className="text-gray-900">{lead.assignedTo.name}</p>
              </div>
            </div>
          )}

          {/* Inline Follow Up Date Picker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Follow Up Date</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !followUpDate && 'text-muted-foreground',
                    isUpdatingFollowUp && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={isUpdatingFollowUp}
                >
                  {isUpdatingFollowUp ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : followUpDate ? (
                    format(followUpDate, 'PPP')
                  ) : (
                    <span>Set follow-up date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={followUpDate}
                  onSelect={handleFollowUpDateChange}
                  initialFocus
                  disabled={isUpdatingFollowUp}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>{' '}
              <span className="text-gray-900">
                {format(new Date(lead.createdAt), 'PPP')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>{' '}
              <span className="text-gray-900">
                {format(new Date(lead.updatedAt), 'PPP')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
