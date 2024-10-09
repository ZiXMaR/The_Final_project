const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // ประกาศเพียงครั้งเดียว
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set up database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'project',
    port: 8889
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // ใช้สำหรับรับข้อมูลจากฟอร์ม HTML

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the Organizer page
app.get('/organizer', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizer.html'));
});

// Serve the OrganizerEdit page
app.get('/organizerEdit', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizerEdit.html'));
});

// Serve the OrganizerDelet page
app.get('/organizerDelet', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizerDelet.html'));
});

// Serve the OrganizerHome page
app.get('/organizerHome', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizerHome.html'));
});


// Serve the Participant page
app.get('/participant', (req, res) => {
    res.sendFile(path.join(__dirname, 'participant.html'));
});

// Serve the Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

//  Route สำหรับเพิ่มกิจกรรม (Organizer)
app.post('/add-activity', (req, res) => {
    const activity = req.body;

    const sql = `INSERT INTO activity (
        Activityid, ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime, 
        OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline, SemesterAcademicYear, AcademicYear, 
        Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        activity.Activityid, activity.ActivityCategoryID, activity.ActivityTypeID, activity.ActivityName, activity.ActivityDate, 
        activity.DailyID, activity.ActivityHours, activity.StartTime, activity.EndTime, activity.OrganizationName, activity.EventLocation, 
        activity.NumberOfApplications, activity.ApplicationChannel, activity.ApplicationDeadline, activity.SemesterAcademicYear, 
        activity.AcademicYear, activity.Department, activity.Major, activity.ActivityDescription, activity.ApproveActivity, activity.ActivityEndDate
    ];

    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting activity:', error);
            res.status(500).send('Error inserting activity: ' + error.message); // แสดงรายละเอียดข้อผิดพลาด
            return;
        }
        res.status(200).send('Activity added successfully');
    });
});

// Route สำหรับแก้ไขกิจกรรม (Organizer)
app.post('/edit-activity', (req, res) => {
    const activity = req.body;
    
    const sql = `UPDATE activity SET 
        ActivityCategoryID = ?, ActivityTypeID = ?, ActivityName = ?, ActivityDate = ?, DailyID = ?, 
        ActivityHours = ?, StartTime = ?, EndTime = ?, OrganizationName = ?, EventLocation = ?, 
        NumberOfApplications = ?, ApplicationChannel = ?, ApplicationDeadline = ?, SemesterAcademicYear = ?, 
        AcademicYear = ?, Department = ?, Major = ?, ActivityDescription = ?, ApproveActivity = ?, ActivityEndDate = ?
        WHERE Activityid = ?`;  // ระบุเงื่อนไข WHERE ด้วย Activityid

    const values = [
        activity.ActivityCategoryID, activity.ActivityTypeID, activity.ActivityName, activity.ActivityDate, activity.DailyID,
        activity.ActivityHours, activity.StartTime, activity.EndTime, activity.OrganizationName, activity.EventLocation,
        activity.NumberOfApplications, activity.ApplicationChannel, activity.ApplicationDeadline, activity.SemesterAcademicYear,
        activity.AcademicYear, activity.Department, activity.Major, activity.ActivityDescription, activity.ApproveActivity, activity.ActivityEndDate,
        activity.Activityid // Activityid จะถูกใช้เพื่อระบุว่าต้องแก้ไขกิจกรรมใด
    ];

    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating activity:', error);
            res.status(500).send('Error updating activity: ' + error.message);
            return;
        }
        res.status(200).send('Activity updated successfully');
    });
});

// API สำหรับดึงข้อมูลกิจกรรม
app.get('/activities', (req, res) => {
    const sql = 'SELECT * FROM activity';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching activities:', error);
            res.status(500).send('Error fetching activities: ' + error.message);
            return;
        }
        res.json(results);
    });
});

// API สำหรับลบกิจกรรม
app.post('/delete-activity', (req, res) => {
    const { Activityid } = req.body;
    const sql = 'DELETE FROM activity WHERE Activityid = ?';
    
    pool.query(sql, [Activityid], (error, results) => {
        if (error) {
            console.error('Error deleting activity:', error);
            res.status(500).send('Error deleting activity: ' + error.message);
            return;
        }
        res.status(200).send('Activity deleted successfully');
    });
});

//---------------------------------------------------------------------------------------


app.get('/recommend-activities', (req, res) => {
    const { day, type, category } = req.query;

    let sql = 'SELECT * FROM activity WHERE ApproveActivity = "Y"';
    let params = [];

    if (day) {
        const dayArray = day.split(',');
        sql += ' AND DailyID IN (SELECT DailyID FROM dailyid WHERE `Daily Name` IN (?))';
        params.push(dayArray);
    }

    if (type) {
        const typeArray = type.split(',');
        sql += ' AND ActivityTypeID IN (?)';
        params.push(typeArray);
    }

    if (category) {
        const categoryArray = category.split(',');
        sql += ' AND ActivityCategoryID IN (?)';
        params.push(categoryArray);
    }

    pool.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error fetching activities:', error);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});


// Route สำหรับดึงวันที่ของกิจกรรมที่มีอยู่
app.get('/get-dates', (req, res) => {
    const sql = 'SELECT DISTINCT ActivityDate FROM activity';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching dates:', error);
            res.status(500).send('Server error');
            return;
        }
        const dates = results.map(row => row.ActivityDate);
        res.json(dates);
    });
});

// Route สำหรับดึงประเภทกิจกรรม
app.get('/get-types', (req, res) => {
    const sql = 'SELECT * FROM activitytype';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching types:', error);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

// Route สำหรับดึงหมวดหมู่กิจกรรม
app.get('/get-categories', (req, res) => {
    const sql = 'SELECT * FROM activitycategory';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching categories:', error);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

// Route สำหรับดึงวันของกิจกรรมที่มีอยู่
app.get('/get-activity-days', (req, res) => {
    const sql = 'SELECT DISTINCT DAYNAME(ActivityDate) as dayName FROM activity WHERE ApproveActivity = "Y"';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching days:', error);
            res.status(500).send('Server error');
            return;
        }
        const days = results.map(row => row.dayName);
        res.json(days);
    });
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
