const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const { setupTestDB, teardownTestDB } = require('../fixtures/testData');

describe('Auth Integration Tests', () => {
 beforeAll(async () => {
   await setupTestDB();
 });

 afterAll(async () => {
   await teardownTestDB();
   await mongoose.connection.close();
 });

 beforeEach(async () => {
   await User.deleteMany({});
 });

 describe('POST /api/auth/register', () => {
   test('should register a new user with valid data', async () => {
     const newUser = {
       email: 'test@example.com',
       password: 'Test123!@#',
       username: 'testuser'
     };

     const res = await request(app)
       .post('/api/auth/register')
       .send(newUser)
       .expect(201);

     expect(res.body).toHaveProperty('user');
     expect(res.body).toHaveProperty('token');
     expect(res.body.user.email).toBe(newUser.email);
     expect(res.body.user.username).toBe(newUser.username);
     expect(res.body.user).not.toHaveProperty('password');
     expect(res.body.user).toHaveProperty('shadownewsEmail', 'testuser@shadownews.community');
     expect(res.body.user).toHaveProperty('karma', 0);
   });

   test('should not register user with existing email', async () => {
     const existingUser = await User.create({
       email: 'existing@example.com',
       password: 'Test123!@#',
       username: 'existinguser'
     });

     const res = await request(app)
       .post('/api/auth/register')
       .send({
         email: 'existing@example.com',
         password: 'Test123!@#',
         username: 'newusername'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('email already exists');
   });

   test('should not register user with existing username', async () => {
     await User.create({
       email: 'user1@example.com',
       password: 'Test123!@#',
       username: 'takenusername'
     });

     const res = await request(app)
       .post('/api/auth/register')
       .send({
         email: 'user2@example.com',
         password: 'Test123!@#',
         username: 'takenusername'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('username already taken');
   });

   test('should validate email format', async () => {
     const res = await request(app)
       .post('/api/auth/register')
       .send({
         email: 'invalidemail',
         password: 'Test123!@#',
         username: 'testuser'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('valid email');
   });

   test('should validate password strength', async () => {
     const res = await request(app)
       .post('/api/auth/register')
       .send({
         email: 'test@example.com',
         password: 'weak',
         username: 'testuser'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('password');
   });

   test('should auto-generate shadownews email', async () => {
     const res = await request(app)
       .post('/api/auth/register')
       .send({
         email: 'test@example.com',
         password: 'Test123!@#',
         username: 'cooluser'
       })
       .expect(201);

     expect(res.body.user.shadownewsEmail).toBe('cooluser@shadownews.community');
   });
 });

 describe('POST /api/auth/login', () => {
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true
     });
   });

   test('should login with valid credentials', async () => {
     const res = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: 'Test123!@#'
       })
       .expect(200);

     expect(res.body).toHaveProperty('user');
     expect(res.body).toHaveProperty('token');
     expect(res.body.user.email).toBe(testUser.email);
     expect(res.body.user.id).toBe(testUser._id.toString());
   });

   test('should login with username instead of email', async () => {
     const res = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'testuser',
         password: 'Test123!@#'
       })
       .expect(200);

     expect(res.body.user.username).toBe('testuser');
   });

   test('should not login with invalid password', async () => {
     const res = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: 'WrongPassword123!'
       })
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Invalid credentials');
   });

   test('should not login with non-existent user', async () => {
     const res = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'nonexistent@example.com',
         password: 'Test123!@#'
       })
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Invalid credentials');
   });

   test('should not login if email not verified', async () => {
     await User.findByIdAndUpdate(testUser._id, { isEmailVerified: false });

     const res = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: 'Test123!@#'
       })
       .expect(403);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('verify your email');
   });

   test('should update lastLogin timestamp', async () => {
     const beforeLogin = testUser.lastLogin;

     await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: 'Test123!@#'
       })
       .expect(200);

     const updatedUser = await User.findById(testUser._id);
     expect(updatedUser.lastLogin).not.toBe(beforeLogin);
     expect(new Date(updatedUser.lastLogin).getTime()).toBeGreaterThan(
       beforeLogin ? new Date(beforeLogin).getTime() : 0
     );
   });
 });

 describe('POST /api/auth/logout', () => {
   let authToken;
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true
     });

     authToken = jwt.sign(
       { userId: testUser._id, email: testUser.email },
       process.env.JWT_SECRET || 'test-secret',
       { expiresIn: '1h' }
     );
   });

   test('should logout authenticated user', async () => {
     const res = await request(app)
       .post('/api/auth/logout')
       .set('Authorization', `Bearer ${authToken}`)
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Logged out successfully');
   });

   test('should not logout without auth token', async () => {
     const res = await request(app)
       .post('/api/auth/logout')
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('authentication');
   });
 });

 describe('POST /api/auth/refresh', () => {
   let refreshToken;
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true
     });

     refreshToken = jwt.sign(
       { userId: testUser._id, type: 'refresh' },
       process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret',
       { expiresIn: '7d' }
     );

     testUser.refreshToken = refreshToken;
     await testUser.save();
   });

   test('should refresh token with valid refresh token', async () => {
     const res = await request(app)
       .post('/api/auth/refresh')
       .send({ refreshToken })
       .expect(200);

     expect(res.body).toHaveProperty('token');
     expect(res.body).toHaveProperty('refreshToken');
     expect(res.body.refreshToken).not.toBe(refreshToken);
   });

   test('should not refresh with invalid refresh token', async () => {
     const res = await request(app)
       .post('/api/auth/refresh')
       .send({ refreshToken: 'invalid-token' })
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Invalid refresh token');
   });

   test('should not refresh with expired refresh token', async () => {
     const expiredToken = jwt.sign(
       { userId: testUser._id, type: 'refresh' },
       process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret',
       { expiresIn: '-1s' }
     );

     const res = await request(app)
       .post('/api/auth/refresh')
       .send({ refreshToken: expiredToken })
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('expired');
   });
 });

 describe('POST /api/auth/verify-email', () => {
   let testUser;
   let verificationToken;

   beforeEach(async () => {
     verificationToken = 'test-verification-token-123';
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: false,
       emailVerificationToken: verificationToken,
       emailVerificationExpires: new Date(Date.now() + 3600000)
     });
   });

   test('should verify email with valid token', async () => {
     const res = await request(app)
       .post('/api/auth/verify-email')
       .send({ token: verificationToken })
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Email verified successfully');
     
     const updatedUser = await User.findById(testUser._id);
     expect(updatedUser.isEmailVerified).toBe(true);
     expect(updatedUser.emailVerificationToken).toBeNull();
   });

   test('should not verify email with invalid token', async () => {
     const res = await request(app)
       .post('/api/auth/verify-email')
       .send({ token: 'invalid-token' })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Invalid verification token');
   });

   test('should not verify email with expired token', async () => {
     await User.findByIdAndUpdate(testUser._id, {
       emailVerificationExpires: new Date(Date.now() - 3600000)
     });

     const res = await request(app)
       .post('/api/auth/verify-email')
       .send({ token: verificationToken })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('expired');
   });
 });

 describe('POST /api/auth/forgot-password', () => {
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true
     });
   });

   test('should send reset email for valid user', async () => {
     const res = await request(app)
       .post('/api/auth/forgot-password')
       .send({ email: 'test@example.com' })
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Password reset email sent');
     
     const updatedUser = await User.findById(testUser._id);
     expect(updatedUser.passwordResetToken).toBeTruthy();
     expect(updatedUser.passwordResetExpires).toBeTruthy();
   });

   test('should return success even for non-existent email', async () => {
     const res = await request(app)
       .post('/api/auth/forgot-password')
       .send({ email: 'nonexistent@example.com' })
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Password reset email sent');
   });
 });

 describe('POST /api/auth/reset-password', () => {
   let testUser;
   let resetToken;

   beforeEach(async () => {
     resetToken = 'test-reset-token-123';
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true,
       passwordResetToken: resetToken,
       passwordResetExpires: new Date(Date.now() + 3600000)
     });
   });

   test('should reset password with valid token', async () => {
     const newPassword = 'NewPassword123!@#';

     const res = await request(app)
       .post('/api/auth/reset-password')
       .send({
         token: resetToken,
         password: newPassword
       })
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Password reset successfully');
     
     const loginRes = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: newPassword
       })
       .expect(200);

     expect(loginRes.body).toHaveProperty('token');
   });

   test('should not reset password with invalid token', async () => {
     const res = await request(app)
       .post('/api/auth/reset-password')
       .send({
         token: 'invalid-token',
         password: 'NewPassword123!@#'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Invalid reset token');
   });

   test('should not reset password with weak password', async () => {
     const res = await request(app)
       .post('/api/auth/reset-password')
       .send({
         token: resetToken,
         password: 'weak'
       })
       .expect(400);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('password');
   });
 });

 describe('GET /api/auth/me', () => {
   let authToken;
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true,
       karma: 100,
       repositories: ['repo1', 'repo2']
     });

     authToken = jwt.sign(
       { userId: testUser._id, email: testUser.email },
       process.env.JWT_SECRET || 'test-secret',
       { expiresIn: '1h' }
     );
   });

   test('should get current user profile', async () => {
     const res = await request(app)
       .get('/api/auth/me')
       .set('Authorization', `Bearer ${authToken}`)
       .expect(200);

     expect(res.body).toHaveProperty('user');
     expect(res.body.user.email).toBe(testUser.email);
     expect(res.body.user.username).toBe(testUser.username);
     expect(res.body.user.karma).toBe(100);
     expect(res.body.user).not.toHaveProperty('password');
   });

   test('should not get profile without auth token', async () => {
     const res = await request(app)
       .get('/api/auth/me')
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('authentication');
   });

   test('should not get profile with invalid token', async () => {
     const res = await request(app)
       .get('/api/auth/me')
       .set('Authorization', 'Bearer invalid-token')
       .expect(401);

     expect(res.body).toHaveProperty('error');
   });
 });

 describe('PUT /api/auth/update-profile', () => {
   let authToken;
   let testUser;

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash('Test123!@#', 10),
       username: 'testuser',
       isEmailVerified: true
     });

     authToken = jwt.sign(
       { userId: testUser._id, email: testUser.email },
       process.env.JWT_SECRET || 'test-secret',
       { expiresIn: '1h' }
     );
   });

   test('should update user profile', async () => {
     const updates = {
       bio: 'New bio text',
       website: 'https://example.com',
       interests: ['#AI', '#blockchain']
     };

     const res = await request(app)
       .put('/api/auth/update-profile')
       .set('Authorization', `Bearer ${authToken}`)
       .send(updates)
       .expect(200);

     expect(res.body.user.bio).toBe(updates.bio);
     expect(res.body.user.website).toBe(updates.website);
     expect(res.body.user.interests).toEqual(updates.interests);
   });

   test('should not update protected fields', async () => {
     const res = await request(app)
       .put('/api/auth/update-profile')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         email: 'newemail@example.com',
         karma: 9999,
         isEmailVerified: false
       })
       .expect(200);

     expect(res.body.user.email).toBe(testUser.email);
     expect(res.body.user.karma).toBe(0);
     expect(res.body.user.isEmailVerified).toBe(true);
   });
 });

 describe('POST /api/auth/change-password', () => {
   let authToken;
   let testUser;
   const oldPassword = 'Test123!@#';

   beforeEach(async () => {
     testUser = await User.create({
       email: 'test@example.com',
       password: await require('bcrypt').hash(oldPassword, 10),
       username: 'testuser',
       isEmailVerified: true
     });

     authToken = jwt.sign(
       { userId: testUser._id, email: testUser.email },
       process.env.JWT_SECRET || 'test-secret',
       { expiresIn: '1h' }
     );
   });

   test('should change password with correct old password', async () => {
     const newPassword = 'NewPassword123!@#';

     const res = await request(app)
       .post('/api/auth/change-password')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         oldPassword,
         newPassword
       })
       .expect(200);

     expect(res.body).toHaveProperty('message', 'Password changed successfully');

     const loginRes = await request(app)
       .post('/api/auth/login')
       .send({
         email: 'test@example.com',
         password: newPassword
       })
       .expect(200);

     expect(loginRes.body).toHaveProperty('token');
   });

   test('should not change password with incorrect old password', async () => {
     const res = await request(app)
       .post('/api/auth/change-password')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         oldPassword: 'WrongPassword123!',
         newPassword: 'NewPassword123!@#'
       })
       .expect(401);

     expect(res.body).toHaveProperty('error');
     expect(res.body.error).toContain('Incorrect password');
   });
 });
});