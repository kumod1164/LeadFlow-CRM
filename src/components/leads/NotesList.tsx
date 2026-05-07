import { INote } from '@/models/Lead';
import { formatDistanceToNow } from 'date-fns';

interface NotesListProps {
  notes: INote[];
}

/**
 * NotesList Component
 * 
 * Displays all notes for a lead with author name and timestamp.
 * Notes are displayed in reverse chronological order (newest first).
 * 
 * **Validates: Requirements 7.2**
 */
export function NotesList({ notes }: NotesListProps) {
  // Sort notes by createdAt descending (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedNotes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No notes yet. Add the first note above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedNotes.map((note) => (
        <div
          key={note._id.toString()}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {note.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{note.authorName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
