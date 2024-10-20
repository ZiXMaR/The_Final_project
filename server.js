const express = require('express');
const path = require('path');
// const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const session = require('express-session');
const bcrypt = require('bcrypt'); // ใช้สำหรับการ hash password
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey);
const mysql = require('mysql2/promise'); // เปลี่ยนมาใช้ promise version ของ mysql2

const cors = require('cors');

app.use(express.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true when using HTTPS
}));

// // Set up database connection
// const pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'project_3',
//     port: 8889
// });

// Set up database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'demo_project1',
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to MySQL database');
        connection.release(); // ปล่อยการเชื่อมต่อ
    }
});

//---------------------------------------------------

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // ใช้สำหรับรับข้อมูลจากฟอร์ม HTML


//---------------------------------------------------


// Add session middleware
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true when using https
}));

//---------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'))); // โฟลเดอร์ที่เก็บไฟล์ static

//---------------------------------------------------

// เส้นทางสำหรับเสิร์ฟไฟล์ HTML ที่ต้องการใช้ organizationName ใน URL
app.get('/organizerEditHome/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ส่งไฟล์ HTML โดยตรงจากโฟลเดอร์ public
    res.sendFile(path.join(__dirname, 'public', 'organizerEditHome.html'));
});

// เส้นทางสำหรับเสิร์ฟไฟล์ HTML ที่ต้องการใช้ organizationName ใน URL
app.get('/organizerEdit/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ส่งไฟล์ HTML โดยตรงจากโฟลเดอร์ public
    res.sendFile(path.join(__dirname, 'public', 'organizerEdit.html'));
});

//----------------------------------------------------

app.get('/organizerEditHome-W/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ส่งไฟล์ HTML โดยตรงจากโฟลเดอร์ public
    res.sendFile(path.join(__dirname, 'public', 'organizerEditHome-W.html'));
});

app.get('/organizerEditHome-Y/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ส่งไฟล์ HTML โดยตรงจากโฟลเดอร์ public
    res.sendFile(path.join(__dirname, 'public', 'organizerEditHome-Y.html'));
});

app.get('/organizerEditHome-N/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ส่งไฟล์ HTML โดยตรงจากโฟลเดอร์ public
    res.sendFile(path.join(__dirname, 'public', 'organizerEditHome-N.html'));
});

//----------------------------------------------------


// Serve the main page
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the Organizer page
app.get('/organizer/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    res.sendFile(path.join(__dirname, 'organizer.html'));
});

//-----------------------------------------------------------------------------------

// Serve the OrganizerSingleAdd page
app.get('/organizerSingleAdd/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    res.sendFile(path.join(__dirname, 'organizerSingleAdd.html'));
});

// Serve the OrganizerMultiAdd page
app.get('/organizerMultiAdd/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    res.sendFile(path.join(__dirname, 'organizerMultiAdd.html'));
});

//-----------------------------------------------------------------------------------


// Serve the adminMultiAdd page
app.get('/adminMultiAdd', (req, res) => {
    res.sendFile(path.join(__dirname, 'adminMultiAdd.html'));
});

// Serve the adminSingleAdd page
app.get('/adminSingleAdd', (req, res) => {
    res.sendFile(path.join(__dirname, 'adminSingleAdd.html'));
});

//------------------------------------------------------------------------------------

// Serve the OrganizerDelet page
app.get('/organizerDelet/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    res.sendFile(path.join(__dirname, 'organizerDelet.html'));
});

// Serve the OrganizerHome page
app.get('/organizerHome/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    // ทำสิ่งที่คุณต้องการที่นี่ เช่น render หน้า HTML หรือส่งข้อมูล JSON
    res.sendFile(path.join(__dirname, 'organizerHome.html'));
});

//------------------------------------------------------------------

// Serve the admin page
app.get('/adminAdd', (req, res) => {
    res.sendFile(path.join(__dirname, 'adminAdd.html'));
});

// Serve the adminaDelet page
app.get('/adminDelet', (req, res) => {
    res.sendFile(path.join(__dirname, 'adminDelet.html'));
});

// Serve the admina page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

//----------------------------------------------------

// Serve the Participant page
app.get('/participant', (req, res) => {
    res.sendFile(path.join(__dirname, 'participant.html'));
});

//----------------------------------------------------


// ฟังก์ชันสร้าง ActivityID อัตโนมัติ
async function generateActivityId() {
    try {
        const sql = 'SELECT Activityid FROM activity ORDER BY Activityid DESC LIMIT 1';
        const [results] = await pool.query(sql);

        let newId = 'AID001'; // ค่าเริ่มต้น
        if (results.length > 0) {
            const lastId = results[0].Activityid;
            const lastNumber = parseInt(lastId.replace('AID', '')); // แปลงเลขจาก Activityid
            const newNumber = lastNumber + 1;
            newId = `AID${String(newNumber).padStart(3, '0')}`; // สร้าง ID ใหม่
        }

        return newId;
    } catch (error) {
        console.error('Error generating Activity ID:', error);
        throw error; // โยนข้อผิดพลาดออกไป
    }
}


// ฟังก์ชันเพื่อคำนวณวันในช่วงวันที่
function getDaysInRange(start, end) {
    const days = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1); // รวมวันสิ้นสุดด้วย

    while (startDate < endDate) {
        days.push(startDate.getDay()); // 'getDay()' คืนค่า 0 (อาทิตย์) ถึง 6 (เสาร์)
        startDate.setDate(startDate.getDate() + 1);
    }
    return days;
}

// ฟังก์ชันเพื่อแมพวันไปยัง DailyID
function mapDaysToDailyID(days) {
    const mapping = {
        'DID01': [1],
        'DID02': [2],
        'DID03': [3],
        'DID04': [4],
        'DID05': [5],
        'DID06': [6],
        'DID07': [0],
        'DID08': [1, 2],
        'DID09': [2, 3],
        'DID10': [3, 4],
        'DID11': [4, 5],
        'DID12': [5, 6],
        'DID13': [6, 0],
        'DID14': [0, 1],
        'DID15': [1, 2, 3],
        'DID16': [2, 3, 4],
        'DID17': [3, 4, 5],
        'DID18': [4, 5, 6],
        'DID19': [5, 6, 0],
        'DID20': [6, 0, 1],
        'DID21': [0, 1, 2],
        'DID22': [1, 2, 3, 4],
        'DID23': [2, 3, 4, 5],
        'DID24': [3, 4, 5, 6],
        'DID25': [4, 5, 6, 0],
        'DID26': [5, 6, 0, 1],
        'DID27': [6, 0, 1, 2],
        'DID28': [0, 1, 2, 3],
        'DID29': [1, 2, 3, 4, 5],
        'DID30': [2, 3, 4, 5, 6],
        'DID31': [3, 4, 5, 6, 0],
        'DID32': [4, 5, 6, 0, 1],
        'DID33': [5, 6, 0, 1, 2],
        'DID34': [6, 0, 1, 2, 3],
        'DID35': [0, 1, 2, 3, 4],
        'DID36': [1, 2, 3, 4, 5, 6],
        'DID37': [2, 3, 4, 5, 6, 0],
        'DID38': [3, 4, 5, 6, 0, 1],
        'DID39': [4, 5, 6, 0, 1, 2],
        'DID40': [5, 6, 0, 1, 2, 3],
        'DID41': [6, 0, 1, 2, 3, 4],
        'DID42': [0, 1, 2, 3, 4, 5],
        'DID43': [0, 1, 2, 3, 4, 5, 6],
    };

    const resultIDs = [];
    for (const [id, daysArray] of Object.entries(mapping)) {
        if (daysArray.every(day => days.includes(day))) {
            resultIDs.push(id);
        }
    }

    return resultIDs;
}

// Route ใหม่สำหรับคำนวณ DailyID
app.post('/calculate-daily-ids', (req, res) => {
    const { ActivityDate, ActivityEndDate } = req.body;

    // คำนวณวันในช่วงวันที่
    const daysInRange = getDaysInRange(ActivityDate, ActivityEndDate);

    // แมพวันไปยัง DailyID
    const dailyIDs = mapDaysToDailyID(daysInRange);

    // ส่ง DailyID กลับเป็น JSON
    res.json({ dailyIDs });
});


//  Route สำหรับเพิ่มกิจกรรม (Organizer)
app.post('/add-activity', async (req, res) => {
    try {
        const activity = req.body;

        // เรียกใช้ฟังก์ชันเพื่อสร้าง ActivityID ใหม่
        activity.Activityid = await generateActivityId();

        const sql = `INSERT INTO activity (
            Activityid, ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime, 
            OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline, SemesterAcademicYear, AcademicYear, 
            Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate, StartTimeLastDay , EndTimeLastDay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            activity.Activityid, activity.ActivityCategoryID, activity.ActivityTypeID, activity.ActivityName, activity.ActivityDate,
            activity.DailyID, activity.ActivityHours, activity.StartTime, activity.EndTime, activity.OrganizationName, activity.EventLocation,
            activity.NumberOfApplications, activity.ApplicationChannel, activity.ApplicationDeadline, activity.SemesterAcademicYear,
            activity.AcademicYear, activity.Department, activity.Major, activity.ActivityDescription, activity.ApproveActivity, activity.ActivityEndDate,
            activity.StartTimeLastDay, activity.EndTimeLastDay
        ];

        // ใช้ await ในการ query ข้อมูล
        await pool.query(sql, values);

        res.status(200).send('Activity added successfully with ID: ' + activity.Activityid);
    } catch (error) {
        console.error('Error inserting activity:', error);
        res.status(500).send('Error inserting activity: ' + error.message);
    }
});

//----------------------------------------------

// ดึงข้อมูลกิจกรรมทั้งหมด
app.get('/api/activities', async (req, res) => {
    const sql = 'SELECT * FROM activity';
    try {
        const [result] = await pool.query(sql);
        console.log(result); // ตรวจสอบข้อมูลที่ดึงมา
        res.json(result); // ส่งข้อมูลกลับในรูปแบบ JSON
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).send('Error fetching activity: ' + err.message);
    }
});

// ดึงข้อมูลกิจกรรมตาม Activityid
app.get('/api/activities/:Activityid', async (req, res) => {
    const { Activityid } = req.params;
    try {
        const [result] = await pool.query('SELECT * FROM activity WHERE Activityid = ?', [Activityid]);
        if (result.length === 0) {
            return res.status(404).send('Activity not found');
        }
        res.json(result[0]); // ส่งข้อมูลกิจกรรมที่ตรงตาม Activityid
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).send('Error fetching activity: ' + err.message);
    }
});

// อัปเดตข้อมูลกิจกรรม
app.put('/api/activities/:Activityid', async (req, res) => {
    const activityId = req.params.Activityid;
    const { ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime,
        OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline,
        SemesterAcademicYear, AcademicYear, Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate, StartTimeLastDay, EndTimeLastDay, FixActivity
    } = req.body;

    // ตัวอย่าง SQL query เพื่ออัปเดตข้อมูล
    const sql = `
        UPDATE activity SET 
            ActivityCategoryID = ?, ActivityTypeID = ?, ActivityName = ?, ActivityDate = ?, DailyID = ?, ActivityHours = ?, 
            StartTime = ?, EndTime = ?, OrganizationName = ?, EventLocation = ?, NumberOfApplications = ?, 
            ApplicationChannel = ?, ApplicationDeadline = ?, SemesterAcademicYear = ?, AcademicYear = ?, 
            Department = ?, Major = ?, ActivityDescription = ?, ApproveActivity = ?, ActivityEndDate = ?, StartTimeLastDay = ?, EndTimeLastDay = ?, FixActivity = ?
        WHERE Activityid = ?`;

    try {
        // ใช้ await ในการ query ข้อมูล
        const [result] = await pool.query(sql, [
            ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime,
            OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline,
            SemesterAcademicYear, AcademicYear, Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate, StartTimeLastDay, EndTimeLastDay, FixActivity,
            activityId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'ไม่พบกิจกรรมที่ต้องการอัปเดต' });
        }

        // ส่ง response สำเร็จกลับไปยัง client
        res.status(200).json({ message: 'อัปเดตสำเร็จ!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});


//-----------------------------------------------------------------------

// แอดมิน แก้ไข รออนุมัติ
app.get('/api/activities-a-w', async (req, res) => {
    const sql = 'SELECT * FROM activity WHERE ApproveActivity = "รออนุมัติ"';
    try {
        const [result] = await pool.query(sql);
        console.log(result); // ตรวจสอบข้อมูลที่ดึงมา
        res.json(result); // ส่งข้อมูลกลับในรูปแบบ JSON
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).send('Error fetching activity: ' + err.message);
    }
});


// แอดมิน แก้ไข อนุมัติ
app.get('/api/activities-a-y', async (req, res) => {
    const sql = 'SELECT * FROM activity WHERE ApproveActivity = "Y"';
    try {
        const [result] = await pool.query(sql);
        console.log(result); // ตรวจสอบข้อมูลที่ดึงมา
        res.json(result); // ส่งข้อมูลกลับในรูปแบบ JSON
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).send('Error fetching activity: ' + err.message);
    }
});


// แอดมิน แก้ไข ไม่อนุมัติ
app.get('/api/activities-a-n', async (req, res) => {
    const sql = 'SELECT * FROM activity WHERE ApproveActivity = "N"';
    try {
        const [result] = await pool.query(sql);
        console.log(result); // ตรวจสอบข้อมูลที่ดึงมา
        res.json(result); // ส่งข้อมูลกลับในรูปแบบ JSON
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).send('Error fetching activity: ' + err.message);
    }
});

//-----------------------------------------------------------------------


// ลบกิจกรรม ผู้จัด ล็อกอิน
app.get('/activities-d', async (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ?';
        try {
            const [results] = await pool.query(query, [organizationName]);
            res.json(results); // ส่งผลลัพธ์กิจกรรมกลับไป
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
    } else {
        res.status(400).send('Missing organizationName');
    }
});

// แก้ไขกิจกรรม ผู้จัด ล็อกอิน
app.get('/api/activities-e', async (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ?';
        try {
            const [results] = await pool.query(query, [organizationName]);
            res.json(results); // ส่งผลลัพธ์กิจกรรมเฉพาะ organizationName ที่ตรงกันกลับไป
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
    } else {
        res.status(400).send('Missing organizationName');
    }
});

//-----------------------------------------------------------------------


// ผู้จัด แก้ไข รออนุมัติ
app.get('/api/activities-w', async (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ? AND ApproveActivity = "รออนุมัติ"';
        try {
            const [results] = await pool.query(query, [organizationName]);
            res.json(results); // ส่งผลลัพธ์กิจกรรมเฉพาะ organizationName ที่ตรงกันและต้องได้รับการ approve
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
    } else {
        res.status(400).send('Missing organizationName');
    }
});

// ผู้จัด แก้ไข อนุมัติ
app.get('/api/activities-y', async (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ? AND ApproveActivity = "Y"';
        try {
            const [results] = await pool.query(query, [organizationName]);
            res.json(results); // ส่งผลลัพธ์กิจกรรมเฉพาะ organizationName ที่ตรงกันและต้องได้รับการ approve
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
    } else {
        res.status(400).send('Missing organizationName');
    }
});

// ผู้จัด แก้ไข ไม่อนุมัติ
app.get('/api/activities-n', async (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ? AND ApproveActivity = "N"';
        try {
            const [results] = await pool.query(query, [organizationName]);
            res.json(results); // ส่งผลลัพธ์กิจกรรมเฉพาะ organizationName ที่ตรงกันและต้องได้รับการ approve
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
    } else {
        res.status(400).send('Missing organizationName');
    }
});

//-----------------------------------------------------------------------


// API สำหรับดึงข้อมูลกิจกรรมเฉพาะกิจกรรมที่ผ่านการอนุมัติ
app.get('/activities-y', async (req, res) => {
    const sql = 'SELECT * FROM activity WHERE ApproveActivity = "Y"';
    try {
        const [results] = await pool.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).send('Error fetching activities: ' + error.message);
    }
});

// API สำหรับดึงข้อมูลกิจกรรม
app.get('/activities', async (req, res) => {
    const sql = 'SELECT * FROM activity';
    try {
        const [results] = await pool.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).send('Error fetching activities: ' + error.message);
    }
});

// API สำหรับลบกิจกรรม
app.post('/delete-activity', async (req, res) => {
    const { Activityid } = req.body;
    const sql = 'DELETE FROM activity WHERE Activityid = ?';

    try {
        const [results] = await pool.query(sql, [Activityid]);
        if (results.affectedRows === 0) {
            return res.status(404).send('Activity not found');
        }
        res.status(200).send('Activity deleted successfully');
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).send('Error deleting activity: ' + error.message);
    }
});


//----------------------------------------------------

// Serve static files
app.use(express.static('public')); // public folder สำหรับไฟล์ static เช่น CSS

// Route for root path (localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // เปิด login.html เป็นหน้าแรก
});

app.post('/register', async (req, res) => {
    const { username, password, role,OrganizationName } = req.body;

    try {
        // ตรวจสอบว่าผู้ใช้ที่มี username นี้มีอยู่แล้วหรือไม่
        const [results] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (results.length > 0) {
            return res.status(400).send('Username already exists'); // แจ้งเตือนว่ามีผู้ใช้คนนี้อยู่แล้ว
        }

        // ถ้าผู้ใช้ไม่มีอยู่ ทำการแฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password, role, OrganizationName) VALUES (?, ?, ?, ?)';
        await pool.query(query, [username, hashedPassword, role,OrganizationName]);

        // สร้าง session ใหม่หลังการสมัครสำเร็จ
        req.session.user = username; // หรือข้อมูลที่คุณต้องการเก็บใน session

        // เมื่อสมัครเสร็จ ให้ redirect ไปยังหน้าลงชื่อเข้าใช้
        res.redirect('/'); // เปลี่ยนเป็น '/'
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).send('Internal server error');
    }
});

//----------------------------------------------------



// สร้างโทเค็น JWT หลังจากล็อกอินสำเร็จ
// const jwt = require('jsonwebtoken');  // ต้องติดตั้งด้วยคำสั่ง npm install jsonwebtoken

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Username:', username);
        console.log('Password:', password);

        const [results] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        console.log('Query results:', results); // ดูผลลัพธ์การค้นหา

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ user_id: user.id, role: user.role, organization: user.OrganizationName }, secretKey, { expiresIn: '1h' });
                console.log('Generated token:', token);
                res.json({ token });
            } else {
                console.log('Password mismatch for user:', username); // ตรวจสอบการเปรียบเทียบรหัสผ่าน
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            console.log('No user found with username:', username); // ไม่พบผู้ใช้
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// เส้นทางสำหรับออกจากระบบ
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
        res.redirect('/');
    });
});

// เส้นทางสำหรับตรวจสอบการล็อกอิน
app.get('/check-login', (req, res) => {
    if (req.session.userId) {
        res.status(200).send('ล็อกอินแล้ว');
    } else {
        res.status(401).send('ยังไม่ได้ล็อกอิน');
    }
});


// Route สำหรับแสดงหน้า signup
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html')); // เส้นทางไปยังไฟล์ signup.html
});

// Route สำหรับแสดงหน้า signup
app.get('/signup-o', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup-o.html')); // เส้นทางไปยังไฟล์ signup.html
});

// Route สำหรับแสดงหน้า signup
app.get('/signup-p', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup-p.html')); // เส้นทางไปยังไฟล์ signup.html
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/protected-route', isAuthenticated, (req, res) => {
    res.send('You are authorized to access this page');
});


// Route สำหรับแนะนำกิจกรรมตามชั่วโมงที่ขาด
app.get('/recommend-missing-activities', async (req, res) => {
    const studentId = req.query.student_id; // ดึง student_id จาก query

    try {
        // ดึงข้อมูลชั่วโมงกิจกรรมที่มีอยู่
        const [userActivities] = await pool.query(`
            SELECT ActivityCategoryID, SUM(ActivityHours) AS TotalHours
            FROM activityhistory
            WHERE student_id = ?
            GROUP BY ActivityCategoryID
        `, [studentId]);

        console.log('userActivities:', userActivities);

        // เก็บชั่วโมงที่มีอยู่เป็น key-value pair
        let userHours = {};
        userActivities.forEach(activity => {
            userHours[activity.ActivityCategoryID] = activity.TotalHours;
        });

        // เก็บชั่วโมงที่ต้องการในแต่ละหมวดหมู่
        const requiredHours = {
            'ACID01': 50, // กำหนดชั่วโมงที่ต้องการในหมวดหมู่ 1
            'ACID02': 50, // กำหนดชั่วโมงที่ต้องการในหมวดหมู่ 2
        };

        // คำนวณชั่วโมงที่ขาดในแต่ละหมวดหมู่
        let missingCategories = [];
        for (let category in requiredHours) {
            const userCurrentHours = userHours[category] || 0;
            if (userCurrentHours < requiredHours[category]) {
                missingCategories.push(category);
            }
        }

        console.log('missingCategories:', missingCategories);

        // ดึงกิจกรรมที่แนะนำตามหมวดหมู่ที่ขาดชั่วโมง
        if (missingCategories.length > 0) {
            // ใช้การ query ที่ถูกต้อง
            const [recommendedActivities] = await pool.query(`
                SELECT 
                    a.ActivityName, 
                    a.ActivityDate, 
                    a.StartTime,  
                    a.EndTime,  
                    a.ActivityHours, 
                    ac.ActivityCategoryName,  -- ดึง ActivityCategoryName จาก activitycategory
                    at.ActivityTypeName,  -- ดึง ActivityTypeName จาก activitytype
                    a.EventLocation,  
                    a.ApplicationChannel  
                FROM activity a
                LEFT JOIN activitytype at ON a.ActivityTypeID = at.ActivityTypeID  -- join ตาราง activitytype
                LEFT JOIN activitycategory ac ON a.ActivityCategoryID = ac.ActivityCategoryID  -- join ตาราง activitycategory
                WHERE a.ActivityCategoryID IN (?) AND (a.ApproveActivity = 'Y' OR a.ApproveActivity IS NULL)
            `, [missingCategories]);
            

            console.log('recommendedActivities:', recommendedActivities);

            // ดึงข้อมูลประเภทกิจกรรมจาก activitytype
            const [activityTypes] = await pool.query(`
                SELECT ActivityTypeID, ActivityTypeName 
                FROM activitytype
            `);

            const activityTypeMap = {};
            activityTypes.forEach(type => {
                activityTypeMap[type.ActivityTypeID] = type.ActivityTypeName;
            });

            // เพิ่มประเภทกิจกรรมใน recommendedActivities
            recommendedActivities.forEach(activity => {
                activity.ActivityTypeName = activityTypeMap[activity.ActivityTypeID] || 'ไม่ระบุ';
            });

            res.json({
                success: true,
                missingHours: requiredHours,
                recommendedActivities: recommendedActivities
            });
        } else {
            res.json({ success: false, message: "คุณมีชั่วโมงครบทุกหมวดหมู่แล้ว" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// Middleware สำหรับการตรวจสอบสิทธิ์
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('คุณต้องล็อกอินก่อน');
    }
}


app.post('/add-student', (req, res) => {
    const { studentID, name, year, department, program } = req.body;
    const query = `INSERT INTO students (studentID, name, year, department, program) VALUES (?, ?, ?, ?, ?)`;
    
    pool.query(query, [studentID, name, year, department, program], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student added successfully' });
    });
});

app.put('/update-student/:id', (req, res) => {
    const { studentID, name, year, department, program } = req.body;
    const query = `UPDATE students SET studentID = ?, name = ?, year = ?, department = ?, program = ? WHERE id = ?`;
    
    pool.query(query, [studentID, name, year, department, program, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student updated successfully' });
    });
});

app.delete('/delete-student/:id', (req, res) => {
    const query = `DELETE FROM students WHERE id = ?`;
    
    pool.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student deleted successfully' });
    });
});



app.use(bodyParser.json());

app.use(express.json());

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/get-activity-history/:studentId', async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const [rows] = await pool.query('SELECT * FROM activityhistory WHERE student_id = ?', [studentId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching activity history:', error);
        res.status(500).json({ message: 'Error fetching activity history' });
    }
});

// API สำหรับเพิ่มข้อมูลผู้เข้าร่วม
app.post('/add-participant', async (req, res) => {
    console.log('Request body:', req.body); // Log request body
    const { studentId, full_name, year, department, program } = req.body;

    // ตรวจสอบค่าที่ส่งมาเพื่อให้แน่ใจว่าไม่มีค่า null
    if (!studentId || !full_name || !year || !department || !program) {
        return res.status(400).send('ข้อมูลไม่ครบถ้วน');
    }

    const query = 'INSERT INTO PersonalInfo (student_id, full_name, year, department, program) VALUES (?, ?, ?, ?, ?)';
    
    try {
        const [result] = await pool.query(query, [studentId, full_name, year, department, program]);
        
        // ตรวจสอบว่ามีแถวถูกเพิ่มเข้าหรือไม่
        if (result.affectedRows > 0) {
            return res.status(201).send('เพิ่มข้อมูลสำเร็จ'); // ใช้ 201 สำหรับการสร้างทรัพยากรใหม่
        } else {
            return res.status(500).send('ไม่สามารถเพิ่มข้อมูลได้');
        }
    } catch (err) {
        console.error('Database error:', err); // Log database errors
        return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
});


// API สำหรับแก้ไขข้อมูลผู้เข้าร่วม
app.put('/update-participant/:studentId', async (req, res) => {
    const studentId = req.params.studentId; // ดึง student_id จากพารามิเตอร์ URL
    const data = req.body; // ข้อมูลใหม่จากฟอร์ม

    try {
        const [result] = await pool.query(
            `UPDATE PersonalInfo 
             SET full_name = ?, year = ?, department = ?, program = ? 
             WHERE student_id = ?`,
            [data.full_name, data.year, data.department, data.program, studentId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Update successful' });
        } else {
            res.status(404).json({ message: 'Participant not found' });
        }
    } catch (error) {
        console.error('Error updating participant:', error);
        res.status(500).json({ message: 'Error updating participant' });
    }
});

// API สำหรับลบข้อมูลผู้เข้าร่วม
app.delete('/delete-participant/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM PersonalInfo WHERE student_id = ?';
    
    try {
        const [result] = await pool.query(query, [id]);

        // ตรวจสอบว่ามีแถวถูกลบหรือไม่
        if (result.affectedRows > 0) {
            return res.status(200).send('ลบข้อมูลสำเร็จ');
        } else {
            return res.status(404).send('ไม่พบผู้เข้าร่วมที่ต้องการลบ');
        }
    } catch (err) {
        console.error('Database error:', err); // Log database errors
        return res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ดึงข้อมูลกิจกรรมทั้งหมดจาก Activity History
app.get('/get-activityhistory', async (req, res) => {
    const query = 'SELECT * FROM activityhistory'; // ดัดแปลงให้ตรงกับโครงสร้างของตาราง

    try {
        const [results] = await pool.query(query);
        res.json(results); // ส่งข้อมูลกลับในรูปแบบ JSON
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
});

// // บันทึกกิจกรรมใหม่ใน Activity History
// app.post('/record-activityhistory', async (req, res) => {
//     const { student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID } = req.body;

//     const query = `
//         INSERT INTO activityhistory (student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID)
//         VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     try {
//         const [result] = await pool.query(query, [student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID]);
//         console.log('ผลลัพธ์จากการเพิ่มข้อมูล:', result);
//         res.status(200).send('เพิ่มข้อมูลสำเร็จ');
//     } catch (err) {
//         console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
//         if (err.code === 'ER_DUP_ENTRY') {
//             return res.status(409).send('ข้อมูลกิจกรรมซ้ำสำหรับนักศึกษา');
//         }
//         res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
//     }
// });



// บันทึกกิจกรรมใหม่ใน Activity History พร้อมตรวจสอบรหัสนักศึกษา
app.post('/record-activityhistory', async (req, res) => {
    const { student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID } = req.body;

    // ตรวจสอบว่ารหัสนักศึกษาอยู่ในตาราง personalinfo หรือไม่
    const checkStudentQuery = 'SELECT * FROM personalinfo WHERE student_id = ?';
    const insertActivityQuery = `
        INSERT INTO activityhistory (student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        // ตรวจสอบว่ามีรหัสนักศึกษาอยู่ในตาราง personalinfo หรือไม่
        const [studentResult] = await pool.query(checkStudentQuery, [student_id]);

        if (studentResult.length === 0) {
            return res.status(400).send('รหัสนักศึกษาไม่ถูกต้อง หรือไม่มีในระบบ');
        }

        // ถ้ามีรหัสนักศึกษาอยู่ในระบบแล้ว ให้ทำการบันทึกกิจกรรม
        const [result] = await pool.query(insertActivityQuery, [student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID]);
        console.log('ผลลัพธ์จากการเพิ่มข้อมูล:', result);
        res.status(200).send('เพิ่มข้อมูลสำเร็จ');
    } catch (err) {
        console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('ข้อมูลกิจกรรมซ้ำสำหรับนักศึกษา');
        }
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
});

// server.js
app.get('/get-activity-categories', async (req, res) => {
    const query = 'SELECT ActivityCategoryID, ActivityCategoryName FROM activitycategory';

    try {
        const [results] = await pool.query(query);
        res.json(results); // ส่งข้อมูลหมวดหมู่กลับไปในรูปแบบ JSON
    } catch (error) {
        return res.status(500).send('Error fetching activity categories');
    }
});


// แก้ไขข้อมูลกิจกรรมใน Activity History
app.put('/update-activityhistory/:id', async (req, res) => {
    const activityId = req.params.id;
    const updatedActivity = req.body; // Get the updated data from the request body

    const query = 'UPDATE activityhistory SET ? WHERE activity_id = ?';
    try {
        const [results] = await pool.query(query, [updatedActivity, activityId]);
        if (results.affectedRows === 0) {
            return res.status(404).send('ไม่พบกิจกรรมที่ต้องการแก้ไข');
        }
        res.status(200).json({ message: 'Activity updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Database error' });
    }
});



// ลบกิจกรรม
app.delete('/delete-activityhistory/:id', async (req, res) => {
    const activityId = req.params.id;
    const query = 'DELETE FROM activityhistory WHERE activity_id = ?';
    try {
        const [result] = await pool.query(query, [activityId]);
        if (result.affectedRows === 0) {
            return res.status(404).send('ไม่พบกิจกรรมที่ต้องการลบ');
        }
        res.sendStatus(200);
    } catch (err) {
        return res.status(500).send('เกิดข้อผิดพลาดในการลบกิจกรรม');
    }
});


// Example route that uses async/await
app.get('/get-categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM activitycategory');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route สำหรับดึงวันที่ของกิจกรรมที่มีอยู่
app.get('/get-dates', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT DISTINCT ActivityDate FROM activity');
        const dates = results.map(row => row.ActivityDate);
        res.json(dates);
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).send('Server error');
    }
});

// Route สำหรับดึงประเภทกิจกรรม
app.get('/get-types', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM activitytype');
        res.json(results);
    } catch (error) {
        console.error('Error fetching types:', error);
        res.status(500).send('Server error');
    }
});

app.post('/recommend-activities', async (req, res) => {
    const { days, types, categories } = req.body;

    // Start building the SQL query
    let sql = `
        SELECT 
            a.ActivityName, 
            a.ActivityDate, 
            a.ActivityEndDate,  
            a.StartTime, 
            a.EndTime, 
            a.ActivityHours, 
            a.EventLocation, 
            ac.ActivityCategoryName, 
            at.ActivityTypeName, 
            a.ApplicationChannel
        FROM activity a
        JOIN activitycategory ac ON a.ActivityCategoryID = ac.ActivityCategoryID
        JOIN activitytype at ON a.ActivityTypeID = at.ActivityTypeID
        WHERE a.ApproveActivity = 'Y'
    `;
    
    let params = [];
    
    // Add filtering by day
    if (days && days.length > 0) {
        const placeholders = days.map(() => '?').join(', ');
        sql += ` AND a.DailyID IN (SELECT d.DailyID FROM dailyid d WHERE d.DailyName IN (${placeholders}))`;
        params.push(...days);
    }
    
    // Add filtering by type
    if (types && types.length > 0) {
        const placeholders = types.map(() => '?').join(', ');
        sql += ` AND a.ActivityTypeID IN (${placeholders})`;
        params.push(...types);
    }
    
    // Add filtering by category
    if (categories && categories.length > 0) {
        const placeholders = categories.map(() => '?').join(', ');
        sql += ` AND a.ActivityCategoryID IN (${placeholders})`;
        params.push(...categories);
    }

    try {
        // Execute the query
        const [results] = await pool.query(sql, params);

        // Prepare the response to handle multi-day activities
        const activities = results.map(activity => {
            const startDate = new Date(activity.ActivityDate);
            const endDate = activity.ActivityEndDate 
                ? new Date(activity.ActivityEndDate) 
                : new Date(activity.ActivityDate);  // ถ้าไม่มี ActivityEndDate ให้ใช้ ActivityDate เป็น endDate
        
            return {
                ActivityName: activity.ActivityName,
                ActivityDate: activity.ActivityDate,
                StartTime: activity.StartTime,
                EndTime: activity.EndTime,
                ActivityHours: activity.ActivityHours,
                EventLocation: activity.EventLocation,
                ActivityCategoryName: activity.ActivityCategoryName,
                ActivityTypeName: activity.ActivityTypeName,
                ApplicationChannel: activity.ApplicationChannel,
                start: startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
                end: endDate.toISOString().split('T')[0] // ใช้ endDate เพื่อแสดงถึงวันสิ้นสุด
            };
        });
        
        // Send back the detailed results
        res.json(activities);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).send('Server error');
    }
});



// Route สำหรับดึงวันของกิจกรรมที่มีอยู่
app.get('/get-activity-days', async (req, res) => {
    try {
        const sql = 'SELECT DISTINCT DAYNAME(ActivityDate) as dayName FROM activity WHERE ApproveActivity = "Y"';
        const [results] = await pool.query(sql);
        const days = results.map(row => row.dayName);
        res.json(days);
    } catch (error) {
        console.error('Error fetching activity days:', error);
        res.status(500).send('Server error');
    }
});

// Route สำหรับดึงกิจกรรมที่ได้รับการอนุมัติ
app.get('/get-events', async (req, res) => {
    try {
        const sqlQuery = 'SELECT ActivityName, ActivityDate, ActivityEndDate FROM activity WHERE ApproveActivity = "Y"';
        const [results] = await pool.query(sqlQuery);
        const events = results.map(activity => ({
            title: activity.ActivityName,
            start: activity.ActivityDate,
            end: activity.ActivityEndDate || activity.ActivityDate // ถ้ามี ActivityEndDate ให้ใช้ ไม่งั้นใช้ ActivityDate
        }));
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Server error');
    }
});



//     console.log(`App running on port ${port}`);
// });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});