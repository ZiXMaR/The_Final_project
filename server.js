const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const session = require('express-session');
const bcrypt = require('bcrypt'); // ใช้สำหรับการ hash password
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey);

const cors = require('cors');

app.use(express.urlencoded({ extended: true }));

// Set up database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'project_2',
    port: 8889
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


// Serve the main page
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the Organizer page
app.get('/organizer/:organizationName', (req, res) => {
    const organizationName = decodeURIComponent(req.params.organizationName);
    res.sendFile(path.join(__dirname, 'organizer.html'));
});

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

// Serve static files
app.use(express.static('public')); // public folder สำหรับไฟล์ static เช่น CSS

// Route for root path (localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // เปิด login.html เป็นหน้าแรก
});


//-------------------------------------------------------------

// ฟังก์ชันสร้าง ActivityID อัตโนมัติ
async function generateActivityId() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT Activityid FROM activity ORDER BY Activityid DESC LIMIT 1';
        pool.query(sql, (error, results) => {
            if (error) return reject(error);

            let newId = 'AID001'; // ค่าเริ่มต้น
            if (results.length > 0) {
                const lastId = results[0].Activityid;
                const lastNumber = parseInt(lastId.replace('AID', ''));
                const newNumber = lastNumber + 1;
                newId = `AID${String(newNumber).padStart(3, '0')}`;
            }
            resolve(newId);
        });
    });
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
                res.status(500).send('Error inserting activity: ' + error.message);
                return;
            }
            res.status(200).send('Activity added successfully with ID: ' + activity.Activityid);
        });
    } catch (error) {
        console.error('Error generating Activity ID:', error);
        res.status(500).send('Error generating Activity ID: ' + error.message);
    }
});

//----------------------------------------------

// ดึงข้อมูลกิจกรรมทั้งหมด
app.get('/api/activities', (req, res) => {
    const sql = 'SELECT * FROM activity';
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching activity');
        } else {
            console.log(result); // ตรวจสอบข้อมูลที่ดึงมา
            res.json(result);
        }
    });
});

// ดึงข้อมูลกิจกรรมตาม Activityid
app.get('/api/activities/:Activityid', (req, res) => {
    const { Activityid } = req.params;
    pool.query('SELECT * FROM activity WHERE Activityid = ?', [Activityid], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result[0]);
    });
});

// อัปเดตข้อมูลกิจกรรม
app.put('/api/activities/:Activityid', (req, res) => {
    const activityId = req.params.Activityid;
    const { ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime,
        OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline,
        SemesterAcademicYear, AcademicYear, Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate
    } = req.body;

    // ตัวอย่าง SQL query เพื่ออัปเดตข้อมูล
    const sql = `
        UPDATE activity SET 
            ActivityCategoryID = ?, ActivityTypeID = ?, ActivityName = ?, ActivityDate = ?, DailyID = ?, ActivityHours = ?, 
            StartTime = ?, EndTime = ?, OrganizationName = ?, EventLocation = ?, NumberOfApplications = ?, 
            ApplicationChannel = ?, ApplicationDeadline = ?, SemesterAcademicYear = ?, AcademicYear = ?, 
            Department = ?, Major = ?, ActivityDescription = ?, ApproveActivity = ?, ActivityEndDate = ?
        WHERE Activityid = ?`;

    // const values = [ActivityName, OrganizationName, ActivityDate, ActivityEndDate, StartTime, EndTime, activityId];

    pool.query(sql, [
        ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime,
        OrganizationName, EventLocation, NumberOfApplications, ApplicationChannel, ApplicationDeadline,
        SemesterAcademicYear, AcademicYear, Department, Major, ActivityDescription, ApproveActivity, ActivityEndDate,
        activityId
    ],
        (err, result) => {
            if (err) {
                console.error(err);
                if (!res.headersSent) {
                    // ส่ง error response หากยังไม่มีการส่ง response มาก่อน
                    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
                }
            } else {
                if (!res.headersSent) {
                    // ส่ง response สำเร็จกลับไปยัง client เพียงครั้งเดียว
                    return res.status(200).json({ message: 'อัปเดตสำเร็จ!' });
                }
            }



        });
});

//-----------------------------------------------------------------------

//ลบกิจกรรม ผู้จัด ล็อกอิน
app.get('/activities-d', (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ?';
        pool.query(query, [organizationName], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results); // ส่งผลลัพธ์กิจกรรมกลับไป
        });
    } else {
        res.status(400).send('Missing organizationName');
    }
});


//แก้ไขกิจกรรม ผู้จัด ล็อกอิน
app.get('/api/activities-e', (req, res) => {
    const organizationName = req.query.organizationName; // รับค่า organizationName จาก query string

    if (organizationName) {
        const query = 'SELECT * FROM activity WHERE OrganizationName = ?';
        pool.query(query, [organizationName], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json(results); // ส่งผลลัพธ์กิจกรรมเฉพาะ organizationName ที่ตรงกันกลับไป
        });
    } else {
        res.status(400).send('Missing organizationName');
    }
});




//------------------------------------------------------------------------


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

//----------------------------------------------------

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


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';

    pool.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = user.username;
                req.session.role = user.role;

                // ตรวจสอบ role
                if (user.role === 'admin') {
                    res.redirect('/admin');
                } else if (user.role === 'organizer') {
                    // ดึง OrganizationName จากตาราง users โดยตรง
                    const organizationName = user.OrganizationName;
                    if (organizationName) {
                        // เปลี่ยนเส้นทางไปยัง URL ที่มี OrganizationName
                        res.redirect(`/organizerHome/${organizationName}`);
                    } else {
                        // res.send('No organization found for this organizer');
                        res.redirect(`/organizerHome/${organizationName}`);
                    }
                } else if (user.role === 'participant') {
                    res.redirect('/participant');
                } else {
                    res.redirect('/dashboard'); // หรือหน้าอื่นๆ ที่ต้องการ
                }
            } else {
                res.send('Invalid password');
            }
        } else {
            res.send('Invalid username or password');
        }
    });
});


// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     const query = 'SELECT * FROM users WHERE username = ?';

//     pool.query(query, [username], async (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).send('Internal server error');
//         }

//         if (results.length > 0) {
//             const user = results[0];
//             const match = await bcrypt.compare(password, user.password);
//             if (match) {
//                 req.session.user = user.username;
//                 req.session.role = user.role; // บันทึก role ลงใน session
//                 // นำไปยังหน้าเฉพาะตาม role
//                 if (user.role === 'admin') {
//                     res.redirect('/admin');
//                 } else if (user.role === 'organizer') {
//                     res.redirect('/organizerHome');
//                 } else if (user.role === 'participant') {
//                     res.redirect('/participant');
//                 } else {
//                     res.redirect('/dashboard'); // หรือหน้าอื่นๆ ที่ต้องการ
//                 }
//             } else {
//                 res.send('Invalid password');
//             }
//         } else {
//             res.send('Invalid username or password');
//         }
//     });
// });


// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('You need to log in first');
    }
}

// app.post('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) return res.status(500).send('Error logging out');
//         res.send('Logged out successfully');
//     });
// });

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/');
    });
});

app.get('/check-login', (req, res) => {
    if (req.session.userId) {
        res.status(200).send('Logged in');
    } else {
        res.status(401).send('Not logged in');
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


app.post('/add-student', (req, res) => {
    const { studentID, name, year, department, program } = req.body;
    const query = `INSERT INTO students (studentID, name, year, department, program) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [studentID, name, year, department, program], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student added successfully' });
    });
});

app.put('/update-student/:id', (req, res) => {
    const { studentID, name, year, department, program } = req.body;
    const query = `UPDATE students SET studentID = ?, name = ?, year = ?, department = ?, program = ? WHERE id = ?`;

    db.query(query, [studentID, name, year, department, program, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student updated successfully' });
    });
});

app.delete('/delete-student/:id', (req, res) => {
    const query = `DELETE FROM students WHERE id = ?`;

    db.query(query, [req.params.id], (err, result) => {
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
    const { user_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours } = req.body;

    const query = `
        INSERT INTO activityhistory (user_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(query, [user_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours], (err, result) => {
        if (err) {
            console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
            res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
            return;
        }
        res.status(200).send('เพิ่มข้อมูลสำเร็จ');
    });
});

// แก้ไขข้อมูลกิจกรรมใน Activity History
app.put('/update-activityhistory', (req, res) => {
    const { user_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours, activity_id } = req.body;
    const query = 'UPDATE activityhistory SET user_id = ?, activity_name = ?, activity_date = ?, is_promoted = ?, competency_hours = ?, interest_hours = ? WHERE activity_id = ?';
    pool.query(query, [user_id, activity_name, activity_date, is_promoted, competency_hours, interest_hours, activity_id], (err, result) => {
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

// app.listen(port, () => {
//     console.log(`App running on port ${port}`);
// });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});