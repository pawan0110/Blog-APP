import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Container, Button } from "../components";
import parse from "html-react-parser";

export default function Post() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const userData = useSelector((state) => state.auth.userData);

  // Check if the current user is the author
  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((data) => {
        if (data) setPost(data);
        else navigate("/"); // redirect if post not found
      });
    } else navigate("/");
  }, [slug, navigate]);

  const deletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const deleted = await appwriteService.deletePost(post.$id || post.slug);

      if (deleted && post.featuredImage) {
        await appwriteService.deleteFile(post.featuredImage);
      }
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  if (!post) return null;

  return (
    <div className="w-full py-8 flex-grow">
      <Container>
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="w-full mb-6 relative">
            <img
              src={appwriteService.getFileURL(post.featuredImage)}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl shadow-md"
            />

            {/* Edit/Delete buttons */}
            {isAuthor && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button bgColor="bg-green-500">Edit</Button>
                </Link>
                <Button bgColor="bg-red-500" onClick={deletePost}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>

        {/* Content */}
        <div className="prose max-w-none">{parse(post.content)}</div>
      </Container>
    </div>
  );
}
