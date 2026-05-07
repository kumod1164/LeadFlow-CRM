'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface NoteFormProps {
  leadId: string;
}

/**
 * NoteForm Client Component
 * 
 * Renders a form to add notes to a lead.
 * - Textarea for note content
 * - Submit button
 * - Client-side validation (empty content check)
 * - POST to /api/leads/[id]/notes
 * - Refreshes page on success
 * 
 * **Validates: Requirements 7.2, 7.3**
 */
export function NoteForm({ leadId }: NoteFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!content.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add note');
      }

      // Clear form and refresh page
      setContent('');
      router.refresh();
      
      toast({
        title: 'Note added',
        description: 'Your note has been successfully added.',
        variant: 'default',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
      toast({
        title: 'Error adding note',
        description: err.message || 'Failed to add note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-content">Add a Note</Label>
        <Textarea
          id="note-content"
          placeholder="Enter your note here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(''); // Clear error on change
          }}
          disabled={isSubmitting}
          className="min-h-[100px]"
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Note'}
      </Button>
    </form>
  );
}
