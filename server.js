const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // ประกาศเพียงครั้งเดียว
const bodyParser = require('body-parser');
const cors = require('cors');

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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // ใช้สำหรับรับข้อมูลจากฟอร์ม HTML


//--------------------------------------------------------------------

// db.connect(err => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('Connected to the database');
// });


//--------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'))); // โฟลเดอร์ที่เก็บไฟล์ static

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the Organizer page
app.get('/organizer', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizer.html'));
});

// // Serve the OrganizerEdit page
// app.get('/organizerEdit', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/organizerEdit.html'));
// });

// Serve the OrganizerDelet page
app.get('/organizerDelet', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizerDelet.html'));
});

// Serve the OrganizerHome page
app.get('/organizerHome', (req, res) => {
    res.sendFile(path.join(__dirname, 'organizerHome.html'));
});

// // Serve the OrganizerEditHome page
// app.get('/organizerEditHome', (req, res) => {
//     res.sendFile(path.join(__dirname, 'organizerEditHome.html'));
// });



//------------------------------------------------------------------

// Serve the Participant page
app.get('/participant', (req, res) => {
    res.sendFile(path.join(__dirname, 'participant.html'));
});

// Serve the Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
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
        'DID1': [1],
        'DID2': [2],
        'DID3': [3],
        'DID4': [4],
        'DID5': [5],
        'DID6': [6],
        'DID7': [0],
        'DID8': [1, 2],
        'DID9': [2, 3],
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
    const {ActivityCategoryID, ActivityTypeID, ActivityName, ActivityDate, DailyID, ActivityHours, StartTime, EndTime, 
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

//-----------------------------------------------------------------------

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
