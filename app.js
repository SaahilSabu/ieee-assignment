//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const uid = require("uid2");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/take-homeDB", {useNewUrlParser: true});

const UserSchema = {
  username: String,
  uid: String
};

const MeetingSchema = {
  uid1: String,
  uid2: String,
  date: String
};

const User = mongoose.model("User", UserSchema);
const Meeting = mongoose.model("Meeting", MeetingSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/users/create", (req, res) => {
  res.render("newUser");
});

app.get("/meeting/create", (req, res) => {
  res.render("newMeeting");
});

app.post("/users/new", (req, res) => {                            //add new user
  const userName = req.body.username;
  const id = uid(10);
  const user = new User({username: userName, uid: id});
  user.save();
  res.redirect("/");
});

app.post("/meeting/new", (req, res) => {        //add new meeting
  const uidFirst = req.body.uid_1;
  const uidSecond = req.body.uid_2;
  const date = req.body.date;
  User.findOne({                           //to check uid input from user and uid present in db.
    uid: uidFirst
  }, (err, ifFound) => {
    if (err) {
      console.log(err);
    } else if (ifFound) {
      User.findOne({
        uid: uidSecond
      }, (err, ifFound) => {
        if (ifFound) {
          const meeting = new Meeting({uid1: uidFirst, uid2: uidSecond, date: date});
          meeting.save();
          res.redirect("/");
        } else {
          res.render("error");
        }
      });
    } else {
      res.render("error");
    }
  });
});

app.get("/users/all", (req, res) => {               //show all users
  User.find({}, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      res.render("allUsers", {users: foundUser});
    }
  });
});

app.get("/meeting/all", (req, res) => {        //show all meetings
  Meeting.find({}, (err, foundMeeting) => {
    if (err) {
      console.log(err);
    } else {
      res.render("allmeetings", {meeting: foundMeeting});
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});