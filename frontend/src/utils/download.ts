/**
 * Helper to force a true browser file download for local/remote cross-origin images.
 * Fetches the image as a Blob to bypass browser cross-origin download restrictions.
 */
export const triggerImageDownload = async (imageUrl: string, fileName: string = 'ai-room-redesign.png') => {
  if (!imageUrl) return;

  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
      ? fileName
      : `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    // Canvas fallback for CORS-restricted images
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            } else {
              window.open(imageUrl, '_blank');
            }
          }, 'image/png');
        } else {
          window.open(imageUrl, '_blank');
        }
      };
      img.onerror = () => window.open(imageUrl, '_blank');
      img.src = imageUrl;
    } catch {
      window.open(imageUrl, '_blank');
    }
  }
};
