function ComplaintImage({ complaint, className = "h-32 w-full", alt }) {
  const image = complaint?.images?.[0];

  if (!image?.url) return null;

  return (
    <img
      src={image.url}
      alt={alt || `Evidence for ${complaint.title}`}
      loading="lazy"
      className={`${className} bg-slate-100 object-cover`}
    />
  );
}

export default ComplaintImage;
