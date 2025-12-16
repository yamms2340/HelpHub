const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  try {
    const header = req.header('Authorization')
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization denied' })

    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
