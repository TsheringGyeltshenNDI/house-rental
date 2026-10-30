// Shrinks a photo in the browser before uploading, so a 5 MB phone photo
// becomes roughly 200-400 KB. Saves storage and loads faster on mobile data.
export async function compressImage(file, maxSize = 1600, quality = 0.8) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not read image"))),
      "image/jpeg",
      quality
    );
  });
}
