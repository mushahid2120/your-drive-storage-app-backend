import express from 'express'
import {  sendOtpApi } from '../Controller/otpController.js'

const otpRouter=express.Router()

otpRouter.post('/send',sendOtpApi)

export default otpRouter
