import express from 'express'
import { cancelSubscription, createSubscription, getSubscription, upgradeSubscription } from '../Controller/subscriptionController.js'
import checkAuth from '../middleware/authCheckMW.js'

const subscriptionRouter=express.Router()

subscriptionRouter.get('/',checkAuth,getSubscription)
subscriptionRouter.post('/',checkAuth,createSubscription)
subscriptionRouter.put('/upgrade',checkAuth,upgradeSubscription)
subscriptionRouter.delete('/',checkAuth,cancelSubscription)

export default subscriptionRouter
