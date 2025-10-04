import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appWriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSumbit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    if (post) {
      const file = data.image[0]
        ? await appWriteService.uploadFile(data.image[0])
        : null;

      if (file) {
        appWriteService.deleteFile(post.featuredImage);
      }

      const dbPost = await appWriteService.updatePost(post.$id, {
        ...data,
        featureImage: file ? file / $id : undefined,
      });
      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } else {
      const file = await appWriteService.uploadFile(data.image[0]);

      if (file) {
        const field = file.$id;
        data.featureImage = fileId;
        const dbPost = await appWriteService.createPost({
          ...data,
          userId: userData.$id,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    }
  };
}

const slugTransForm = useCallback((value) => {
  if (value && typeof value === "string")
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z\d\s]+/g, "-")
      .replace(/\s/g, "-");
  return "";
});

React.useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name === "title") {
      setValue("slug", slugTransForm(value.title), { shouldValidate: true });
    }
  });
  return () => subscription.unsubcribe();
}, [watch, slugTransForm, setValue]);

return (
  <form onSubmit={handleSumbit(submit)} className="flex flex-wrap">
    <div className="w-2/3 px-2">
      <Input
        label="Title :"
        placeholder="Title"
        className="mb-4"
        {...register("title, { required : true }")}
        onInput={(e) => {
          setValue("slug", slugTransForm(e.currrentTarget.value), {
            shouldValidate: true,
          });
        }}
      />
      <RTE
        label="content :"
        name="content"
        control={control}
        defaultValue={getValues("content")}
      />
    </div>
    <div className="w-1/3 px-2">
      <Input
        label="Featured Image :"
        type="file"
        className="mb-4"
        accept="image/png, image/jpg, image/jpeg, image/gif"
        {...register("image", { required: !post })}
      />
      {post && (
        <div className="w-full mb-4">
          <img
            src={appWriteService.getFilePreview(post.featureImage)}
            alt={post.title}
            className="rounded-lg"
          />
        </div>
      )}
      <Select
        options={["active", "inactive"]}
        label="status"
        className="mb-4"
        {...register("status", { required: true })}
      />
      <Button
        type="submit"
        bgcolor={post ? "bg-green-500" : undefined}
        className="w-full"
      >
        {post ? "update" : "Submit"}
      </Button>
    </div>
  </form>
);
