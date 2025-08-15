import React, { useEffect, useState } from 'react';

interface Comment {
  id: string;
  authorName: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface CommentsSectionProps {
  videoId: string;
  currentUser: { id: string; role: string; nome?: string };
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ videoId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Excluir este comentário?')) return;
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    setComments(comments => comments.filter(c => c.id !== commentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment })
    });
    const created = await res.json();
    setComments(comments => [...comments, created]);
    setNewComment('');
    setSubmitting(false);
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">Comentários</h3>
      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-3 mb-4">
        {loading ? (
          <div className="text-gray-400 text-sm">Carregando comentários...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-400 text-sm">Nenhum comentário ainda.</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-1 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-era-blue text-sm">{comment.authorName}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {currentUser.role === 'admin' && (
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 text-base px-2 py-1 rounded transition"
                    onClick={() => handleDelete(comment.id)}
                    title="Excluir comentário"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{comment.text}</div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-era-green focus:border-era-green"
          rows={2}
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-era-green text-white font-semibold px-4 py-1 rounded-lg shadow hover:bg-era-green/90 transition disabled:opacity-60"
            disabled={submitting || newComment.trim() === ''}
          >
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection; 