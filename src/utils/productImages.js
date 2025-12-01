import { API_URL } from '../services/api';

// Placeholder image for when no product image is available
const defaultPlaceholder = 'https://placehold.co/600x400?text=No+Image';

/**
 * Helper function to construct the full image URL from the API response.
 * Handles both relative paths (from Django ImageField) and full URLs.
 * 
 * @param {string} imagePath - The image path or URL from the API
 * @returns {string} The full usable image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultPlaceholder;

    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a relative path, prepend the API URL
    // Ensure we don't end up with double slashes if API_URL ends with / and imagePath starts with /
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}${path}`;
};

/**
 * Helper function to extract the primary image URL from a product object.
 * Follows the priority:
 * 1. product.images.find(img => img.is_primary).image
 * 2. product.primary_image
 * 3. product.image
 * 4. First image in product.images
 * 
 * @param {object} product - The product object from the API
 * @returns {string} The full usable image URL
 */
export const getProductPrimaryImage = (product) => {
    if (!product) return defaultPlaceholder;

    let imagePath = null;

    // 1. Try to find primary image in images array
    if (Array.isArray(product.images)) {
        const primaryImg = product.images.find(img => img.is_primary);
        if (primaryImg) {
            imagePath = primaryImg.image;
        } else if (product.images.length > 0) {
            // Fallback to first image if no primary is marked
            imagePath = product.images[0].image;
        }
    }

    // 2. Fallback to direct properties if no image found in array
    if (!imagePath) {
        imagePath = product.primary_image || product.image;
    }

    const finalUrl = getImageUrl(imagePath);
    // Stringify to ensure we see the content in the user's pasted logs
    console.log('🖼️ Product Image Debug:', JSON.stringify({
        name: product.name || product.nombre,
        images: product.images,
        primary_image: product.primary_image,
        image: product.image,
        selectedPath: imagePath,
        finalUrl: finalUrl
    }, null, 2));

    return finalUrl;
};

// Deprecated: kept for backward compatibility during refactor, but now just returns the placeholder
// or tries to construct a URL if a slug is passed that happens to match a file path (unlikely now)
export const getProductImage = (slug) => {
    return defaultPlaceholder;
};

export default getImageUrl;
