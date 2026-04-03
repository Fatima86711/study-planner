import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/courses';

// Token header banane ke liye helper function
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Add new course
const addCourse = async (courseData) => {
  try {
    const response = await axios.post(API_URL, courseData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get all courses
const getCourses = async () => {
  try {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update a course
const updateCourse = async (id, courseData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, courseData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete a course
const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const courseService = { addCourse, getCourses, updateCourse, deleteCourse };

export default courseService;