const bcrypt = require('bcrypt');
const { sqlConnection } = require('../config/db');
const jwt = require('jsonwebtoken');


exports.proLogin = async ({email, password})=>{
    const query = 'SELECT * FROM pro WHERE email =?';
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [email], async (err, result)=>{
            if(err) return reject(err);
            if(result.length === 0) return reject(new Error('Pro n\'existe pas'));
            const user = result[0]
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return reject(new Error('Invalid credentials'))

            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'});
            resolve({token})
        })
    })
};

exports.addService = async (req, res) => {
    const { proId, services } = req.body;
    if (!proId || !services || services.length === 0) {
      return res.status(400).json({ message: 'ProId ou services manquants' });
    }
  
    const query = 'INSERT INTO pro_services (pro_id, service_id) VALUES ?';
   
  
    return new Promise((resolve, reject)=>{
        sqlConnection.query(query, [proId, services], (err, result)=>{
            if(err) return reject(err);
            resolve({id: result.insertId})
        })
    })
};

exports.getServices = async (proId) => {
    const query = 'SELECT * FROM pro_services WHERE pro_id = ?';

    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [proId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

exports.getAllServices = async () => {
    const query = 'SELECT * FROM services';
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.addAvailability = async (proId, availability) => {
    const query = 'INSERT INTO pro_availabilities (pro_id, date, start_time, end_time) VALUES ?';
    const values = availability.map(slot => [proId, slot.date, slot.start_time, slot.end_time]);

    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [values], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

exports.getAvailabilities = async (serviceId, date) => {
    const query = 'SELECT * FROM availabilities WHERE service_id = ? AND date = ?';
    return new Promise((resolve, reject) => {
        sqlConnection.query(query, [serviceId, date], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};