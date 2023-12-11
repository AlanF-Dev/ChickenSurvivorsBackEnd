const database = require('./databaseConnection');

const getUser = async(data) => {
    let getUserSQL = `
        SELECT *
        FROM user
        WHERE username = (?);
    `;

    let param = [data.username];

    try{
        const results = await database.query(getUserSQL, param);
        return {user: results[0][0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const createUser = async(data) => {
    let createUserSQL = `
        INSERT INTO user
        (username, email, password)
        VALUES
        (?, ?, ?);
    `

    let param = [data.username, data.email, data.password];

    try{
        await database.query(createUserSQL, param);
        return {success: true}
    }
    catch(e){
        console.log(e);
        return {success: false}
    }
}

const save = async(data) => {
    let saveSQL = `
        UPDATE user
        SET wave = (?), time = (?), exp = (?), health = (?)
        WHERE user_id = (?);
    `

    let param = [data.wave, data.time, data.exp, data.health, data.user_id];

    try{
        await database.query(saveSQL, param);
        return {success: true}
    }
    catch(e){
        console.log(e);
        return {success: false}
    }
}

module.exports = {
    getUser, createUser, save
}