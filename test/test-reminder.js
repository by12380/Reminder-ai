const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const Reminder = require('../models/reminder');
const Notification = require('../models/notifications');
const User = require('../models/user');

const { runServer, app, closeServer } = require('../app');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function tearDownDb() {
    return new Promise((resolve, reject) => {
      console.warn('Deleting database');
      mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
}

function seedReminderData(testUserId) {
    const seedData = [];
    for (let i = 1; i <= 5; i++) {
      seedData.push({
          user_id: testUserId,
          title: faker.lorem.words(2),
          dueDate: new Date(),
          memo: faker.lorem.sentence
      });
    }
    // this will return a promise
    return Reminder.insertMany(seedData);
}

describe('Reminders API endpoints', function(){

    let agent;
    let testUser;

    before(function(){
        return runServer(TEST_DATABASE_URL);
    })

    beforeEach(async function(){
        agent = chai.request.agent(app);
        const registerInfo = {
            name: 'John',
            email: 'test@gmail.com',
            password: '12345',
            confirmPassword: '12345'
        }
        await agent.post('/register').send(registerInfo);
        testUser = await User.findOne({'local.email': registerInfo.email});
        return seedReminderData(testUser.id);
    })

    afterEach(function(){
        agent.close();
        testUser = null;
        return tearDownDb();
    })

    after(function(){
        return closeServer();
    })

    describe('GET endpoint', function(){

        it('Should return all reminders that belong to test user', async function(){
            let res = await agent.get('/reminder');
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.length.of.at.least(1);

            let count = await Reminder.find({user_id: testUser.id}).count();
            expect(res.body).to.have.lengthOf(count);
        })

        it('All reminders should return with the right fields', async function(){
            let res =  await agent.get('/reminder');
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length.of.at.least(1);
            const reminders_db = await Reminder.find({user_id: testUser.id});
            res.body.forEach(function(reminder, index){
                expect(reminder).to.be.a('object');
                expect(reminder).to.include.keys('id', 'title', 'dueDate', 'memo', 'percentProgress');
                expect(reminder.title).to.equal(reminders_db[index].title);
                expect(reminder.dueDate).to.equal(reminders_db[index].dueDate.toJSON());
                expect(reminder.memo).to.equal(reminders_db[index].memo);
            })
        })
    })


    describe('POST endpoint', function(){

        it('Should add a new reminder', async function(){
            //Set dueDate by one day off from now
            let dueDate = new Date();
            dueDate.setDate(dueDate.getDate()+1);

            const newReminder = {
                user_id: testUser.id,
                title: faker.lorem.words(2),
                dueDate: dueDate,
                startDate: new Date(),
                memo: faker.lorem.sentence(),
                setAlert: true,
                progressAlert: 'On every 25% progress'
            }

            let res = await agent.post('/reminder').send(newReminder);
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(['_id', 'title', 'dueDate', 'startDate', 'setAlert', 'progressAlert', 'user_id']);

            //Check if response object matches user input object
            expect(res.body.title).to.equal(newReminder.title);
            expect(res.body.dueDate).to.equal(newReminder.dueDate.toJSON());
            expect(res.body.startDate).to.equal(newReminder.startDate.toJSON());
            expect(res.body.memo).to.equal(newReminder.memo);
            expect(res.body.setAlert).to.equal(newReminder.setAlert);
            expect(res.body.progressAlert).to.equal(newReminder.progressAlert);
            expect(res.body.user_id).to.equal(newReminder.user_id);

            //Check if response object matches stored database object
            let reminder_db = await Reminder.findById(res.body._id);
            expect(res.body.title).to.equal(reminder_db.title);
            expect(res.body.dueDate).to.equal(reminder_db.dueDate.toJSON());
            expect(res.body.startDate).to.equal(reminder_db.startDate.toJSON());
            expect(res.body.memo).to.equal(reminder_db.memo);
            expect(res.body.setAlert).to.equal(reminder_db.setAlert);
            expect(res.body.progressAlert).to.equal(reminder_db.progressAlert);
            expect(res.body.user_id).to.equal(reminder_db.user_id);

            //Check if stored reminder created appropricate child documents (notifications)
            let notifications_db = await Notification.find({reminder_id: res.body._id});
            expect(notifications_db).has.lengthOf(5);
            //Expected percentProgress values
            const percentProgressValues = [25, 50, 75, 70, 100];
            notifications_db.forEach(function(notification, index){
                expect(notification.title).to.equal(res.body.title);
                expect(notification.body).to.equal(res.body.memo);
                expect(notification.userEamil).to.equal(testUser.email);
                expect(notification.percentProgress).to.equal(percentProgressValues[index]);
            })
        })
    })

    describe('PUT endpoint', function(){

        it('Should update fields to a reminder', async function(){
            //Set dueDate by one day off from now
            let newDueDate = new Date();
            newDueDate.setDate(newDueDate.getDate()+1);

            const updateData = {
                title: faker.lorem.words(2),
                dueDate: newDueDate,
                memo: faker.lorem.sentence(),
            }

            let reminder_db = await Reminder.findOne({user_id: testUser._id});

            let res = await agent.put(`/reminder/${reminder_db.id}`).send(updateData);
            // Check if response object matches updated data
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(['_id', 'title', 'dueDate', 'memo', 'user_id']);
            expect(res.body.title).to.equal(updateData.title);
            expect(res.body.dueDate).to.equal(updateData.dueDate.toJSON());
            expect(res.body.memo).to.equal(updateData.memo);

            // Check if updated data are stored in database
            let updated_reminder_db = await Reminder.findById(res.body._id);
            expect(res.body.title).to.equal(updated_reminder_db.title);
            expect(res.body.dueDate).to.equal(updated_reminder_db.dueDate.toJSON());
            expect(res.body.memo).to.equal(updated_reminder_db.memo);
            expect(res.body.user_id).to.equal(testUser.id);
        })
    })

    describe('DELETE endpoint', function(){

        it('Should delete reminder and all child documents (notifications)', async function(){

            let reminder_db = await Reminder.findOne({user_id: testUser._id});

            let res = await agent.delete(`/reminder/${reminder_db.id}`);
            expect(res).to.have.status(204);

            // Check if reminder still exist
            let reminder_count = await Reminder.findById(reminder_db.id).count();
            expect(reminder_count).to.equal(0);

            // Check if any child documents (notifications) exist
            let notifications_count = await Notification.find({reminder_id: reminder_db.id}).count();
            expect(notifications_count).to.equal(0);

        })
    })
})