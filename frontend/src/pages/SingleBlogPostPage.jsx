// src/pages/SingleBlogPostPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './SingleBlogPostPage.css';

// --- Reusable CommentForm Component ---
const CommentForm = ({ postId, onCommentPosted }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError('');
        try {
            // API call to the new endpoint for creating a comment
            await apiClient.post('/comments', { postId, content });
            setContent('');
            onCommentPosted(); // Tell the parent component to refresh the comment list
        } catch (err) {
            setError('Failed to post comment. Please try again.');
            console.error('Failed to post comment', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <h4>Leave a Comment</h4>
            <textarea
                rows="4"
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
};


// --- Main Page Component ---
const SingleBlogPostPage = () => {
  const { id: postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Using useCallback to memoize the fetch function
  const fetchPostAndComments = useCallback(async () => {
    // We only want the full page loader on the initial load.
    if (!post) setLoading(true); 
    
    try {
      const postPromise = apiClient.get(`/blog/${postId}`);
      const commentsPromise = apiClient.get(`/comments/post/${postId}`);
      
      const [postResponse, commentsResponse] = await Promise.all([postPromise, commentsPromise]);

      setPost(postResponse.data.blogPost);
      setComments(commentsResponse.data.comments);
    } catch (err) {
      setError('Failed to load the blog post. It may have been removed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId, post]); // Dependency 'post' is used for the loading logic

  useEffect(() => {
    if (postId) {
        fetchPostAndComments();
    }
  }, [postId, fetchPostAndComments]); // Run effect when postId changes

  if (loading) {
    return (
      <div className="loading-container container section">
        <div className="spinner"></div>
        <h2>Loading Post...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="container section text-center"><p className="error-message">{error}</p></div>;
  }
  
  if (!post) {
    return <div className="container section text-center"><h2>Post not found.</h2></div>;
  }

  return (
    <div className="single-blog-page section">
      <div className="container">
        <article className="blog-post-content">
          <header className="blog-post-header">
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              {post.artist && (
                <span>By <Link to={`/artists/${post.artist.user_id}`}>{post.artist.username}</Link></span>
              )}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <img src={post.featured_image_url} alt={post.title} className="featured-image" />
          </header>
          
          <div className="post-body">
            {/* Split content by newlines to render paragraphs */}
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>

        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>
          {user ? (
            <CommentForm postId={postId} onCommentPosted={fetchPostAndComments} />
          ) : (
            <p className="text-center">
              Please <Link to="/login" style={{textDecoration: 'underline'}}>log in</Link> to leave a comment.
            </p>
          )}

          <div className="comments-list">
            {comments.length > 0 ? (
                comments.map(comment => (
                    <div key={comment.comment_id} className="comment-card">
                        <p className="comment-content">{comment.content}</p>
                        {comment.user && <p className="comment-author">- {comment.user.username}</p>}
                    </div>
                ))
            ) : (
                <p className="text-center">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SingleBlogPostPage;