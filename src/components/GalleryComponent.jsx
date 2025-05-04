import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const GalleryComponent = ({ gallery }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  // Open image in lightbox/modal
  const openImage = (image) => {
    setSelectedImage(image);
  };

  // Close lightbox/modal
  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{t("eventGallery")}</h2>

      {/* Gallery Display */}
      {gallery && gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-lg shadow-md"
            >
              <img
                src={image.image}
                alt={image.caption || "Event image"}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImage(image)}
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm truncate">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic mb-6">{t("noGalleryImages")}</div>
      )}

      {/* Lightbox/Modal for selected image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeImage}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.image}
              alt={selectedImage.caption || "Event image"}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.caption && (
              <div className="text-white p-2 mt-2 text-center">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

GalleryComponent.propTypes = {
  gallery: PropTypes.array.isRequired,
};

export default GalleryComponent;
