import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import eventService from "../services/eventService";

const EventGalleryManager = ({ eventId }) => {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch gallery images when component mounts
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEventGallery(eventId);
        setGallery(data);
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setError(t("errorFetchingGallery"));
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [eventId, t]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Reset the form
  const resetForm = () => {
    setImageFile(null);
    setCaption("");
    setPreviewUrl(null);
    setError(null);
  };

  // Handle image upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError(t("pleaseSelectImage"));
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedImage = await eventService.uploadGalleryImage(
        eventId,
        imageFile,
        caption
      );

      // Update gallery with the new image
      setGallery([...gallery, uploadedImage]);
      resetForm();
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(t("errorUploadingImage"));
    } finally {
      setUploadingImage(false);
    }
  };

  // Open image in lightbox/modal
  const openImage = (image) => {
    setSelectedImage(image);
  };

  // Close lightbox/modal
  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">{t("eventGallery")}</h2>

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      ) : (
        <>
          {/* Image Upload Form */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t("addToGallery")}</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("image")} *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">{t("preview")}</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-xs h-auto rounded-md"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("caption")}
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("optionalCaption")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploadingImage || !imageFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {uploadingImage ? t("uploading") : t("upload")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>

          {/* Gallery Display */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {t("currentGallery")}
            </h3>
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
              <div className="text-gray-500 italic mb-6">
                {t("noGalleryImages")}
              </div>
            )}
          </div>
        </>
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

EventGalleryManager.propTypes = {
  eventId: PropTypes.string.isRequired,
};

export default EventGalleryManager;
