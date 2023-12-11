const database = require('./databaseConnection');

const getUser = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, password, drip, theme
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
        return {success: false}
    }
}

module.exports = {
    getUser, createUser
}