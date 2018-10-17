# Reminder.ai

A reminder app featuring time-progress alerts, email notifications, and speech recognition (set reminder by speech)

## Demo

* [Live Demo](https://reminder-ai.herokuapp.com/)

## Screenshots

Landing Page:

<img src="https://github.com/by12380/Reminder-ai/blob/master/screenshots/landing-page.jpg" width="600px"/>

Dashboard (To-do-list) Page:

<img src="https://github.com/by12380/Reminder-ai/blob/master/screenshots/dashboard.jpg" width="600px"/>

Speech Recognition Page:

<img src="https://github.com/by12380/Reminder-ai/blob/master/screenshots/speech-recognition.jpg" width="600px"/>

## Documentation

#### GET /reminder
Returns all reminders
##### Authentication Required (session cookie)
##### Request Parameters
None
##### Response Body

```
[{
	id: String,
	title: String,
	dueDate: Date,
	startDate: Date,
	memo: String,
	emailNotification: Boolean,
	setAlert: Boolean,
	progressAlert: String,
	percentProgress: Number
}]
```
| Property Name | Description |
| --- | --- |
| id | The ID for the reminder |
| title | The title of the reminder     |
| startDate | The start time set for the reminder |
| dueDate | The due time set for the reminder |
| memo | The memo written down for the reminder |
| emailNotification | Whether the app will send email notifications of the reminder to the user if any alerts for the reminder is set |
| setAlert | Whether alerts for the reminder is set. If set, push noitications to app will be sent by default |
| progressAlert | The frequency of alerts set for the reminder. There are four types: 'On every 50% progress', 'On every 25% progress', 'On every 20% progress', 'On every 10% progress' |
| percentProgress | The percentage of time that has past  between its start time and now compared to the due time of the reminder|

---

#### POST /reminder
Create a reminder
##### Authentication Required (session cookie)
##### Request Body
```
{
    title: String (required),
    dueDate: Date,
    startDate: Date,
    memo: String,
    setAlert: Boolean,
    progressAlert: String
    emailNotification: Boolean,
}
```

| Property Name | Description |
| --- | --- |
| title | The title of the reminder. (Required)|
| startDate | The start time for the reminder. Must set to enable progress alerts. |
| dueDate | The due time for the reminder |
| memo | The memo for the reminder |
| setAlert | Whether to set progress alerts for the reminder. If set, push noitications of the progress alerts will be sent to app. Set to 'false' by default if startDate is null.|
| progressAlert | If setAlert is 'true', the frequency of alerts to set for the reminder. There are four options: 'On every 50% progress', 'On every 25% progress', 'On every 20% progress', and 'On every 10% progress'. |
| emailNotification | Whether the app will send email notifications of the reminder to the user if any alerts for the reminder is set |

##### Response Body

```
[{
	id: String,
	title: String,
	dueDate: Date,
	startDate: Date,
	memo: String,
	emailNotification: Boolean,
	setAlert: Boolean,
	progressAlert: String,
	percentProgress: Number
}]
```
Desciption: Same as GET response body.

---

#### PUT /reminder/{id}
Update a reminder
##### Authentication Required (session cookie)
##### Route Parameter
| Field | Description |
| --- | --- |
| id | The ID of the reminder to be updated (Required)|
##### Request Body
```
{
    title: String,
    dueDate: Date,
    startDate: Date,
    memo: String,
    setAlert: Boolean,
    progressAlert: String
    emailNotification: Boolean,
}
(All fields are optional)
```
Description: Same as POST request body

##### Response Body

```
[{
	id: String,
	title: String,
	dueDate: Date,
	startDate: Date,
	memo: String,
	emailNotification: Boolean,
	setAlert: Boolean,
	progressAlert: String,
	percentProgress: Number
}]
```
Desciption: Same as GET response body.

---

#### DELETE /reminder/{id}
Delete a reminder
##### Authentication Required (session cookie)
##### Route Parameter
| Field | Description |
| --- | --- |
| id | The ID of the reminder to be deleted (Required)|
##### Request
None
##### Response Body
None

Status code 204 if success.




## Built With
### Front-End (HTML + CSS + JavaScript)

JQuery / Md-Bootstrap / D3.js / Bootbox.js / Moment.js

### Back-End (Node.js + MongoDb)

Express.js / Passport.js / Socket.io / Nodemailer / Node-schedule

### Testing

Chai / Mocha / Faker.js


## Powered By

* Wit.ai API
