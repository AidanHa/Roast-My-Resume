var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/new', function (req, res) {
	res.render('users/new');
});

// Login
router.get('/login', function (req, res) {
	res.render('users/login');
});


// Register User
router.post('/new', function (req, res) {
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;

	// Validation
	req.checkBody('email', 'Email is not valid').isEmail();
	var errors = req.validationErrors();
	if (errors) {
		req.flash('error', 'Not a Valid Email');
		res.redirect('/api/users/new');
	} else {
		//checking for email and username are already taken
		User.findOne({ username: { 
			"$regex": "^" + username + "\\b", "$options": "i"
	}}, function (err, user) {
			User.findOne({ email: { 
				"$regex": "^" + email + "\\b", "$options": "i"
		}}, function (err, mail) {
				if (user) {
					req.flash('error', 'Username is already taken');
					res.redirect('/api/users/new');
				} else if (mail) {
					req.flash('error', 'Email already exists');
					res.redirect('/api/users/new');
				}
				else {
					var newUser = new User({
						email: email,
						username: username,
						password: password
					});
					User.createUser(newUser, function (err, user) {
						if (err) throw err;
						console.log(user);
					});
         			req.flash('success_msg', 'You are registered and can now login');
					res.redirect('/api/users/login');
				}
			});
		});
	}
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/api/resumes', failureRedirect: '/api/users/login', failureFlash: true }),
	function (req, res) {
	});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/api/users/login');
});

module.exports = router;