import api from "../utils/api";

const getAllFaculties = async () => {
  try {
    const response = await api.get(`/faculties/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching faculties:", error);
    throw error;
  }
};

const getFacultyById = async (id) => {
  try {
    const response = await api.get(`/faculties/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching faculty with ID ${id}:`, error);
    throw error;
  }
};

const createFaculty = async (facultyData) => {
  try {
    const response = await api.post(`/faculties/`, facultyData);
    return response.data;
  } catch (error) {
    console.error("Error creating faculty:", error);
    throw error;
  }
};

const updateFaculty = async (id, facultyData) => {
  try {
    const response = await api.patch(`/faculties/${id}/`, facultyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating faculty with ID ${id}:`, error);
    throw error;
  }
};

const deleteFaculty = async (id) => {
  try {
    await api.delete(`/faculties/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting faculty with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
