// components/ProductImage.tsx

import React, { useState } from "react";

interface ProductImageProps {
  url: string | null | undefined;
  alt?: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ url, alt, className }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    // Show black placeholder if no URL or image failed to load
    return (
      <div
        className={`${className} bg-black`}
        style={{ width: "100%", height: "12rem" /* adjust height as needed */ }}
        aria-label="Image not available"
      />
    );
  }

  return (
    <img
      src={`/api/file?url=${encodeURIComponent(url)}`}
      alt={alt || "Product image"}
      className={className}
      onError={() => setError(true)}
      style={{ objectFit: "contain", width: "100%", height: "12rem" }}
    />
  );
};

export default ProductImage;
