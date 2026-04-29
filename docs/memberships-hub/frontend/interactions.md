# Interactions — Likes, Comments & Replies

This page covers the like toggle, comment section, and reply flow on feed cards.

## Likes

### Hook: `useToggleLike`

```typescript
// hooks/use-toggle-like.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useToggleLike(feedItemId: string) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('toggle_feed_like', {
        p_feed_item_id: feedItemId,
      })
      if (error) throw error
      return data as boolean // true = liked, false = unliked
    },
    onMutate: async () => {
      // Optimistic update: flip liked state and adjust count in cache
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.feed })

      const snapshot = queryClient.getQueryData(feedQueryKeys.feed)

      queryClient.setQueryData(feedQueryKeys.feed, (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: any) =>
            item.feed_item_id === feedItemId
              ? {
                  ...item,
                  viewer_has_liked: !item.viewer_has_liked,
                  like_count: item.viewer_has_liked
                    ? item.like_count - 1
                    : item.like_count + 1,
                }
              : item
          ),
        })),
      }))

      return { snapshot }
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.snapshot) {
        queryClient.setQueryData(feedQueryKeys.feed, context.snapshot)
      }
    },
  })
}
```

### Like Button Component

```tsx
// components/like-button.tsx
import { Heart } from '@hugeicons/react'
import { useToggleLike } from '@/features/feed/hooks/use-toggle-like'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  feedItemId: string
  likeCount: number
  isLiked: boolean
}

export function LikeButton({ feedItemId, likeCount, isLiked }: LikeButtonProps) {
  const { mutate: toggleLike, isPending } = useToggleLike(feedItemId)

  return (
    <button
      onClick={() => toggleLike()}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
      )}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={cn('h-4 w-4', isLiked && 'fill-current')}
      />
      <span>{likeCount}</span>
    </button>
  )
}
```

---

## Comments

### Loading Comments

Comments are read directly from the table (not via RPC) using Supabase's table API:

```typescript
// hooks/use-feed-comments.ts
import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useFeedComments(feedItemId: string) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: feedQueryKeys.comments(feedItemId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_item_comments')
        .select(`
          id, body, created_at, user_profile_id,
          profiles!feed_item_comments_user_profile_id_fkey (
            username, display_name, avatar_url
          )
        `)
        .eq('feed_item_id', feedItemId)
        .is('parent_comment_id', null)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: false, // Load lazily when comment section opens
  })
}
```

Set `enabled: false` so comments only load when the user opens the comment section, not on initial feed load.

### Adding a Comment

```typescript
// hooks/use-add-comment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useAddComment(feedItemId: string) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      body,
      parentCommentId,
    }: {
      body: string
      parentCommentId?: string
    }) => {
      const { data, error } = await supabase.rpc('add_feed_comment', {
        p_feed_item_id: feedItemId,
        p_body: body,
        p_parent_comment_id: parentCommentId ?? null,
      })
      if (error) throw error
      return data as string // new comment id
    },
    onSuccess: () => {
      // Invalidate to refetch the comment list
      queryClient.invalidateQueries({
        queryKey: feedQueryKeys.comments(feedItemId),
      })
    },
  })
}
```

### Comment Section Component

```tsx
// components/comment-section.tsx
import { useState } from 'react'
import { useFeedComments } from '@/features/feed/hooks/use-feed-comments'
import { useAddComment } from '@/features/feed/hooks/use-add-comment'
import { CommentItem } from './comment-item'

interface CommentSectionProps {
  feedItemId: string
  commentCount: number
}

export function CommentSection({ feedItemId, commentCount }: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { data: comments, refetch } = useFeedComments(feedItemId)
  const { mutate: addComment, isPending } = useAddComment(feedItemId)

  const handleOpen = () => {
    setIsOpen(true)
    refetch()  // lazy load on open
  }

  const handleSubmit = () => {
    if (!newComment.trim()) return
    addComment(
      { body: newComment },
      { onSuccess: () => setNewComment('') }
    )
  }

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <MessageIcon className="h-4 w-4" />
        <span>{commentCount}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Comment input */}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={2000}
              className="flex-1 resize-none rounded-md border p-2 text-sm"
              rows={2}
            />
            <Button
              onClick={handleSubmit}
              disabled={isPending || !newComment.trim()}
              size="sm"
            >
              Post
            </Button>
          </div>

          {/* Comment list */}
          {comments?.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              feedItemId={feedItemId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Replies

Each `CommentItem` can expand to show replies and a reply input. Replies follow the same pattern as root comments, but pass `parentCommentId`:

```tsx
// components/comment-item.tsx
import { useState } from 'react'
import { useAddComment } from '@/features/feed/hooks/use-add-comment'
import { useDeleteComment } from '@/features/feed/hooks/use-delete-comment'
import { useReplies } from '@/features/feed/hooks/use-replies'

export function CommentItem({ comment, feedItemId }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyBody, setReplyBody] = useState('')

  const { mutate: addReply, isPending } = useAddComment(feedItemId)
  const { mutate: deleteComment } = useDeleteComment(feedItemId)
  const { data: replies, refetch: loadReplies } = useReplies(comment.id)

  const handleShowReplies = () => {
    setShowReplies(true)
    loadReplies()
  }

  const handleReply = () => {
    if (!replyBody.trim()) return
    addReply(
      { body: replyBody, parentCommentId: comment.id },
      { onSuccess: () => { setReplyBody(''); setShowReplyInput(false) } }
    )
  }

  return (
    <div className="flex gap-2">
      <Avatar src={comment.profiles.avatar_url} size="sm" />
      <div className="flex-1 space-y-1">
        <div className="text-sm">
          <span className="font-medium">{comment.profiles.display_name}</span>
          <span className="ml-1 text-muted-foreground text-xs">
            @{comment.profiles.username}
          </span>
        </div>
        <p className="text-sm">{comment.body}</p>

        <div className="flex gap-3 text-xs text-muted-foreground">
          <button onClick={() => setShowReplyInput(v => !v)}>Reply</button>
          {comment.user_profile_id === currentUserId && (
            <button onClick={() => deleteComment(comment.id)} className="text-destructive">
              Delete
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="flex gap-2 mt-2">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Reply to @${comment.profiles.username}...`}
              maxLength={2000}
              className="flex-1 resize-none rounded-md border p-2 text-sm"
              rows={2}
            />
            <Button onClick={handleReply} disabled={isPending} size="sm">Post</Button>
          </div>
        )}

        {/* Replies */}
        {!showReplies ? (
          <button onClick={handleShowReplies} className="text-xs text-muted-foreground">
            Show replies
          </button>
        ) : (
          <div className="ml-4 space-y-2 border-l pl-3">
            {replies?.map(reply => (
              <ReplyItem key={reply.id} reply={reply} feedItemId={feedItemId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Deleting a Comment

```typescript
// hooks/use-delete-comment.ts
export function useDeleteComment(feedItemId: string) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.rpc('delete_feed_comment', {
        p_comment_id: commentId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedQueryKeys.comments(feedItemId),
      })
    },
  })
}
```

> The creator hide action (`hide_feed_comment`) should be exposed in an admin/creator-only context — for example, a three-dot menu on comment items when `viewer.id === item.creator_profile_id`.

### Error Handling

Map RPC error codes to user-friendly messages:

```typescript
function getCommentErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('2000 characters')) {
      return 'Comments must be 2000 characters or fewer.'
    }
    if (error.message.includes('already a reply')) {
      return 'You can only reply to top-level comments.'
    }
    if (error.message.includes('expired')) {
      return 'This post is no longer accepting comments.'
    }
  }
  return 'Something went wrong. Please try again.'
}
```
