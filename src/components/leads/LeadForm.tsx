'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CreateLeadSchema, type CreateLeadInput } from '@/lib/validations/lead';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * User type for the assigned user dropdown
 */
interface User {
  _id: string;
  name: string;
  email: string;
}

/**
 * LeadForm Client Component
 * 
 * Provides a dialog form for creating new leads with react-hook-form + Zod validation.
 * Shows assignedTo field only for Admin users.
 * Displays field-level validation errors inline.
 * On successful submission, POSTs to /api/leads and refreshes the page.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */
export function LeadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  const isAdmin = session?.user?.role === 'admin';

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(CreateLeadSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      stage: 'New',
      assignedTo: 'unassigned',
      followUpDate: '',
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
      reset();
      setFollowUpDate(undefined);
    }
  };

  /**
   * Handle form submission
   * **Validates: Requirements 4.1, 4.2**
   */
  const onSubmit = async (data: CreateLeadInput) => {
    setIsSubmitting(true);
    
    try {
      // Format followUpDate if set and handle unassigned value
      const payload = {
        ...data,
        assignedTo: data.assignedTo === 'unassigned' ? undefined : data.assignedTo,
        followUpDate: followUpDate ? followUpDate.toISOString() : undefined,
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lead');
      }

      // Success - close dialog and refresh page
      setOpen(false);
      reset();
      setFollowUpDate(undefined);
      router.refresh();
      
      toast({
        title: 'Lead created',
        description: 'The lead has been successfully created.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error creating lead',
        description: error instanceof Error ? error.message : 'Failed to create lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your pipeline. Fill in the required information below.
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
                <p className="text-sm text-red-500">{errors.assignedTo.message}</p>
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
                <Calendar
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
              <p className="text-sm text-red-500">{errors.followUpDate.message}</p>
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
                  Creating...
                </>
              ) : (
                'Create Lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
