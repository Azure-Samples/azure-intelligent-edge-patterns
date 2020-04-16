import React from 'react';

export const UploadPhotos = ({ partId }): JSX.Element => {
  return (
    <input
      type="file"
      onChange={(e): void => {
        handleUpload(e, partId);
      }}
      accept="image/*"
      multiple
    />
  );
};

async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, partId: number): Promise<void> {
  const requests: Promise<Response>[] = [];
  for (let i = 0; i < e.target.files.length; i++) {
    const formData = new FormData();
    formData.append('image', e.target.files[i]);
    requests.push(
      fetch(`/api/images/?part_id=${partId}/`, {
        method: 'POST',
        body: formData,
      }),
    );
  }

  try {
    const result = await Promise.all(requests);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
