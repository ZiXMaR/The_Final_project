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
    const { username, password, role } = req.body;

    try {
        // ตรวจสอบว่าผู้ใช้ที่มี username นี้มีอยู่แล้วหรือไม่
        const [results] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (results.length > 0) {
            return res.status(400).send('Username already exists'); // แจ้งเตือนว่ามีผู้ใช้คนนี้อยู่แล้ว
        }

        // ถ้าผู้ใช้ไม่มีอยู่ ทำการแฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await pool.query(query, [username, hashedPassword, role]);

        // สร้าง session ใหม่หลังการสมัครสำเร็จ
        req.session.user = username; // หรือข้อมูลที่คุณต้องการเก็บใน session

        // เมื่อสมัครเสร็จ ให้ redirect ไปยังหน้าลงชื่อเข้าใช้
        res.redirect('/'); // เปลี่ยนเป็น '/'
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).send('Internal server error');
    }
});





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
                const token = jwt.sign({ user_id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
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
                SELECT ActivityName, ActivityDate, ActivityHours, ActivityCategoryID
                FROM activity
                WHERE ActivityCategoryID IN (?) AND (ApproveActivity = 'Y' OR ApproveActivity IS NULL)
            `, [missingCategories]);
            ;

            console.log('recommendedActivities:', recommendedActivities);

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

// บันทึกกิจกรรมใหม่ใน Activity History
app.post('/record-activityhistory', async (req, res) => {
    const { student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID } = req.body;

    const query = `
        INSERT INTO activityhistory (student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID]);
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



// บันทึกกิจกรรมใหม่ใน Activity History
app.post('/record-activityhistory', async (req, res) => {
    const { student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID } = req.body;

    const query = `
        INSERT INTO activityhistory (student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [student_id, ActivityName, activity_date, is_promoted, ActivityHours, ActivityCategoryID]);
        console.log('ผลลัพธ์จากการเพิ่มข้อมูล:', result);
        res.status(200).send('เพิ่มข้อมูลสำเร็จ');
    } catch (err) {
        // เพิ่มข้อความแจ้งเตือนเกี่ยวกับข้อมูลซ้ำ
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('ข้อมูลกิจกรรมซ้ำสำหรับนักศึกษา');
        }
        console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
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