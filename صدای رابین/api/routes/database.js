const express = require('express');
const { testConnection, getEmployees, getCustomers, getSalesReport, getTasks, getProjects, getDailyReports, getFeedback, getCalendarEvents, getDocuments } = require('../services/database');
const { processUserText, detectKeywords } = require('../services/keywordDetector');
const router = express.Router();

// تست اتصال دیتابیس
router.get('/test-connection', async (req, res) => {
  try {
    const connected = await testConnection();
    res.json({
      success: connected,
      message: connected ? 'اتصال به دیتابیس موفق' : 'خطا در اتصال به دیتابیس',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// تست تشخیص کلمات کلیدی
router.post('/test-keywords', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'متن الزامی است' });
    }
    
    const keywords = detectKeywords(text);
    const processResult = await processUserText(text);
    
    res.json({
      success: true,
      inputText: text,
      keywordsDetected: keywords,
      processResult: processResult
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// دریافت همکاران
router.get('/employees', async (req, res) => {
  try {
    const employees = await getEmployees();
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// دریافت مشتریان
router.get('/customers', async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// گزارش فروش
router.get('/sales', async (req, res) => {
  try {
    const period = 'today';
    const sales = await getSalesReport(period);
    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('خطا در دریافت گزارش فروش:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت گزارش فروش'
    });
  }
});

router.get('/sales/:period', async (req, res) => {
  try {
    const period = req.params.period || 'today';
    const sales = await getSalesReport(period);
    res.json({
      success: true,
      period: period,
      data: sales,
      count: sales.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// وظایف
router.get('/tasks', async (req, res) => {
  try {
    const assignee = null;
    const tasks = await getTasks(assignee);
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('خطا در دریافت وظایف:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت وظایف'
    });
  }
});

router.get('/tasks/:assignee', async (req, res) => {
  try {
    const assignee = req.params.assignee || null;
    const tasks = await getTasks(assignee);
    res.json({
      success: true,
      assignee: assignee,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// پروژه‌ها (معاملات)
router.get('/projects', async (req, res) => {
  try {
    const projects = await getProjects();
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// گزارشات روزانه
router.get('/reports', async (req, res) => {
  try {
    const userId = null;
    const reports = await getDailyReports(userId);
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('خطا در دریافت گزارشات:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت گزارشات'
    });
  }
});

router.get('/reports/:userId', async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const reports = await getDailyReports(userId);
    res.json({
      success: true,
      userId: userId,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// بازخوردها
router.get('/feedback', async (req, res) => {
  try {
    const period = 'month';
    const feedback = await getFeedback(period);
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('خطا در دریافت بازخوردها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت بازخوردها'
    });
  }
});

router.get('/feedback/:period', async (req, res) => {
  try {
    const period = req.params.period || 'month';
    const feedback = await getFeedback(period);
    res.json({
      success: true,
      period: period,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// رویدادهای تقویم
router.get('/events', async (req, res) => {
  try {
    const period = 'week';
    const events = await getCalendarEvents(period);
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('خطا در دریافت رویدادها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت رویدادها'
    });
  }
});

router.get('/events/:period', async (req, res) => {
  try {
    const period = req.params.period || 'week';
    const events = await getCalendarEvents(period);
    res.json({
      success: true,
      period: period,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// اسناد
router.get('/documents', async (req, res) => {
  try {
    const category = null;
    const documents = await getDocuments(category);
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('خطا در دریافت اسناد:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اسناد'
    });
  }
});

router.get('/documents/:category', async (req, res) => {
  try {
    const category = req.params.category || null;
    const documents = await getDocuments(category);
    res.json({
      success: true,
      category: category,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;