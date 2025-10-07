import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import authService from "../../appwrite/auth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.userData);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load user if Redux is empty
  useEffect(() => {
    const fetchUser = async () => {
      if (!reduxUser) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(reduxUser);
      }
    };
    fetchUser();
  }, [reduxUser]);

  // ✅ Slug generator
  const slugTransform = useCallback((value) => {
    if (!value) return "";
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z\d\s]+/g, "-")
      .replace(/\s+/g, "-");
  }, []);

  // ✅ Auto-update slug when title changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // ✅ Submit handler
  const submit = async (data) => {
    setLoading(true);
    setError("");

    try {
      if (!currentUser) {
        setError("User not logged in.");
        return;
      }

      let fileId = post?.featuredImage;

      // Upload new image if selected
      if (data.image && data.image[0]) {
        const file = await appwriteService.uploadFile(data.image[0]);
        if (file) {
          if (post?.featuredImage) {
            await appwriteService.deleteFile(post.featuredImage);
          }
          fileId = file.$id;
        }
      }

      if (post) {
        // Update existing post
        const updated = await appwriteService.updatePost(post.$id, {
          title: data.title,
          content: data.content,
          status: data.status,
          featuredImage: fileId,
        });
        if (updated) navigate(`/post/${updated.$id}`);
      } else {
        // Create new post
        const created = await appwriteService.createPost({
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status,
          userId: currentUser.$id,
          featuredImage: fileId,
        });
        if (created) navigate(`/post/${created.$id}`);
      }
    } catch (err) {
      console.error("Post submit error:", err);
      setError("Something went wrong while saving your post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      {/* Left Section */}
      <div className="w-2/3 px-2">
        <Input
          label="Title"
          placeholder="Enter title"
          className="mb-4"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

        <Input
          label="Slug"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", {
            required: "Slug is required",
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Slug must contain lowercase letters, numbers, or hyphens only",
            },
          })}
          onInput={(e) => setValue("slug", slugTransform(e.target.value))}
        />
        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}

        <RTE
          label="Content"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      {/* Right Section */}
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post?.featuredImage && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFileURL(post.featuredImage)}
              alt={post.title}
              className="rounded-lg w-full"
            />
          </div>
        )}

        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: "Status is required" })}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {loading
            ? "Saving..."
            : post
            ? "Update Post"
            : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
