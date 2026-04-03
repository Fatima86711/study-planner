const express = require('express');
const router = express.Router();
const {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');

// All routes are protected — login hona zaroori hai
router.route('/')
  .get(protect, getCourses)    // GET  /api/courses
  .post(protect, addCourse);   // POST /api/courses

router.route('/:id')
  .put(protect, updateCourse)      // PUT    /api/courses/:id
  .delete(protect, deleteCourse);  // DELETE /api/courses/:id

module.exports = router;