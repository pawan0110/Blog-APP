import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";

function PostCard({ $id, title, featuredImage }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (featuredImage) {
      // Use preview for homepage thumbnails
      appwriteService.getFilePreviewURL(featuredImage).then((url) => {
        setImageUrl(url);
      });
    }
  }, [featuredImage]);

  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-500 rounded-xl p-2 hover:shadow-lg transition-shadow duration-300">
        {imageUrl && (
          <div className="w-full mb-2">
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-xl" />
          </div>
        )}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
    </Link>
  );
}

export default PostCard;
