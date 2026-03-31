'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Props = { haulerSlug: string };

export function ReviewForm({ haulerSlug }: Props) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ haulerSlug, reviewerName: name, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submission failed');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <div className="text-3xl mb-3">⭐</div>
        <h3 className="font-serif font-bold text-lg mb-1" style={{ color: '#005A9C' }}>
          Thank you for your review!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your review has been submitted and will appear once approved by our team.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="font-serif text-xl font-bold mb-1">Leave a Review</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Share your experience with this hauler. Reviews are moderated before publishing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="review-name">Your Name</Label>
          <Input
            id="review-name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className="h-8 w-8 transition-colors"
                  style={{
                    fill: star <= (hovered || rating) ? '#F2A900' : 'transparent',
                    stroke: star <= (hovered || rating) ? '#F2A900' : '#9ca3af',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="review-comment">Comment</Label>
          <Textarea
            id="review-comment"
            placeholder="Describe your experience — punctuality, professionalism, water quality…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={10}
            maxLength={1000}
            rows={4}
          />
          <p className="text-xs text-muted-foreground text-right">{comment.length}/1000</p>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        )}

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full font-semibold"
          style={{ backgroundColor: '#005A9C', color: '#fff' }}
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
