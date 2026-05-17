import express from 'express'
import { handleRazorpayWebhook } from '../Controller/webhookController.js'

const webhooksRouter=express.Router()

webhooksRouter.post('/storageapp',handleRazorpayWebhook)

export default webhooksRouter