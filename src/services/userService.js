import api from "../utils/api";

const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get(`/users/`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getCurrentUser = async () => {
  try {
    const response = await api.get(`/users/me/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

const updateProfile = async (profileData) => {
  // console.log("updateProfile called with:", profileData);
  try {
    // Get the current user's ID from the profile data or use "me"
    const userId = profileData.id || "me";

    // Using the correct endpoint: users/{id}
    const response = await api.patch(`/users/${userId}/`, profileData);
    // console.log("Profile update successful, response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const updatePassword = async (passwordData) => {
  // console.log("updatePassword called with:", passwordData);
  try {
    // Need to determine the user ID for the password update
    // If passwordData contains user ID, use it, otherwise try "me"
    const userId = passwordData.userId || "me";

    // Using the correct endpoint pattern: users/{id}/password/
    const response = await api.post(`/users/${userId}/password/`, passwordData);
    // console.log("Password update successful");
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  updateProfile,
  updatePassword,
  deleteUser,
};
