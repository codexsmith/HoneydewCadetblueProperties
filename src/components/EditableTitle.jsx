import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Input, Button, Text } from "@chakra-ui/react";

function EditableTitle({ title, onSubmit, onCancel }) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: title,
    },
  });

  const submitTitle = (data) => {
    onSubmit(data.title);
  };

  return (
    <form onSubmit={handleSubmit(submitTitle)}>
      <Input {...register("title")} autoFocus />
      <Button type="submit" isLoading={isSubmitting}>
        Save
      </Button>
      <Button onClick={() => onCancel()} variant="ghost">
        Cancel
      </Button>
    </form>
  );
}

export default EditableTitle;
