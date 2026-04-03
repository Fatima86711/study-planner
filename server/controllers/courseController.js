const Course = require('../models/Course');

// @desc    Add new course
// @route   POST /api/courses
// @access  Private
const addCourse = async (req, res) => {
  try {
    const { name, subject, color, description } = req.body;

    // Check karo ke course already exist toh nahi karta
    const courseExists = await Course.findOne({ 
      user: req.user.id, 
      name: name.trim() 
    });

    if (courseExists) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    const course = await Course.create({
      user: req.user.id,
      name,
      subject,
      color,
      description,
    });

    res.status(201).json(course);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all courses of logged in user
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      user: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json(courses);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    // Course exist karta hai?
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Yeh course is user ka hai?
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedCourse);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    // Course exist karta hai?
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Yeh course is user ka hai?
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Soft delete — permanently nahi hatayenge
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({ message: 'Course deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { addCourse, getCourses, updateCourse, deleteCourse };