const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const session = require('express-session');
const bcrypt = require('bcrypt'); // ใช้สำหรับการ hash password
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey);

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

// Set up database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'demo_project'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to MySQL database');
        connection.release(); // ปล่อยการเชื่อมต่อ
    }
});

// Add session middleware
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true when using https
}));

// Serve static files
app.use(express.static('public')); // public folder สำหรับไฟล์ static เช่น CSS

// Route for root path (localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // เปิด login.html เป็นหน้าแรก
});

app.post('/register', async (req, res) => {
    const { username, password, role } = req.body; // รับข้อมูลจากฟอร์มสมัคร
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password ด้วย bcrypt

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    pool.query(query, [username, hashedPassword, role], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send('Error registering user');
        }
        
        // สร้าง session ใหม่หลังการสมัครสำเร็จ
        req.session.user = username; // หรือข้อมูลที่คุณต้องการเก็บใน session

        // เมื่อสมัครเสร็จ ให้ redirect ไปยังหน้าลงชื่อเข้าใช้
        res.redirect('/'); // เปลี่ยนเป็น '/'
    });
});


// สร้างโทเค็น JWT หลังจากล็อกอินสำเร็จ
// const jwt = require('jsonwebtoken');  // ต้องติดตั้งด้วยคำสั่ง npm install jsonwebtoken

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    pool.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ user_id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

// Middleware สำหรับการตรวจสอบสิทธิ์
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('คุณต้องล็อกอินก่อน');
    }
}

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/protected-route', isAuthenticated, (req, res) => {
    res.send('You are authorized to access this page');
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the Organizer page
app.get('/organizer', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizer.html'));
});

// Serve the Participant page
app.get('/participant', (req, res) => {
    res.sendFile(path.join(__dirname, 'participant.html'));
});

// Serve the Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

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

// Route for adding activities (Organizer)
app.post('/add-activity', (req, res) => {
    const activity = req.body;

    const sql = `INSERT INTO activity (
        Activityid, ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime, 
        OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline, SemesterAcademicYear, AcademicYear, 
        Department, Major, ActivityDescription, ApproveActivity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        activity.Activityid, activity.ActivityCategoryID, activity.ActivityTypeID, activity.ActivityName, activity.ActivityDate, 
        activity.DailyID, activity.ActivityHours, activity.StartTime, activity.EndTime, activity.OrganizationName, activity.EventLocation, 
        activity.NumberOfApplications, activity.ApplicationChannel, activity.ApplicationDeadline, activity.SemesterAcademicYear, 
        activity.AcademicYear, activity.Department, activity.Major, activity.ActivityDescription, activity.ApproveActivity
    ];

    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting activity:', error);
            res.status(500).send('Error inserting activity: ' + error.message);
            return;
        }
        res.status(200).send('Activity added successfully');
    });
});

app.use(bodyParser.json());

app.use(express.json());

// API สำหรับเพิ่มข้อมูลผู้เข้าร่วม
app.post('/add-participant', (req, res) => {
    console.log('Request body:', req.body); // Log request body
    const { studentId, full_name, year, department, program } = req.body;
    
    // ตรวจสอบค่าที่ส่งมาเพื่อให้แน่ใจว่าไม่มีค่า null
    if (!studentId || !full_name || !year || !department || !program) {
        return res.status(400).send('ข้อมูลไม่ครบถ้วน');
    }

    const query = 'INSERT INTO PersonalInfo (student_id, full_name, year, department, program) VALUES (?, ?, ?, ?, ?)';
    
    pool.query(query, [studentId, full_name, year, department, program], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log database errors
            res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
            return;
        }
        res.status(200).send('เพิ่มข้อมูลสำเร็จ');
    });
});

// API สำหรับแก้ไขข้อมูลผู้เข้าร่วม
app.put('/update-participant/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, year, department, program } = req.body;
    const query = 'UPDATE PersonalInfo SET full_name = ?, year = ?, department = ?, program = ? WHERE student_id = ?';
    pool.query(query, [full_name, year, department, program, id], (err, result) => {
        if (err) {
            res.status(500).send('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
            return;
        }
        res.status(200).send('แก้ไขข้อมูลสำเร็จ');
    });
});


// API สำหรับลบข้อมูลผู้เข้าร่วม
app.delete('/delete-participant/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM PersonalInfo WHERE student_id = ?';
    pool.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
            return;
        }
        res.status(200).send('ลบข้อมูลสำเร็จ');
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// เส้นทางเพื่อแสดง activityhistory.html
app.get('/activityhistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'activityhistory.html')); // ตรวจสอบว่าไฟล์อยู่ในตำแหน่งที่ถูกต้อง
});

app.get('/get-activityhistory', (req, res) => {
    const sql = 'SELECT * FROM activityhistory';
    
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching activity history:', error);
            res.status(500).send('Error fetching activity history');
            return;
        }
        res.json(results);
    });
});

// บันทึกกิจกรรมใหม่ใน Activity History
app.post('/record-activityhistory', (req, res) => {
    const { student_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours } = req.body;

    const query = `
        INSERT INTO activityhistory (student_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    pool.query(query, [student_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours], (err, result) => {
        if (err) {
            // เพิ่มข้อความแจ้งเตือนเกี่ยวกับข้อมูลซ้ำ
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('ข้อมูลกิจกรรมซ้ำสำหรับนักศึกษา');
            }
            console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
            res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
            return;
        }
        console.log('ผลลัพธ์จากการเพิ่มข้อมูล:', result);
        res.status(200).send('เพิ่มข้อมูลสำเร็จ');
    });
});


// แก้ไขข้อมูลกิจกรรมใน Activity History
app.put('/update-activityhistory', (req, res) => {
    const { activity_name, activity_date, is_promoted, competency_hours, interest_hours, activity_id } = req.body;
    const query = 'UPDATE activityhistory SET activity_name = ?, activity_date = ?, is_promoted = ?, competency_hours = ?, interest_hours = ? WHERE activity_id = ?';
    pool.query(query, [activity_name, activity_date, is_promoted, competency_hours, interest_hours, activity_id], (err, result) => {
        if (err) {
            return res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตกิจกรรม');
        }
        res.sendStatus(200);
    });
});



// ลบกิจกรรม
app.delete('/delete-activityhistory/:id', (req, res) => {
    const activityId = req.params.id;
    const query = 'DELETE FROM activityhistory WHERE activity_id = ?';
    pool.query(query, [activityId], (err, result) => {
        if (err) {
            return res.status(500).send('เกิดข้อผิดพลาดในการลบกิจกรรม');
        }
        res.sendStatus(200);
    });
});


app.post('/activity-recommendations', (req, res) => {
    const { days, types, categories } = req.body;

    let sql = 'SELECT * FROM activity WHERE ApproveActivity = "Y"';
    let params = [];

    if (days && days.length > 0) {
        sql += ' AND DailyID IN (SELECT DailyID FROM dailyid WHERE `Daily Name` IN (?))';
        params.push(days);
    }

    if (types && types.length > 0) {
        sql += ' AND ActivityTypeID IN (?)';
        params.push(types);
    }

    if (categories && categories.length > 0) {
        sql += ' AND ActivityCategoryID IN (?)';
        params.push(categories);
    }

    pool.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error fetching recommended activities:', error);
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

// Route สำหรับดึงกิจกรรมที่ได้รับการอนุมัติ
app.get('/get-events', (req, res) => {
    const sqlQuery = 'SELECT ActivityName, ActivityDate, EndTime FROM activity WHERE ApproveActivity = "Y"';
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const events = results.map(activity => ({
                title: activity.ActivityName,
                start: activity.ActivityDate,
                end: activity.EndTime || activity.ActivityDate  // ถ้าไม่มี EndTime ให้ใช้ ActivityDate แทน
            }));
            res.json(events);
        }
    });
});

//     console.log(`App running on port ${port}`);
// });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});